"use client";

import { useRef, useEffect, useCallback } from "react";

interface WebcamProps {
  onFrame?: (blob: Blob) => void;
  intervalMs?: number;
  active?: boolean;
  className?: string;
  mirrored?: boolean;
}

export default function Webcam({
  onFrame,
  intervalMs = 2000,
  active = true,
  className = "",
  mirrored = true,
}: WebcamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Start camera */
  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [active]);

  /* Capture frame */
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob && onFrame) onFrame(blob);
      },
      "image/jpeg",
      0.85
    );
  }, [onFrame]);

  /* Auto-capture interval */
  useEffect(() => {
    if (!active || !onFrame) return;
    intervalRef.current = setInterval(captureFrame, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, intervalMs, captureFrame, onFrame]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover rounded-2xl ${mirrored ? "scale-x-[-1]" : ""}`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Scan line overlay */}
      {active && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-light to-transparent opacity-60"
            style={{ animation: "scan-line 2.5s linear infinite" }}
          />
          {/* Corner brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent-light/60 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent-light/60 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent-light/60 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent-light/60 rounded-br-lg" />
        </div>
      )}
    </div>
  );
}

/* One-shot capture helper for registration */
export function captureFromVideo(
  videoElement: HTMLVideoElement
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve(null);
    ctx.drawImage(videoElement, 0, 0);
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      0.9
    );
  });
}
