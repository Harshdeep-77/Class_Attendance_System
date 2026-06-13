"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { studentLogin } from "@/lib/api";
import { showToast } from "@/components/Toast";

export default function StudentLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNo) return;
    
    setLoading(true);
    try {
      const res = await studentLogin(name, rollNo);
      showToast(res.message, "success");
      localStorage.setItem("student_roll_no", res.student.roll_no);
      localStorage.setItem("student_name", res.student.name);
      router.push("/student/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Student</span> Portal
          </h1>
          <p className="text-muted mt-2">Log in to view your attendance</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm text-muted mb-1.5">Full Name</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Harshdeep Singh"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Roll Number</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. 2024CS101"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full py-3 mt-4"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
