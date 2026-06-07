import type {
  Student,
  AttendanceRecord,
  RecognitionResult,
  RegisterResponse,
} from "./types";

const API_BASE = "http://localhost:8000";

/* ── Students ────────────────────────── */

export async function registerStudent(
  data: { name: string; roll_no: string; branch: string },
  photos: File[]
): Promise<RegisterResponse> {
  const form = new FormData();
  form.append("name", data.name);
  form.append("roll_no", data.roll_no);
  form.append("branch", data.branch);
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

/* ── Attendance ──────────────────────── */

export async function recognizeFace(
  photo: Blob,
  period: number
): Promise<RecognitionResult> {
  const form = new FormData();
  form.append("photo", photo, "frame.jpg");

  const res = await fetch(`${API_BASE}/attendance/recognize?period=${period}`, {
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
  period: number
): Promise<AttendanceRecord[]> {
  const res = await fetch(`${API_BASE}/attendance/report/${date}/${period}`);
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}
