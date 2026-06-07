export interface Student {
  id: number;
  name: string;
  roll_no: string;
  branch: string;
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
    branch: string;
    photo_url: string;
  };
}

export interface RegisterResponse {
  message: string;
  student_id: number;
  name: string;
  roll_no: string;
}
