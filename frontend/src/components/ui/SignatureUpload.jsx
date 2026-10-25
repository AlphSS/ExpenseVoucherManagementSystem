import { useRef, useState, useEffect } from "react";
import { PenTool, Upload, RotateCcw, Check, Image as ImageIcon } from "lucide-react";
import Button from "./Button";

export default function SignatureUpload({
  onSignatureReady,
  currentSignatureUrl = null,
  roleLabel = "Employee",
  required = true,
}) {
  const [mode, setMode] = useState("draw"); // 'draw' | 'upload'
  const [hasDrawn, setHasDrawn] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const fileInputRef = useRef(null);

  // Setup canvas
  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      
      // Handle high DPI displays
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.parentElement.clientWidth || 400;
      const height = 180;
      
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(ratio, ratio);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#0f172a"; // Deep slate / black
      
      // Draw signature guideline
      drawGuide(ctx, width, height);
    }
  }, [mode]);

  function drawGuide(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, height - 35);
    ctx.lineTo(width - 30, height - 35);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#94a3b8";
    ctx.font = "11px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText("Sign on line above", 35, height - 18);
    ctx.restore();
  }

  function getCoordinates(e) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawn(true);
  }

  function draw(e) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    // Export drawn signature as a File
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${roleLabel.toLowerCase()}-signature.png`, {
            type: "image/png",
          });
          onSignatureReady?.(file);
        }
      }, "image/png");
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGuide(ctx, width, height);
    setHasDrawn(false);
    onSignatureReady?.(null);
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Please upload a PNG, JPEG, or WebP image.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreview(event.target.result);
      onSignatureReady?.(file);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {roleLabel} Digital Signature {required && <span className="text-rose-500">*</span>}
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Draw your signature directly or upload an official signature stamp.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode("draw")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "draw"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PenTool size={13} />
            Draw
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "upload"
                ? "bg-white text-emerald-800 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Upload size={13} />
            Upload
          </button>
        </div>
      </div>

      {mode === "draw" ? (
        <div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-white p-2 transition-all hover:border-slate-300">
          <canvas
            ref={canvasRef}
            className="w-full touch-none cursor-crosshair rounded-xl bg-slate-50/50"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 mt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {hasDrawn ? (
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <Check size={14} /> Signature captured
                </span>
              ) : (
                <span>Use trackpad, mouse or stylus to sign</span>
              )}
            </div>

            <Button
              variant="ghost"
              size="xs"
              onClick={clearCanvas}
              disabled={!hasDrawn}
              icon={RotateCcw}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/40 p-6 text-center cursor-pointer transition-all hover:border-emerald-500 hover:bg-emerald-50/20"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          {filePreview ? (
            <div className="space-y-3">
              <div className="mx-auto h-24 max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-2xs">
                <img
                  src={filePreview}
                  alt="Signature preview"
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-slate-800">{fileName}</p>
              <p className="text-[11px] text-emerald-700 font-medium">Click to replace signature file</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 shadow-2xs group-hover:text-emerald-700 group-hover:border-emerald-300 transition-colors">
                <ImageIcon size={22} />
              </div>
              <div className="text-xs">
                <span className="font-semibold text-emerald-700">Click to upload</span>{" "}
                <span className="text-slate-500">or drag signature image</span>
              </div>
              <p className="text-[11px] text-slate-400">PNG, JPG, or WebP up to 5MB</p>
            </div>
          )}
        </div>
      )}

      {currentSignatureUrl && !filePreview && !hasDrawn && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs text-emerald-900">
          <Check size={16} className="text-emerald-700 shrink-0" />
          <span>An existing verified signature is already on record for this voucher.</span>
        </div>
      )}
    </div>
  );
}
