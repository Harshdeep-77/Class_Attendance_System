from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    total_semesters = Column(Integer, nullable=False)

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # "admin" or "user"
    branch_id = Column(Integer, ForeignKey("branches.id"), nullable=True)
    semester = Column(Integer, nullable=True)

class Student(Base):
    __tablename__ = "students"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    roll_no      = Column(String, unique=True, nullable=False)
    branch_id    = Column(Integer, ForeignKey("branches.id"), nullable=True)
    semester     = Column(Integer, nullable=True)
    photo_path   = Column(String)           # path to saved photo
    face_encoding = Column(Text)            # 128 numbers stored as JSON string

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    date       = Column(String)
    period     = Column(Integer)
    status     = Column(String, default="present")
    marked_at  = Column(DateTime, server_default=func.now())