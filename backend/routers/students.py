from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Student
from face_utils import encode_face_from_bytes, average_encodings, encoding_to_db
import shutil, os

router = APIRouter(prefix="/students", tags=["Students"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/register")
async def register_student(
    name: str = Form(...),
    roll_no: str = Form(...),
    branch: str = Form(...),
    photo1: UploadFile = File(..., description="Face photo 1"),
    photo2: UploadFile = File(..., description="Face photo 2"),
    photo3: UploadFile = File(..., description="Face photo 3"),
    photo4: UploadFile = File(..., description="Face photo 4"),
    db: Session = Depends(get_db)
):
    # Check if roll number already exists
    existing = db.query(Student).filter(Student.roll_no == roll_no).first()
    if existing:
        raise HTTPException(status_code=400, detail="Roll number already registered")

    photos = [photo1, photo2, photo3, photo4]

    # Step 1: Get encoding from each photo
    encodings = []
    for photo in photos:
        image_bytes = await photo.read()
        encoding = encode_face_from_bytes(image_bytes)

        if encoding is None:
            raise HTTPException(
                status_code=400,
                detail=f"No face detected in photo: {photo.filename}. Please retake."
            )
        encodings.append(encoding)

    # Step 2: Average the 4 encodings into one robust vector
    final_encoding = average_encodings(encodings)

    # Step 3: Save one photo to disk (use first photo as profile pic)
    first_photo = photos[0]
    first_photo.file.seek(0)  # reset after reading
    photo_path = f"{UPLOAD_DIR}/{roll_no}.jpg"
    with open(photo_path, "wb") as f:
        shutil.copyfileobj(first_photo.file, f)

    # Step 4: Save student to DB
    student = Student(
        name=name,
        roll_no=roll_no,
        branch=branch,
        photo_path=photo_path,
        face_encoding=encoding_to_db(final_encoding)
    )
    db.add(student)
    db.commit()
    db.refresh(student)

    return {
        "message": "Student registered successfully",
        "student_id": student.id,
        "name": student.name,
        "roll_no": student.roll_no
    }


@router.get("/")
def get_all_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return [
        {"id": s.id, "name": s.name, "roll_no": s.roll_no, "branch": s.branch}
        for s in students
    ]