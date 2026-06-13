"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentAttendance } from "@/lib/api";
import type { StudentAttendanceHistory } from "@/lib/types";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [rollNo, setRollNo] = useState<string | null>(null);
  const [history, setHistory] = useState<StudentAttendanceHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("student_name");
    const storedRollNo = localStorage.getItem("student_roll_no");

    if (!storedRollNo) {
      router.push("/student/login");
      return;
    }

    setName(storedName);
    setRollNo(storedRollNo);

    getStudentAttendance(storedRollNo)
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load attendance", err);
        setLoading(false);
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("student_roll_no");
    localStorage.removeItem("student_name");
    router.push("/student/login");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, <span className="gradient-text">{name}</span>
          </h1>
          <p className="text-muted mt-2">Roll No: {rollNo}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary text-sm self-start sm:self-auto">
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center text-success">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-muted font-medium mb-1">Total Attendance</p>
            <p className="text-4xl font-bold text-success-light">{history?.total_attendance || 0}</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Attendance History</h2>
        </div>
        
        {history?.records && history.records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface/50 text-muted text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Subject</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Period</th>
                  <th className="p-4 font-medium">Time Marked</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {history.records.map((r, i) => (
                  <tr key={i} className="hover:bg-surface/30 transition-colors">
                    <td className="p-4 whitespace-nowrap font-medium text-accent-light">{r.subject_name || "N/A"}</td>
                    <td className="p-4 whitespace-nowrap">{r.date}</td>
                    <td className="p-4 whitespace-nowrap">Period {r.period}</td>
                    <td className="p-4 whitespace-nowrap text-muted text-sm">{new Date(r.marked_at).toLocaleString()}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success-light border border-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow"></span>
                        Present
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted">
            <svg className="w-12 h-12 mx-auto text-muted/50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No attendance records found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
