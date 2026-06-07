from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class Student(Base):
    __tablename__ = "students"

    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    roll_no      = Column(String, unique=True, nullable=False)
    branch       = Column(String)
    photo_path   = Column(String)           # path to saved photo
    face_encoding = Column(Text)            # 128 numbers stored as JSON string

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    date       = Column(String)
    period     = Column(Integer)
    status     = Column(String, default="present")
    marked_at  = Column(DateTime, server_default=func.now())