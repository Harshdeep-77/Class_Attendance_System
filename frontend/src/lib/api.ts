import type {
  Student,
  AttendanceRecord,
  RecognitionResult,
  RegisterResponse,
  Branch,
  Subject,
} from "./types";

export const API_BASE = "http://localhost:8000";

/* ── Students ────────────────────────── */

export async function registerStudent(
  data: { name: string; roll_no: string; branch_id: number; semester: number },
  photos: File[]
): Promise<RegisterResponse> {
  const form = new FormData();
  form.append("name", data.name);
  form.append("roll_no", data.roll_no);
  form.append("branch_id", data.branch_id.toString());
  form.append("semester", data.semester.toString());
  photos.forEach((p, i) => form.append(`photo${i + 1}`, p));

  const res = await fetch(`${API_BASE}/students/register`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function getAllStudents(): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/students/`);
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function studentLogin(name: string, roll_no: string): Promise<{ message: string; student: Student }> {
  const res = await fetch(`${API_BASE}/students/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, roll_no })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

/* ── Attendance ──────────────────────── */

export async function recognizeFace(
  photo: Blob,
  period: number,
  subject_id: number
): Promise<RecognitionResult> {
  const form = new FormData();
  form.append("photo", photo, "frame.jpg");

  const res = await fetch(`${API_BASE}/attendance/recognize?period=${period}&subject_id=${subject_id}`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error("Recognition request failed");
  return res.json();
}

export function getStudentPhotoUrl(rollNo: string): string {
  return `${API_BASE}/attendance/photo/${rollNo}`;
}

export async function getAttendanceReport(
  date: string,
  period: number,
  subject_id: number
): Promise<AttendanceRecord[]> {
  const res = await fetch(`${API_BASE}/attendance/report/${date}/${period}/${subject_id}`);
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export async function getStudentAttendance(roll_no: string): Promise<import("./types").StudentAttendanceHistory> {
  const res = await fetch(`${API_BASE}/attendance/student/${roll_no}`);
  if (!res.ok) throw new Error("Failed to fetch attendance history");
  return res.json();
}

/* ── Academic ────────────────────────── */

export async function getBranches(): Promise<Branch[]> {
  const res = await fetch(`${API_BASE}/academic/branches`);
  if (!res.ok) throw new Error("Failed to fetch branches");
  return res.json();
}

export async function createBranch(name: string, total_semesters: number): Promise<Branch> {
  const res = await fetch(`${API_BASE}/academic/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, total_semesters }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create branch" }));
    throw new Error(err.detail || "Failed to create branch");
  }
  return res.json();
}

export async function getSubjects(branch_id?: number, semester?: number): Promise<Subject[]> {
  const params = new URLSearchParams();
  if (branch_id) params.append("branch_id", branch_id.toString());
  if (semester) params.append("semester", semester.toString());
  
  const res = await fetch(`${API_BASE}/academic/subjects?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch subjects");
  return res.json();
}

export async function createSubject(name: string, branch_id: number, semester: number): Promise<Subject> {
  const res = await fetch(`${API_BASE}/academic/subjects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, branch_id, semester }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to create subject" }));
    throw new Error(err.detail || "Failed to create subject");
  }
  return res.json();
}
