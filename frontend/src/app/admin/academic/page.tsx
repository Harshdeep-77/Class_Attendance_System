"use client";

import { useState, useEffect } from "react";
import { getBranches, createBranch, getSubjects, createSubject } from "@/lib/api";
import type { Branch, Subject } from "@/lib/types";
import { showToast } from "@/components/Toast";

export default function AcademicAdminPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchSemesters, setNewBranchSemesters] = useState(8);

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectBranchId, setNewSubjectBranchId] = useState<number | "">("");
  const [newSubjectSemester, setNewSubjectSemester] = useState<number | "">("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [b, s] = await Promise.all([getBranches(), getSubjects()]);
      setBranches(b);
      setSubjects(s);
    } catch (err: unknown) {
      console.error(err);
      showToast("Failed to load academic data", "error");
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || newBranchSemesters < 1) return;
    setLoading(true);
    try {
      await createBranch(newBranchName, newBranchSemesters);
      showToast("Branch created successfully", "success");
      setNewBranchName("");
      setNewBranchSemesters(8);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create branch";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName || newSubjectBranchId === "" || newSubjectSemester === "") return;
    setLoading(true);
    try {
      await createSubject(newSubjectName, Number(newSubjectBranchId), Number(newSubjectSemester));
      showToast("Subject created successfully", "success");
      setNewSubjectName("");
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create subject";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedBranchObj = branches.find((b) => b.id === Number(newSubjectBranchId));
  const availableSemesters = selectedBranchObj 
    ? Array.from({ length: selectedBranchObj.total_semesters }, (_, i) => i + 1) 
    : [];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Academic</span> Administration
        </h1>
        <p className="text-muted mt-2">Manage your college branches and subjects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Branches Panel */}
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="text-xl font-semibold mb-4 text-cyan-light">Manage Branches</h2>
          
          <form onSubmit={handleCreateBranch} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm text-muted mb-1">Branch Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Computer Science"
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Total Semesters</label>
              <input
                type="number"
                min="1"
                max="12"
                className="input"
                value={newBranchSemesters}
                onChange={(e) => setNewBranchSemesters(Number(e.target.value))}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              Add Branch
            </button>
          </form>

          <h3 className="font-medium mb-3 text-muted">Existing Branches</h3>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {branches.map((b) => (
              <li key={b.id} className="p-3 bg-surface/50 border border-border rounded-lg flex justify-between items-center">
                <span>{b.name}</span>
                <span className="text-sm text-muted">{b.total_semesters} Semesters</span>
              </li>
            ))}
            {branches.length === 0 && <p className="text-sm text-muted italic">No branches found.</p>}
          </ul>
        </div>

        {/* Subjects Panel */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-semibold mb-4 text-accent-light">Manage Subjects</h2>
          
          <form onSubmit={handleCreateSubject} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm text-muted mb-1">Select Branch</label>
              <select
                className="input"
                value={newSubjectBranchId}
                onChange={(e) => {
                  setNewSubjectBranchId(e.target.value === "" ? "" : Number(e.target.value));
                  setNewSubjectSemester("");
                }}
                required
              >
                <option value="">-- Select Branch --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {newSubjectBranchId !== "" && (
              <div>
                <label className="block text-sm text-muted mb-1">Select Semester</label>
                <select
                  className="input"
                  value={newSubjectSemester}
                  onChange={(e) => setNewSubjectSemester(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                >
                  <option value="">-- Select Semester --</option>
                  {availableSemesters.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm text-muted mb-1">Subject Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Data Structures"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-secondary w-full" disabled={loading || newSubjectBranchId === "" || newSubjectSemester === ""}>
              Add Subject
            </button>
          </form>

          <h3 className="font-medium mb-3 text-muted">Existing Subjects</h3>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {subjects.map((s) => {
              const b = branches.find((branch) => branch.id === s.branch_id);
              return (
                <div key={s.id} className="p-3 bg-surface/50 border border-border rounded-lg">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted">{b?.name} • Semester {s.semester}</p>
                </div>
              );
            })}
            {subjects.length === 0 && <p className="text-sm text-muted italic">No subjects found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
