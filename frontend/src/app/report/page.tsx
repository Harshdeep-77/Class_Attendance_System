"use client";

import { useState } from "react";
import { getAttendanceReport, API_BASE } from "@/lib/api";
import type { AttendanceRecord } from "@/lib/types";

export default function ReportPage() {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [period, setPeriod] = useState(1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    setFetched(false);
    try {
      const data = await getAttendanceReport(date, period);
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Attendance Reports</span>
        </h1>
        <p className="text-muted mt-1">
          View attendance records by date and period
        </p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm text-muted mb-1.5">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-sm text-muted mb-1.5">Period</label>
            <select
              className="input"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                <option key={p} value={p}>
                  Period {p}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            onClick={handleFetch}
            disabled={loading}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
            Fetch Report
          </button>
        </div>
      </div>

      {/* Results */}
      {fetched && (
        <div className="animate-fade-in">
          {records.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center text-warning mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">No Records Found</h3>
              <p className="text-sm text-muted">
                No attendance was marked on {date} for Period {period}
              </p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              {/* Summary bar */}
              <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h3 className="font-semibold">
                    {date} — Period {period}
                  </h3>
                  <a
                    href={`${API_BASE}/attendance/report/${date}/${period}/download`}
                    className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Excel
                  </a>
                </div>
                <span className="px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium text-center w-full sm:w-auto">
                  {records.length} Present
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted">
                      <th className="px-6 py-3 font-medium">#</th>
                      <th className="px-6 py-3 font-medium">Name</th>
                      <th className="px-6 py-3 font-medium">Roll No</th>
                      <th className="px-6 py-3 font-medium">Marked At</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 hover:bg-surface-light/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <td className="px-6 py-4 text-muted">{i + 1}</td>
                        <td className="px-6 py-4 font-medium">{r.name}</td>
                        <td className="px-6 py-4 text-muted">{r.roll_no}</td>
                        <td className="px-6 py-4 text-muted font-mono text-xs">
                          {r.marked_at}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md bg-success/10 text-success text-xs font-medium">
                            Present
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
