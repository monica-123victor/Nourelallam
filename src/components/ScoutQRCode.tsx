"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function ScoutQRCode({ scoutId, scoutName }: { scoutId: number; scoutName: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const profileUrl = `${baseUrl}/scouts/${scoutId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, profileUrl, { width: 180, margin: 1 });
    }
  }, [profileUrl]);

  function downloadQR() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${scoutName.replace(/\s+/g, "_")}_qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-white/60 p-4">
      <canvas ref={canvasRef} />
      <p className="text-xs text-charcoal/50 text-center break-all">{profileUrl}</p>
      <button
        onClick={downloadQR}
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-khaki/20"
      >
        Download QR
      </button>
    </div>
  );
}
