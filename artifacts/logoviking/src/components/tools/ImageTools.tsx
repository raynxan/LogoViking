import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Upload } from "lucide-react";
import { ResultCard } from "@/components/tool/ResultParts";

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

// ─────────── Crop (centered crop preset) ───────────
export function CropTool() {
  const [img, setImg] = useState<UploadedImage | null>(null);
  const [aspect, setAspect] = useState("1:1");
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function process() {
    if (!img) return;
    setBusy(true);
    try {
      const [aw, ah] = aspect.split(":").map(Number);
      const targetRatio = aw / ah;
      const sourceRatio = img.width / img.height;
      let sw = img.width, sh = img.height, sx = 0, sy = 0;
      if (sourceRatio > targetRatio) {
        sw = Math.round(img.height * targetRatio);
        sx = Math.round((img.width - sw) / 2);
      } else {
        sh = Math.round(img.width / targetRatio);
        sy = Math.round((img.height - sh) / 2);
      }
      const c = document.createElement("canvas");
      c.width = sw; c.height = sh;
      const ctx = c.getContext("2d")!;
      const i = new Image(); i.src = img.url;
      await new Promise(r => { i.onload = r; });
      ctx.drawImage(i, sx, sy, sw, sh, 0, 0, sw, sh);
      const blob = await canvasToBlob(c, img.file.type || "image/png");
      setResult(URL.createObjectURL(blob));
    } finally { setBusy(false); }
  }

  return (
    <>
      <Card><CardContent className="pt-6 space-y-4">
        {!img ? <FilePicker onFile={setImg} /> : (
          <>
            <div className="text-sm">{img.file.name} — {img.width}×{img.height}</div>
            <div>
              <Label>Aspect ratio</Label>
              <Select value={aspect} onValueChange={setAspect}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                  <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                  <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                  <SelectItem value="4:5">Instagram Portrait (4:5)</SelectItem>
                  <SelectItem value="3:2">Photo (3:2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={process} disabled={busy} size="lg">{busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Crop</Button>
              <Button variant="outline" onClick={() => { setImg(null); setResult(null); }}>Choose another</Button>
            </div>
          </>
        )}
      </CardContent></Card>
      {img && result && (
        <ResultCard title="Cropped image">
          <BeforeAfter before={img.url} after={result} />
          <Button className="mt-4" onClick={() => downloadDataUrl(result, `cropped-${img.file.name}`)}><Download className="h-4 w-4 mr-2" />Download</Button>
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
