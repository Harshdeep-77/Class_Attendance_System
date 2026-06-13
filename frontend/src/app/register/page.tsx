"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { registerStudent, getBranches } from "@/lib/api";
import type { Branch } from "@/lib/types";
import { showToast } from "@/components/Toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [branchId, setBranchId] = useState<number | "">("");
  const [semester, setSemester] = useState<number | "">("");
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    getBranches().then(setBranches).catch(console.error);
  }, []);
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null]);
  const [loading, setLoading] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [captureIndex, setCaptureIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* Camera helpers */
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      showToast("Camera access denied", "error");
      setUseCamera(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (useCamera) startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [useCamera, startCamera, stopCamera]);

  const capturePhoto = useCallback(() => {
    if (captureIndex === null || !videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture_${captureIndex + 1}.jpg`, { type: "image/jpeg" });
        const newPhotos = [...photos];
        newPhotos[captureIndex] = file;
        setPhotos(newPhotos);

        const url = URL.createObjectURL(blob);
        const newPreviews = [...previews];
        newPreviews[captureIndex] = url;
        setPreviews(newPreviews);

        // Auto-advance to next empty slot
        const nextEmpty = newPhotos.findIndex((p, i) => i > captureIndex && !p);
        setCaptureIndex(nextEmpty !== -1 ? nextEmpty : null);
        showToast(`Photo ${captureIndex + 1} captured!`, "success");
      },
      "image/jpeg",
      0.9
    );
  }, [captureIndex, photos, previews]);

  /* File upload handler */
  const handleFileSelect = (index: number, file: File | null) => {
    if (!file) return;
    const newPhotos = [...photos];
    newPhotos[index] = file;
    setPhotos(newPhotos);

    const url = URL.createObjectURL(file);
    const newPreviews = [...previews];
    newPreviews[index] = url;
    setPreviews(newPreviews);
  };

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validPhotos = photos.filter(Boolean) as File[];
    if (validPhotos.length < 4) {
      showToast("Please provide all 4 face photos", "error");
      return;
    }
    if (!name || !rollNo || branchId === "" || semester === "") {
      showToast("Please fill all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await registerStudent({ name, roll_no: rollNo, branch_id: Number(branchId), semester: Number(semester) }, validPhotos);
      showToast(res.message, "success");
      setName("");
      setRollNo("");
      setBranchId("");
      setSemester("");
      setPhotos([null, null, null, null]);
      setPreviews([null, null, null, null]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const filledCount = photos.filter(Boolean).length;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Register</span> New Student
        </h1>
        <p className="text-muted mt-2">
          Capture 4 face photos from different angles for accurate recognition
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Info */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Student Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm text-muted mb-1.5">Branch</label>
              <select
                className="input"
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value === "" ? "" : Number(e.target.value));
                  setSemester("");
                }}
                required
              >
                <option value="">-- Select Branch --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            {branchId !== "" && (
              <div>
                <label className="block text-sm text-muted mb-1.5">Semester</label>
                <select
                  className="input"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                >
                  <option value="">-- Select Semester --</option>
                  {Array.from({ length: branches.find(b => b.id === Number(branchId))?.total_semesters || 0 }, (_, i) => i + 1).map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Photo Capture Section */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Face Photos ({filledCount}/4)
            </h2>
            <button
              type="button"
              className={`btn-secondary text-xs flex items-center gap-2 ${useCamera ? "border-accent text-accent-light" : ""}`}
              onClick={() => {
                setUseCamera(!useCamera);
                if (!useCamera) setCaptureIndex(photos.findIndex((p) => !p));
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {useCamera ? "Close Camera" : "Use Camera"}
            </button>
          </div>

          {/* Camera View */}
          {useCamera && (
            <div className="mb-6 animate-fade-in">
              <div className="relative aspect-video max-w-md mx-auto rounded-2xl overflow-hidden border border-border">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Scan line */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-light to-transparent opacity-50"
                    style={{ animation: "scan-line 2.5s linear infinite" }}
                  />
                </div>
              </div>
              <div className="text-center mt-3">
                <p className="text-sm text-muted mb-2">
                  {captureIndex !== null
                    ? `Capturing Photo ${captureIndex + 1} — Look at the camera`
                    : "All photos captured!"}
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={captureIndex === null}
                  onClick={capturePhoto}
                >
                  📸 Capture Photo {captureIndex !== null ? captureIndex + 1 : ""}
                </button>
              </div>
            </div>
          )}

          {/* Photo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative group">
                <label
                  className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden ${
                    previews[i]
                      ? "border-success/40 bg-success/5"
                      : captureIndex === i && useCamera
                      ? "border-accent animate-pulse-glow bg-accent/5"
                      : "border-border hover:border-accent/40 bg-surface/50"
                  }`}
                  onClick={() => {
                    if (useCamera) setCaptureIndex(i);
                  }}
                >
                  {previews[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previews[i]!}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 p-4">
                      <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-xs text-muted font-medium">Photo {i + 1}</span>
                    </div>
                  )}
                  {!useCamera && (
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelect(i, e.target.files?.[0] || null)}
                    />
                  )}
                </label>
                {previews[i] && (
                  <button
                    type="button"
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-danger/80 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      const np = [...photos];
                      np[i] = null;
                      setPhotos(np);
                      const nprev = [...previews];
                      nprev[i] = null;
                      setPreviews(nprev);
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <button
            type="submit"
            className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
            disabled={loading || filledCount < 4}
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Encoding Faces... This may take a moment
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Register Student
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
