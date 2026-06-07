from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Student, AttendanceRecord
from face_utils import encode_face_from_bytes, find_match
from datetime import date

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/recognize")
async def recognize_student(
    period: int,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Called every 2 seconds from Next.js webcam.
    Returns matched student info or 'no match'.
    """
    image_bytes = await photo.read()

    # Step 1: Get encoding from live camera frame
    live_encoding = encode_face_from_bytes(image_bytes)

    if live_encoding is None:
        return {"matched": False, "reason": "No face detected in frame"}

    # Step 2: Load all students from DB and compare
    all_students = db.query(Student).all()
    matched_student, confidence = find_match(live_encoding, all_students)
    if matched_student is None:
        return {"matched": False, "reason": "Face not recognized"}

    # Step 3: Check if attendance already marked today for this period
    today = str(date.today())
    already_marked = db.query(AttendanceRecord).filter(
        AttendanceRecord.student_id == matched_student.id,
        AttendanceRecord.date == today,
        AttendanceRecord.period == period
    ).first()

    if already_marked:
        return {
            "matched": True,
            "already_marked": True,
            "confidence": confidence,
            "student": {
                "name": matched_student.name,
                "roll_no": matched_student.roll_no,
                "branch": matched_student.branch,
                "photo_url": f"/students/photo/{matched_student.roll_no}"
            }
        }
    # Step 4: Mark attendance
    record = AttendanceRecord(
        student_id=matched_student.id,
        date=today,
        period=period,
        status="present"
    )
    db.add(record)
    db.commit()

    return {
        "matched": True,
        "already_marked": False,
        "confidence": confidence,
        "student": {
            "name": matched_student.name,
            "roll_no": matched_student.roll_no,
            "branch": matched_student.branch,
            "photo_url": f"/students/photo/{matched_student.roll_no}"
        }
    }


@router.get("/photo/{roll_no}")
def get_student_photo(roll_no: str, db: Session = Depends(get_db)):
    """Returns the student's saved photo — called by Next.js to show face."""
    student = db.query(Student).filter(Student.roll_no == roll_no).first()
    if not student or not student.photo_path:
        raise HTTPException(status_code=404, detail="Photo not found")
    return FileResponse(student.photo_path)


@router.get("/report/{date_str}/{period}")
def get_attendance_report(date_str: str, period: int, db: Session = Depends(get_db)):
    """Get all present students for a specific date and period."""
    records = db.query(AttendanceRecord).filter(
        AttendanceRecord.date == date_str,
        AttendanceRecord.period == period
    ).all()

    result = []
    for r in records:
        student = db.query(Student).filter(Student.id == r.student_id).first()
        result.append({
            "name": student.name,
            "roll_no": student.roll_no,
            "marked_at": str(r.marked_at)
        })
    return result