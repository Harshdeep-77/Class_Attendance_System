"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Webcam from "@/components/Webcam";
import { recognizeFace, getStudentPhotoUrl, getBranches, getSubjects } from "@/lib/api";
import type { RecognitionResult, Branch, Subject } from "@/lib/types";
import { showToast } from "@/components/Toast";

interface SessionEntry {
  id: number;
  result: RecognitionResult;
  time: string;
}

export default function RecognizePage() {
  const [period, setPeriod] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [lastResult, setLastResult] = useState<RecognitionResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [sessionLog, setSessionLog] = useState<SessionEntry[]>([]);
  const counterRef = useRef(0);

  // New states for academic filters
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [branchId, setBranchId] = useState<number | "">("");
  const [semester, setSemester] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");

  useEffect(() => {
    getBranches().then(setBranches).catch(console.error);
  }, []);

  // Fetch subjects when branch or semester changes
  useEffect(() => {
    if (branchId !== "" && semester !== "") {
      getSubjects(Number(branchId), Number(semester)).then(setSubjects).catch(console.error);
    } else {
      setSubjects([]);
    }
  }, [branchId, semester]);

  const handleFrame = useCallback(
    async (blob: Blob) => {
      if (processing || subjectId === "") return;
      setProcessing(true);
      try {
        const result = await recognizeFace(blob, period, Number(subjectId));
        setLastResult(result);
        if (result.matched && !result.already_marked) {
          counterRef.current += 1;
          setSessionLog((prev) => [
            {
              id: counterRef.current,
              result,
              time: new Date().toLocaleTimeString(),
            },
            ...prev,
          ]);
        }
      } catch {
        setLastResult({ matched: false, reason: "Server error" });
      } finally {
        setProcessing(false);
      }
    },
    [period, processing, subjectId]
  );

  const statusColor = !lastResult
    ? "border-border"
    : lastResult.matched
    ? lastResult.already_marked
      ? "border-warning/60"
      : "border-success/60 glow-success"
    : "border-danger/60 glow-danger";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Mark Attendance</span>
          </h1>
          <p className="text-muted mt-1">
            Face recognition powered by ArcFace AI
          </p>
        </div>
      </div>

      {/* Class Selection */}
      <div className="glass-card p-4 animate-fade-in flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-muted mb-1.5">Branch</label>
          <select
            className="input"
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value === "" ? "" : Number(e.target.value));
              setSemester("");
              setSubjectId("");
            }}
            disabled={isActive}
          >
            <option value="">-- Select Branch --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-muted mb-1.5">Semester</label>
          <select
            className="input"
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value === "" ? "" : Number(e.target.value));
              setSubjectId("");
            }}
            disabled={isActive || branchId === ""}
          >
            <option value="">-- Select Semester --</option>
            {Array.from({ length: branches.find(b => b.id === Number(branchId))?.total_semesters || 0 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm text-muted mb-1.5">Subject</label>
          <select
            className="input"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={isActive || semester === ""}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="w-24">
          <label className="block text-sm text-muted mb-1.5">Period</label>
          <select
            className="input"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            disabled={isActive}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          {/* Start / Stop */}
          <button
            className={isActive ? "btn-secondary border-danger text-danger w-full sm:w-auto" : "btn-primary w-full sm:w-auto"}
            onClick={() => {
              if (!isActive && subjectId === "") {
                showToast("Please select Branch, Semester, and Subject first", "error");
                return;
              }
              setIsActive(!isActive);
              if (isActive) setLastResult(null);
            }}
          >
            {isActive ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start Camera
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webcam Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className={`glass-card p-3 transition-all duration-500 ${statusColor}`}>
            {isActive ? (
              <Webcam
                onFrame={handleFrame}
                active={isActive}
                intervalMs={3000}
                className="aspect-video w-full rounded-xl overflow-hidden"
              />
            ) : (
              <div className="aspect-video w-full rounded-xl bg-surface flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-muted text-sm text-center px-4">
                  Select your class details and click <strong>Start Camera</strong> to begin tracking
                </p>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-3 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-success animate-pulse" : "bg-muted"
              }`}
            />
            <span className="text-muted">
              {isActive
                ? processing
                  ? "Processing frame..."
                  : "Scanning for faces..."
                : "Camera inactive"}
            </span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Match Result Card */}
          <div className="glass-card p-6 animate-fade-in">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
              Recognition Result
            </h3>

            {!lastResult ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </div>
                <p className="text-sm text-muted">Waiting for detection...</p>
              </div>
            ) : lastResult.matched && lastResult.student ? (
              <div className="text-center space-y-3 animate-fade-in">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getStudentPhotoUrl(lastResult.student.roll_no)}
                  alt={lastResult.student.name}
                  className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-success/40"
                />
                <div>
                  <h4 className="text-lg font-bold">{lastResult.student.name}</h4>
                  <p className="text-sm text-muted">{lastResult.student.roll_no}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
                    {((lastResult.confidence || 0) * 100).toFixed(1)}% match
                  </span>
                  {lastResult.already_marked ? (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/10 text-warning">
                      Already Marked
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
                      ✓ Marked
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-danger">{lastResult.reason}</p>
              </div>
            )}
          </div>

          {/* Session Log */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">
              Session Log ({sessionLog.length})
            </h3>
            {sessionLog.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">
                No attendance marked yet
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessionLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-light text-sm animate-slide-in"
                  >
                    <div>
                      <span className="font-medium">{entry.result.student?.name}</span>
                      <span className="text-xs text-muted ml-2">{entry.result.student?.roll_no}</span>
                    </div>
                    <span className="text-xs text-success">{entry.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
