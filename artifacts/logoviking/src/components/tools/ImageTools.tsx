import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Upload, RotateCcw, RotateCw, Maximize2 } from "lucide-react";
import { ResultCard } from "@/components/tool/ResultParts";
import { cn } from "@/lib/utils";

interface UploadedImage {
  file: File;
  url: string;
  width: number;
  height: number;
}

function FilePicker({ onFile, accept = "image/*" }: { onFile: (img: UploadedImage) => void; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => onFile({ file, url, width: img.width, height: img.height });
    img.src = url;
  };
  return (
    <div
      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover-elevate transition-colors"
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); }}
      onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
    >
      <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm font-medium">Click to upload or drag and drop</p>
      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 10MB</p>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => handleFile(e.target.files?.[0] ?? null)} />
    </div>
  );
}

function downloadDataUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function BeforeAfter({ before, after, beforeLabel = "Original", afterLabel = "Result", afterSize }: { before: string; after: string; beforeLabel?: string; afterLabel?: string; afterSize?: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{beforeLabel}</p>
        <img src={before} alt="before" className="w-full rounded-lg border border-border bg-muted/30" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{afterLabel}{afterSize ? ` · ${afterSize}` : ""}</p>
        <img src={after} alt="after" className="w-full rounded-lg border border-border bg-muted/30" />
      </div>
    </div>
  );
}

function bytesToReadable(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error("Canvas conversion failed")), type, quality);
  });
}

