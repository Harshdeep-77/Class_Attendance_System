from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import models
from database import get_db
from typing import List

router = APIRouter(
    prefix="/academic",
    tags=["Academic Structure"]
)

# --- Pydantic Schemas ---
class BranchCreate(BaseModel):
    name: str
    total_semesters: int

class BranchResponse(BaseModel):
    id: int
    name: str
    total_semesters: int

    class Config:
        from_attributes = True

class SubjectCreate(BaseModel):
    name: str
    semester: int
    branch_id: int

class SubjectResponse(BaseModel):
    id: int
    name: str
    semester: int
    branch_id: int

    class Config:
        from_attributes = True

# --- Endpoints ---

@router.post("/branches", response_model=BranchResponse, status_code=status.HTTP_201_CREATED)
def create_branch(branch: BranchCreate, db: Session = Depends(get_db)):
    db_branch = db.query(models.Branch).filter(models.Branch.name == branch.name).first()
    if db_branch:
        raise HTTPException(status_code=400, detail="Branch already exists")
    
    new_branch = models.Branch(name=branch.name, total_semesters=branch.total_semesters)
    db.add(new_branch)
    db.commit()
    db.refresh(new_branch)
    return new_branch

@router.get("/branches", response_model=List[BranchResponse])
def get_branches(db: Session = Depends(get_db)):
    return db.query(models.Branch).all()

@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    # Verify branch exists and semester is valid
    db_branch = db.query(models.Branch).filter(models.Branch.id == subject.branch_id).first()
    if not db_branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    if subject.semester < 1 or subject.semester > db_branch.total_semesters:
        raise HTTPException(status_code=400, detail=f"Invalid semester. Branch {db_branch.name} has {db_branch.total_semesters} semesters.")

    db_subject = db.query(models.Subject).filter(
        models.Subject.name == subject.name,
        models.Subject.branch_id == subject.branch_id,
        models.Subject.semester == subject.semester
    ).first()
    
    if db_subject:
        raise HTTPException(status_code=400, detail="Subject already exists for this branch and semester")
    
    new_subject = models.Subject(
        name=subject.name, 
        semester=subject.semester, 
        branch_id=subject.branch_id
    )
    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)
    return new_subject

@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(branch_id: int = None, semester: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Subject)
    if branch_id:
        query = query.filter(models.Subject.branch_id == branch_id)
    if semester:
        query = query.filter(models.Subject.semester == semester)
    return query.all()
