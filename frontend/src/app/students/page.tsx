"use client";

import { useEffect, useState } from "react";
import { getAllStudents, getStudentPhotoUrl, API_BASE } from "@/lib/api";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllStudents()
      .then(setStudents)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(search.toLowerCase()) ||
      s.branch_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="gradient-text">All Students</span>
            </h1>
            <a
              href={`${API_BASE}/students/download`}
              className="px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Excel
            </a>
          </div>
          <p className="text-muted mt-1">
            {students.length} registered student{students.length !== 1 && "s"}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <div className="flex gap-10  ">
            <div>


              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

            </div>

            <input
              type="text"
              className="input pl-30   "
              placeholder="Search by name, roll no, or branch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 skeleton" />
                  <div className="h-3 w-20 skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && students.length === 0 && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent-light mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Students Registered</h3>
          <p className="text-muted text-sm mb-4">Get started by registering your first student</p>
          <a href="/register" className="btn-primary inline-block">Register Student</a>
        </div>
      )}

      {/* Students Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((student, i) => (
            <div
              key={student.id}
              className="glass-card p-5 animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getStudentPhotoUrl(student.roll_no)}
                  alt={student.name}
                  className="w-14 h-14 rounded-xl object-cover border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56' fill='%23f1f5f9'%3E%3Crect width='56' height='56' rx='12'/%3E%3Ctext x='28' y='33' text-anchor='middle' fill='%2394a3b8' font-size='20'%3E?%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{student.name}</h3>
                  <p className="text-sm text-muted truncate">{student.roll_no}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">
                    {student.branch_name}
                  </span>
                  <p className="text-sm text-muted truncate">{student.semester} Sem</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No search results */}
      {!loading && filtered.length === 0 && students.length > 0 && (
        <div className="glass-card p-8 text-center animate-fade-in">
          <p className="text-muted">No students matching &ldquo;{search}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
