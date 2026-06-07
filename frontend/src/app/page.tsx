"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCard from "@/components/StatsCard";
import { getAllStudents, getAttendanceReport } from "@/lib/api";

export default function DashboardPage() {
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(null);

  useEffect(() => {
    getAllStudents()
      .then((s) => setTotalStudents(s.length))
      .catch(() => setTotalStudents(0));

    const today = new Date().toISOString().split("T")[0];
    getAttendanceReport(today, 1)
      .then((r) => setTodayCount(r.length))
      .catch(() => setTodayCount(0));
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Welcome to <span className="gradient-text">FaceAttend</span>
        </h1>
        <p className="text-muted mt-2 text-lg">
          AI-powered smart attendance management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Total Students"
          value={totalStudents !== null ? totalStudents : "—"}
          color="accent"
          delay={0}
        />
        <StatsCard
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Today's Attendance (P1)"
          value={todayCount !== null ? todayCount : "—"}
          color="success"
          delay={100}
        />


      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/register" className="group">
            <div className="glass-card p-6 flex flex-col items-center text-center gap-3 group-hover:border-accent/40">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="font-semibold">Register Student</h3>
              <p className="text-xs text-muted">Add new students with face photos</p>
            </div>
          </Link>

          <Link href="/recognize" className="group">
            <div className="glass-card p-6 flex flex-col items-center text-center gap-3 group-hover:border-cyan/40">
              <div className="w-14 h-14 rounded-2xl bg-cyan/10 flex items-center justify-center text-cyan group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">Mark Attendance</h3>
              <p className="text-xs text-muted">Start webcam face recognition</p>
            </div>
          </Link>

          <Link href="/report" className="group">
            <div className="glass-card p-6 flex flex-col items-center text-center gap-3 group-hover:border-success/40">
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold">View Reports</h3>
              <p className="text-xs text-muted">Attendance reports by date &amp; period</p>
            </div>
          </Link>
        </div>
      </div>


    </div>
  );
}
