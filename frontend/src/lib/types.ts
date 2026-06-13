export interface Student {
  id: number;
  name: string;
  roll_no: string;
  branch_id: number;
  branch_name?: string;
  semester: number;
}

export interface Branch {
  id: number;
  name: string;
  total_semesters: number;
}

export interface Subject {
  id: number;
  name: string;
  semester: number;
  branch_id: number;
}

export interface AttendanceRecord {
  name: string;
  roll_no: string;
  marked_at: string;
}

export interface RecognitionResult {
  matched: boolean;
  already_marked?: boolean;
  confidence?: number;
  reason?: string;
  student?: {
    name: string;
    roll_no: string;
    branch_id: number;
    semester: number;
    photo_url: string;
  };
}

export interface RegisterResponse {
  message: string;
  student_id: number;
  name: string;
  roll_no: string;
}

export interface StudentAttendanceHistory {
  total_attendance: number;
  records: {
    date: string;
    period: number;
    marked_at: string;
    subject_name?: string;
  }[];
}