// ─────────── Compress ───────────
export function CompressTool() {
  const [img, setImg] = useState<UploadedImage | null>(null);
  const [quality, setQuality] = useState(70);
  const [result, setResult] = useState<{ url: string; size: number; type: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function process() {
    if (!img) return;
    setBusy(true);
    try {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      const i = new Image(); i.src = img.url;
      await new Promise(r => { i.onload = r; });
      ctx.drawImage(i, 0, 0);
      const blob = await canvasToBlob(c, "image/jpeg", quality / 100);
      setResult({ url: URL.createObjectURL(blob), size: blob.size, type: "image/jpeg" });
    } finally { setBusy(false); }
  }

  return (
    <>
      <Card><CardContent className="pt-6 space-y-4">
        {!img ? <FilePicker onFile={setImg} /> : (
          <>
            <div className="text-sm">{img.file.name} — {img.width}×{img.height} · {bytesToReadable(img.file.size)}</div>
            <div>
              <Label>Quality: {quality}%</Label>
              <Slider min={10} max={100} step={1} value={[quality]} onValueChange={v => setQuality(v[0])} className="mt-2" />
            </div>
            <div className="flex gap-2">
              <Button onClick={process} disabled={busy} size="lg">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Compress</Button>
              <Button variant="outline" onClick={() => { setImg(null); setResult(null); }}>Choose another</Button>
            </div>
          </>
        )}
      </CardContent></Card>
      {img && result && (
        <ResultCard title={`Compressed: ${bytesToReadable(result.size)} (saved ${Math.max(0, Math.round((1 - result.size / img.file.size) * 100))}%)`}>
          <BeforeAfter before={img.url} after={result.url} afterSize={bytesToReadable(result.size)} />
          <div className="mt-4 flex gap-2">
            <Button onClick={() => downloadDataUrl(result.url, `compressed-${img.file.name.replace(/\.[^.]+$/, "")}.jpg`)}>
              <Download className="h-4 w-4 mr-2" />Download JPEG
            </Button>
          </div>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Resize ───────────
export function ResizeTool() {
  const [img, setImg] = useState<UploadedImage | null>(null);
  const [w, setW] = useState(800);
  const [h, setH] = useState(600);
  const [keep, setKeep] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function setOriginal(im: UploadedImage) { setImg(im); setW(im.width); setH(im.height); }

  function onWChange(nw: number) {
    setW(nw);
    if (keep && img) setH(Math.round((nw / img.width) * img.height));
  }
  function onHChange(nh: number) {
    setH(nh);
    if (keep && img) setW(Math.round((nh / img.height) * img.width));
  }

  async function process() {
    if (!img) return;
    setBusy(true);
    try {
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d")!;
      const i = new Image(); i.src = img.url;
      await new Promise(r => { i.onload = r; });
      ctx.drawImage(i, 0, 0, w, h);
      const blob = await canvasToBlob(c, img.file.type || "image/png");
      setResult(URL.createObjectURL(blob));
    } finally { setBusy(false); }
  }

  return (
    <>
      <Card><CardContent className="pt-6 space-y-4">
        {!img ? <FilePicker onFile={setOriginal} /> : (
          <>
            <div className="text-sm">{img.file.name} — original {img.width}×{img.height}</div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Width (px)</Label><Input type="number" value={w} onChange={e => onWChange(Number(e.target.value))} /></div>
              <div><Label>Height (px)</Label><Input type="number" value={h} onChange={e => onHChange(Number(e.target.value))} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} /> Keep aspect ratio</label>
            <div className="flex gap-2">
              <Button onClick={process} disabled={busy} size="lg">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Resize</Button>
              <Button variant="outline" onClick={() => { setImg(null); setResult(null); }}>Choose another</Button>
            </div>
          </>
        )}
      </CardContent></Card>
      {img && result && (
        <ResultCard title={`Resized to ${w}×${h}`}>
          <BeforeAfter before={img.url} after={result} afterSize={`${w}×${h}`} />
          <Button className="mt-4" onClick={() => downloadDataUrl(result, `resized-${img.file.name}`)}>
            <Download className="h-4 w-4 mr-2" />Download
          </Button>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Crop (iPhone Photos style: pan + pinch/wheel zoom + aspect chips + rotate) ───────────

type AspectChip = { id: string; label: string; ratio: number | null };

const ASPECT_CHIPS: AspectChip[] = [
  { id: "original", label: "Original", ratio: null },
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "Square", ratio: 1 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "5:4", label: "5:4", ratio: 5 / 4 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 },
  { id: "2:3", label: "2:3", ratio: 2 / 3 },
];

interface IPhoneCropperHandle {
  exportCrop: () => Promise<{ blob: Blob; width: number; height: number } | null>;
  reset: () => void;
}

interface IPhoneCropperProps {
  image: UploadedImage;
  aspectId: string;
  rotation: 0 | 90 | 180 | 270;
  onReady?: (api: IPhoneCropperHandle) => void;
}

function IPhoneCropper({ image, aspectId, rotation, onReady }: IPhoneCropperProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imgElRef = useRef<HTMLImageElement>(null);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [active, setActive] = useState(false);

  // Rotated natural dimensions (the dimensions that interact with the crop frame)
  const rotated = rotation === 90 || rotation === 270;
  const iw = rotated ? image.height : image.width;
  const ih = rotated ? image.width : image.height;

  // Crop frame size, fit inside stage with 32px padding
  const { cropW, cropH } = useMemo(() => {
    if (stage.w === 0 || stage.h === 0) return { cropW: 0, cropH: 0 };
    const padded = { w: stage.w - 32, h: stage.h - 32 };
    let ratio: number;
    const chip = ASPECT_CHIPS.find((c) => c.id === aspectId);
    if (chip?.ratio != null) {
      ratio = chip.ratio;
    } else {
      // "original" or "free" -> use rotated image's own ratio
      ratio = iw / ih;
    }
    let w = padded.w;
    let h = w / ratio;
    if (h > padded.h) {
      h = padded.h;
      w = h * ratio;
    }
    return { cropW: Math.round(w), cropH: Math.round(h) };
  }, [stage.w, stage.h, aspectId, iw, ih]);

  // Display scale: how many screen px equal 1 image-px. Min scale = cover the crop frame.
  const minScale = useMemo(() => {
    if (cropW === 0 || cropH === 0) return 1;
    return Math.max(cropW / iw, cropH / ih);
  }, [cropW, cropH, iw, ih]);
  const maxScale = minScale * 8;

  // The image-coord that is at the crop-frame center.
  const [cx, setCx] = useState(iw / 2);
  const [cy, setCy] = useState(ih / 2);
  const [scale, setScale] = useState(minScale);

  // Reset state when image, aspect, or rotation changes
  useEffect(() => {
    setCx(iw / 2);
    setCy(ih / 2);
    setScale(minScale);
  }, [image.url, aspectId, rotation, iw, ih, minScale]);

  // Track stage size
  useEffect(() => {
    if (!stageRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        setStage({ w: Math.round(width), h: Math.round(height) });
      }
    });
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);

  // Constraint helper: keep the image covering the crop frame at the current scale.
  const clamp = useCallback(
    (nextCx: number, nextCy: number, nextScale: number) => {
      const halfW = cropW / 2 / nextScale;
      const halfH = cropH / 2 / nextScale;
      const minCx = halfW;
      const maxCx = iw - halfW;
      const minCy = halfH;
      const maxCy = ih - halfH;
      const ccx = minCx > maxCx ? iw / 2 : Math.min(maxCx, Math.max(minCx, nextCx));
      const ccy = minCy > maxCy ? ih / 2 : Math.min(maxCy, Math.max(minCy, nextCy));
      return { cx: ccx, cy: ccy };
    },
    [cropW, cropH, iw, ih],
  );

  // Pointer handling for pan + pinch
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const startRef = useRef<{
    cx: number;
    cy: number;
    scale: number;
    midX: number;
    midY: number;
    dist: number;
    midImgX: number;
    midImgY: number;
  } | null>(null);

  function getStageCenter() {
    return { x: stage.w / 2, y: stage.h / 2 };
  }

  // Convert a screen-space point inside the stage to image coordinates,
  // given current cx/cy/scale.
  const screenToImage = useCallback(
    (sx: number, sy: number, ccx: number, ccy: number, s: number) => {
      const center = getStageCenter();
      return {
        x: ccx + (sx - center.x) / s,
        y: ccy + (sy - center.y) / s,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage.w, stage.h],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const rect = stageRef.current!.getBoundingClientRect();
    pointersRef.current.set(e.pointerId, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setActive(true);
    initStartFromPointers();
  };

  function initStartFromPointers() {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length === 0) {
      startRef.current = null;
      return;
    }
    if (pts.length === 1) {
      startRef.current = {
        cx,
        cy,
        scale,
        midX: pts[0].x,
        midY: pts[0].y,
        dist: 0,
        midImgX: cx,
        midImgY: cy,
      };
    } else {
      const a = pts[0];
      const b = pts[1];
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const img = screenToImage(midX, midY, cx, cy, scale);
      startRef.current = {
        cx,
        cy,
        scale,
        midX,
        midY,
        dist,
        midImgX: img.x,
        midImgY: img.y,
      };
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    const rect = stageRef.current!.getBoundingClientRect();
    pointersRef.current.set(e.pointerId, {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    const start = startRef.current;
    if (!start) return;
    const pts = Array.from(pointersRef.current.values());
    if (pts.length === 1) {
      const dx = pts[0].x - start.midX;
      const dy = pts[0].y - start.midY;
      const nextCx = start.cx - dx / start.scale;
      const nextCy = start.cy - dy / start.scale;
      const c = clamp(nextCx, nextCy, start.scale);
      setCx(c.cx);
      setCy(c.cy);
    } else if (pts.length >= 2) {
      const a = pts[0];
      const b = pts[1];
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      let nextScale = start.scale * (dist / start.dist);
      nextScale = Math.min(maxScale, Math.max(minScale, nextScale));
      // Keep the image point under the pinch midpoint anchored at the new midpoint
      const center = getStageCenter();
      const nextCx = start.midImgX + (center.x - midX) / nextScale;
      const nextCy = start.midImgY + (center.y - midY) / nextScale;
      const c = clamp(nextCx, nextCy, nextScale);
      setCx(c.cx);
      setCy(c.cy);
      setScale(nextScale);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size === 0) {
      setActive(false);
      startRef.current = null;
    } else {
      initStartFromPointers();
    }
  };

  // Wheel = zoom (desktop)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const nextScale = Math.min(maxScale, Math.max(minScale, scale * factor));
      const center = getStageCenter();
      const img = screenToImage(px, py, cx, cy, scale);
      const nextCx = img.x + (center.x - px) / nextScale;
      const nextCy = img.y + (center.y - py) / nextScale;
      const c = clamp(nextCx, nextCy, nextScale);
      setCx(c.cx);
      setCy(c.cy);
      setScale(nextScale);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [cx, cy, scale, minScale, maxScale, clamp, screenToImage, stage.w, stage.h]);

  // Slider zoom
  const onSliderZoom = (val: number) => {
    const target = minScale + ((maxScale - minScale) * val) / 100;
    const c = clamp(cx, cy, target);
    setCx(c.cx);
    setCy(c.cy);
    setScale(target);
  };
  const sliderValue = useMemo(() => {
    if (maxScale === minScale) return 0;
    return Math.round(((scale - minScale) / (maxScale - minScale)) * 100);
  }, [scale, minScale, maxScale]);

  // Export crop to a Blob
  const exportCrop = useCallback(async (): Promise<{ blob: Blob; width: number; height: number } | null> => {
    if (cropW === 0 || cropH === 0) return null;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
    });
    const outW = Math.max(1, Math.round(cropW / scale));
    const outH = Math.max(1, Math.round(cropH / scale));
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    // Apply rotation around the canvas center, then draw image so that the
    // (cx, cy) image-coord ends up at the canvas center.
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    // After rotation, axes refer to the un-rotated image's axes.
    // The image-coord (cx, cy) in *rotated* space maps back to original image coords:
    let origCx = cx;
    let origCy = cy;
    const naturalW = image.width;
    const naturalH = image.height;
    if (rotation === 90) {
      origCx = cy;
      origCy = naturalH - cx;
    } else if (rotation === 180) {
      origCx = naturalW - cx;
      origCy = naturalH - cy;
    } else if (rotation === 270) {
      origCx = naturalW - cy;
      origCy = cx;
    }
    // Canvas is in rotated-image-px (1 canvas px = 1 image px). Draw original image rotated
    // around the canvas center, shifted so the original-coord (origCx, origCy) lands at center.
    ctx.drawImage(img, -origCx, -origCy);
    const type = image.file.type && image.file.type.startsWith("image/") ? image.file.type : "image/png";
    const blob = await canvasToBlob(canvas, type, type === "image/jpeg" ? 0.92 : undefined);
    return { blob, width: outW, height: outH };
  }, [cropW, cropH, scale, cx, cy, image.url, image.file.type, image.width, image.height, rotation]);

  const reset = useCallback(() => {
    setCx(iw / 2);
    setCy(ih / 2);
    setScale(minScale);
  }, [iw, ih, minScale]);

  useEffect(() => {
    onReady?.({ exportCrop, reset });
  }, [onReady, exportCrop, reset]);

  // Render the image with transform-origin top-left so transform math is straightforward.
  // Translate so that rotated-image-coord (cx, cy) lands at stage center, then scale.
  const center = getStageCenter();
  const tx = center.x - cx * scale;
  const ty = center.y - cy * scale;

  return (
    <div className="space-y-3 select-none">
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden rounded-2xl border border-border bg-black/95 touch-none"
        style={{ height: "min(70vh, 520px)" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Image layer: a (iw × ih) box transformed by translate+scale.
            The natural <img> sits inside, centered, then rotated around its own center
            so its bounding box exactly fills the (iw × ih) box. */}
        <div
          className="absolute top-0 left-0 will-change-transform"
          style={{
            width: iw,
            height: ih,
            transformOrigin: "0 0",
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          }}
        >
          <img
            ref={imgElRef}
            src={image.url}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              left: (iw - image.width) / 2,
              top: (ih - image.height) / 2,
              width: image.width,
              height: image.height,
              display: "block",
              userSelect: "none",
              pointerEvents: "none",
              transformOrigin: "50% 50%",
              transform: `rotate(${rotation}deg)`,
            }}
          />
        </div>

        {/* Dim overlay with cutout (4 rectangles around the crop frame) */}
        {cropW > 0 && (
          <>
            {(() => {
              const left = (stage.w - cropW) / 2;
              const top = (stage.h - cropH) / 2;
              const right = left + cropW;
              const bottom = top + cropH;
              const dim = "absolute bg-black/70 pointer-events-none";
              return (
                <>
                  <div className={dim} style={{ left: 0, top: 0, width: stage.w, height: top }} />
                  <div className={dim} style={{ left: 0, top: bottom, width: stage.w, height: stage.h - bottom }} />
                  <div className={dim} style={{ left: 0, top, width: left, height: cropH }} />
                  <div className={dim} style={{ left: right, top, width: stage.w - right, height: cropH }} />
                  {/* Crop frame */}
                  <div
                    className="absolute pointer-events-none border border-white/90"
                    style={{ left, top, width: cropW, height: cropH }}
                  >
                    {/* Rule-of-thirds grid */}
                    <div
                      className={cn(
                        "absolute inset-0 transition-opacity duration-150",
                        active ? "opacity-100" : "opacity-40",
                      )}
                    >
                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
                      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
                      <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
                      <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
                    </div>
                    {/* Corner markers */}
                    {[
                      { left: -1, top: -1, borderLeftWidth: 3, borderTopWidth: 3 },
                      { right: -1, top: -1, borderRightWidth: 3, borderTopWidth: 3 },
                      { left: -1, bottom: -1, borderLeftWidth: 3, borderBottomWidth: 3 },
                      { right: -1, bottom: -1, borderRightWidth: 3, borderBottomWidth: 3 },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="absolute w-5 h-5 border-white"
                        style={s as React.CSSProperties}
                      />
                    ))}
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>

      {/* Zoom slider */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-muted-foreground w-12">Zoom</span>
        <Slider
          value={[sliderValue]}
          onValueChange={(v) => onSliderZoom(v[0])}
          min={0}
          max={100}
          step={1}
        />
        <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">
          {Math.round((scale / minScale) * 100)}%
        </span>
      </div>
    </div>
  );
}

export function CropTool() {
  const [img, setImg] = useState<UploadedImage | null>(null);
  const [aspectId, setAspectId] = useState("original");
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [result, setResult] = useState<{ url: string; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const apiRef = useRef<IPhoneCropperHandle | null>(null);

  function rotateLeft() {
    setRotation((r) => (((r - 90 + 360) % 360) as 0 | 90 | 180 | 270));
  }
  function rotateRight() {
    setRotation((r) => (((r + 90) % 360) as 0 | 90 | 180 | 270));
  }

  async function process() {
    if (!apiRef.current) return;
    setBusy(true);
    try {
      const out = await apiRef.current.exportCrop();
      if (!out) return;
      if (result) URL.revokeObjectURL(result.url);
      setResult({ url: URL.createObjectURL(out.blob), w: out.width, h: out.height });
    } finally {
      setBusy(false);
    }
  }

  function chooseAnother() {
    if (result) URL.revokeObjectURL(result.url);
    setImg(null);
    setResult(null);
    setAspectId("original");
    setRotation(0);
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {!img ? (
            <FilePicker onFile={setImg} />
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-muted-foreground">
                  {img.file.name} — {img.width}×{img.height}
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={rotateLeft} title="Rotate left">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={rotateRight} title="Rotate right">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => apiRef.current?.reset()}
                    title="Reset"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <IPhoneCropper
                image={img}
                aspectId={aspectId}
                rotation={rotation}
                onReady={(api) => {
                  apiRef.current = api;
                }}
              />

              {/* Aspect ratio chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {ASPECT_CHIPS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setAspectId(c.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap",
                      aspectId === c.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-foreground border-border hover-elevate",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Drag to pan · pinch or scroll to zoom · pick an aspect ratio above
              </p>

              <div className="flex flex-wrap gap-2">
                <Button onClick={process} disabled={busy} size="lg">
                  {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crop
                </Button>
                <Button variant="outline" onClick={chooseAnother}>
                  Choose another image
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {img && result && (
        <ResultCard title={`Cropped image — ${result.w}×${result.h}`}>
          <BeforeAfter before={img.url} after={result.url} afterSize={`${result.w}×${result.h}`} />
          <Button
            className="mt-4"
            onClick={() => downloadDataUrl(result.url, `cropped-${img.file.name.replace(/\.[^.]+$/, "")}.png`)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Convert ───────────
export function ConvertTool() {
  const [img, setImg] = useState<UploadedImage | null>(null);
  const [format, setFormat] = useState("image/webp");
  const [result, setResult] = useState<{ url: string; size: number } | null>(null);
  const [busy, setBusy] = useState(false);

  async function process() {
    if (!img) return;
    setBusy(true);
    try {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      const i = new Image(); i.src = img.url;
      await new Promise(r => { i.onload = r; });
      ctx.drawImage(i, 0, 0);
      const blob = await canvasToBlob(c, format, 0.9);
      setResult({ url: URL.createObjectURL(blob), size: blob.size });
    } finally { setBusy(false); }
  }
  const ext = format.split("/")[1];

  return (
    <>
      <Card><CardContent className="pt-6 space-y-4">
        {!img ? <FilePicker onFile={setImg} /> : (
          <>
            <div className="text-sm">{img.file.name} — {bytesToReadable(img.file.size)}</div>
            <div>
              <Label>Convert to</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image/webp">WebP</SelectItem>
                  <SelectItem value="image/jpeg">JPEG</SelectItem>
                  <SelectItem value="image/png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={process} disabled={busy} size="lg">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Convert</Button>
              <Button variant="outline" onClick={() => { setImg(null); setResult(null); }}>Choose another</Button>
            </div>
          </>
        )}
      </CardContent></Card>
      {img && result && (
        <ResultCard title={`Converted to ${ext.toUpperCase()} (${bytesToReadable(result.size)})`}>
          <BeforeAfter before={img.url} after={result.url} afterLabel={ext.toUpperCase()} />
          <Button className="mt-4" onClick={() => downloadDataUrl(result.url, `converted.${ext}`)}><Download className="h-4 w-4 mr-2" />Download .{ext}</Button>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Watermark ───────────
export function WatermarkTool() {
  const [img, setImg] = useState<UploadedImage | null>(null);
  const [text, setText] = useState("© Logoviking");
  const [opacity, setOpacity] = useState(60);
  const [size, setSize] = useState(48);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function process() {
    if (!img) return;
    setBusy(true);
    try {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      const i = new Image(); i.src = img.url;
      await new Promise(r => { i.onload = r; });
      ctx.drawImage(i, 0, 0);
      ctx.font = `bold ${size}px Arial, sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${opacity / 100})`;
      ctx.strokeStyle = `rgba(0,0,0,${opacity / 100})`;
      ctx.lineWidth = Math.max(2, size / 16);
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      const x = img.width - 24;
      const y = img.height - 24;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
      const blob = await canvasToBlob(c, img.file.type || "image/png");
      setResult(URL.createObjectURL(blob));
    } finally { setBusy(false); }
  }

  return (
    <>
      <Card><CardContent className="pt-6 space-y-4">
        {!img ? <FilePicker onFile={setImg} /> : (
          <>
            <div className="text-sm">{img.file.name}</div>
            <div><Label>Watermark text</Label><Input value={text} onChange={e => setText(e.target.value)} /></div>
            <div><Label>Opacity: {opacity}%</Label><Slider min={10} max={100} step={5} value={[opacity]} onValueChange={v => setOpacity(v[0])} className="mt-2" /></div>
            <div><Label>Font size: {size}px</Label><Slider min={16} max={128} step={4} value={[size]} onValueChange={v => setSize(v[0])} className="mt-2" /></div>
            <div className="flex gap-2">
              <Button onClick={process} disabled={busy} size="lg">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Apply watermark</Button>
              <Button variant="outline" onClick={() => { setImg(null); setResult(null); }}>Choose another</Button>
            </div>
          </>
        )}
      </CardContent></Card>
      {img && result && (
        <ResultCard title="Watermarked image">
          <BeforeAfter before={img.url} after={result} />
          <Button className="mt-4" onClick={() => downloadDataUrl(result, `watermarked-${img.file.name}`)}><Download className="h-4 w-4 mr-2" />Download</Button>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Background Remover (mock — desaturate edges) ───────────
export function BackgroundRemoverTool() {
  const [img, setImg] = useState<UploadedImage | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function process() {
    if (!img) return;
    setBusy(true);
    try {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      const i = new Image(); i.src = img.url;
      await new Promise(r => { i.onload = r; });
      ctx.drawImage(i, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height);
      // Simple mock: desaturate pixels near image borders
      const cx = c.width / 2, cy = c.height / 2, r = Math.min(cx, cy) * 0.65;
      for (let y = 0; y < c.height; y++) {
        for (let x = 0; x < c.width; x++) {
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (dist > r) {
            const idx = (y * c.width + x) * 4;
            const gray = data.data[idx] * 0.3 + data.data[idx + 1] * 0.59 + data.data[idx + 2] * 0.11;
            const t = Math.min(1, (dist - r) / (Math.min(cx, cy) - r));
            data.data[idx] = data.data[idx] * (1 - t) + gray * t * 0.4;
            data.data[idx + 1] = data.data[idx + 1] * (1 - t) + gray * t * 0.4;
            data.data[idx + 2] = data.data[idx + 2] * (1 - t) + gray * t * 0.4;
            data.data[idx + 3] = Math.max(0, data.data[idx + 3] * (1 - t * 0.85));
          }
        }
      }
      ctx.putImageData(data, 0, 0);
      const blob = await canvasToBlob(c, "image/png");
      setResult(URL.createObjectURL(blob));
    } finally { setBusy(false); }
  }

  return (
    <>
      <Card><CardContent className="pt-6 space-y-4">
        <div className="text-xs px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
          AI-powered background removal is coming soon. The current preview applies a smart edge-fade to highlight your subject.
        </div>
        {!img ? <FilePicker onFile={setImg} /> : (
          <>
            <div className="text-sm">{img.file.name}</div>
            <div className="flex gap-2">
              <Button onClick={process} disabled={busy} size="lg">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Process image</Button>
              <Button variant="outline" onClick={() => { setImg(null); setResult(null); }}>Choose another</Button>
            </div>
          </>
        )}
      </CardContent></Card>
      {img && result && (
        <ResultCard title="Subject highlighted">
          <BeforeAfter before={img.url} after={result} />
          <Button className="mt-4" onClick={() => downloadDataUrl(result, `bg-removed-${img.file.name.replace(/\.[^.]+$/, "")}.png`)}><Download className="h-4 w-4 mr-2" />Download PNG</Button>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Smart Optimizer ───────────
export function SmartOptimizerTool() {
  const [img, setImg] = useState<UploadedImage | null>(null);
  const [result, setResult] = useState<{ url: string; size: number; format: string; quality: number } | null>(null);
  const [busy, setBusy] = useState(false);

  async function process() {
    if (!img) return;
    setBusy(true);
    try {
      // Try webp at q=82, fall back to jpeg if webp not supported
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      const i = new Image(); i.src = img.url;
      await new Promise(r => { i.onload = r; });
      ctx.drawImage(i, 0, 0);
      let blob = await canvasToBlob(c, "image/webp", 0.82);
      let format = "WebP", quality = 82;
      if (!blob || blob.size > img.file.size * 0.95) {
        const jpegBlob = await canvasToBlob(c, "image/jpeg", 0.78);
        if (jpegBlob.size < blob.size) { blob = jpegBlob; format = "JPEG"; quality = 78; }
      }
      setResult({ url: URL.createObjectURL(blob), size: blob.size, format, quality });
    } finally { setBusy(false); }
  }

  return (
    <>
      <Card><CardContent className="pt-6 space-y-4">
        {!img ? <FilePicker onFile={setImg} /> : (
          <>
            <div className="text-sm">{img.file.name} — {bytesToReadable(img.file.size)}</div>
            <div className="flex gap-2">
              <Button onClick={process} disabled={busy} size="lg">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Optimize</Button>
              <Button variant="outline" onClick={() => { setImg(null); setResult(null); }}>Choose another</Button>
            </div>
          </>
        )}
      </CardContent></Card>
      {img && result && (
        <ResultCard title={`Optimized: ${result.format} @ q${result.quality} — ${bytesToReadable(result.size)} (saved ${Math.max(0, Math.round((1 - result.size / img.file.size) * 100))}%)`}>
          <BeforeAfter before={img.url} after={result.url} afterLabel={result.format} afterSize={bytesToReadable(result.size)} />
          <Button className="mt-4" onClick={() => downloadDataUrl(result.url, `optimized.${result.format.toLowerCase() === "webp" ? "webp" : "jpg"}`)}><Download className="h-4 w-4 mr-2" />Download</Button>
        </ResultCard>
      )}
    </>
  );
}
