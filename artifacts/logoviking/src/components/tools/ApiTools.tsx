import { useState } from "react";
import {
  useCalcYoutubeEarnings,
  useCalcTiktokEarnings,
  useCalcInstagramEarnings,
  useCalcEngagementRate,
  useDownloadThumbnail,
  useGenerateChannelName,
  useGenerateHashtags,
  useGenerateCaption,
  useGenerateYoutubeTitle,
  useGenerateContentIdeas,
  useGenerateThumbnailText,
  useGenerateAiThumbnail,
  useGenerateMetaTags,
  useKeywordDensity,
  useGenerateSeoTitle,
  useGenerateSitemap,
  useGenerateRobotsTxt,
  useSocialResizerSpecs,
  useGenerateCreatorKit,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ResultCard, ListResult, CodeBlock, CopyButton } from "@/components/tool/ResultParts";
import { Loader2, Download } from "lucide-react";

function FormCard({ children, onSubmit }: { children: React.ReactNode; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">{children}</form>
      </CardContent>
    </Card>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full">
      {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      {label}
    </Button>
  );
}

function ErrorMsg({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = error instanceof Error ? error.message : "Something went wrong";
  return <p className="text-sm text-destructive">{msg}</p>;
}

// ─────────── YouTube Earnings ───────────
export function YoutubeEarningsTool() {
  const mut = useCalcYoutubeEarnings();
  const [views, setViews] = useState("100000");
  const [cpm, setCpm] = useState("4");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { views: Number(views), cpm: Number(cpm) || undefined } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div>
          <Label htmlFor="yt-views">Monthly views</Label>
          <Input id="yt-views" type="number" min="0" value={views} onChange={e => setViews(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="yt-cpm">CPM ($, optional)</Label>
          <Input id="yt-cpm" type="number" step="0.1" value={cpm} onChange={e => setCpm(e.target.value)} placeholder="4.00" />
        </div>
        <SubmitButton pending={mut.isPending} label="Calculate earnings" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data && (
        <ResultCard title="Estimated monthly earnings">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[["Low", mut.data.low], ["Average", mut.data.avg], ["High", mut.data.high]].map(([l, v]) => (
              <div key={l as string} className="text-center p-4 rounded-lg bg-muted/40">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{l}</div>
                <div className="text-2xl font-bold mt-1">${v}</div>
              </div>
            ))}
          </div>
          {mut.data.breakdown && (
            <div className="space-y-2 text-sm">
              {mut.data.breakdown.map(b => (
                <div key={b.label} className="flex justify-between border-b border-border/40 pb-2">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-medium">{b.value}</span>
                </div>
              ))}
            </div>
          )}
        </ResultCard>
      )}
    </>
  );
}

// ─────────── TikTok Earnings ───────────
export function TiktokEarningsTool() {
  const mut = useCalcTiktokEarnings();
  const [views, setViews] = useState("1000000");
  const [followers, setFollowers] = useState("50000");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { views: Number(views), followers: Number(followers) || undefined } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>Monthly views</Label><Input type="number" value={views} onChange={e => setViews(e.target.value)} required /></div>
        <div><Label>Followers (for sponsorship estimate)</Label><Input type="number" value={followers} onChange={e => setFollowers(e.target.value)} /></div>
        <SubmitButton pending={mut.isPending} label="Calculate earnings" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data && (
        <ResultCard title="Estimated TikTok earnings">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Stat label="Low" value={`$${mut.data.low}`} />
            <Stat label="Average" value={`$${mut.data.avg}`} />
            <Stat label="High" value={`$${mut.data.high}`} />
          </div>
          {mut.data.breakdown && <Breakdown items={mut.data.breakdown} />}
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Instagram Earnings ───────────
export function InstagramEarningsTool() {
  const mut = useCalcInstagramEarnings();
  const [followers, setFollowers] = useState("10000");
  const [er, setEr] = useState("3");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { followers: Number(followers), engagementRate: Number(er) || undefined } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>Followers</Label><Input type="number" value={followers} onChange={e => setFollowers(e.target.value)} required /></div>
        <div><Label>Engagement rate (%)</Label><Input type="number" step="0.1" value={er} onChange={e => setEr(e.target.value)} /></div>
        <SubmitButton pending={mut.isPending} label="Calculate earnings" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data && (
        <ResultCard title="Estimated Instagram sponsored post rate">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Stat label="Low" value={`$${mut.data.low}`} />
            <Stat label="Average" value={`$${mut.data.avg}`} />
            <Stat label="High" value={`$${mut.data.high}`} />
          </div>
          {mut.data.breakdown && <Breakdown items={mut.data.breakdown} />}
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Engagement Rate ───────────
export function EngagementRateTool() {
  const mut = useCalcEngagementRate();
  const [f, setF] = useState("10000");
  const [l, setL] = useState("500");
  const [c, setC] = useState("50");
  const [s, setS] = useState("20");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { followers: Number(f), likes: Number(l), comments: Number(c), shares: Number(s) } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Followers</Label><Input type="number" value={f} onChange={e => setF(e.target.value)} required /></div>
          <div><Label>Likes</Label><Input type="number" value={l} onChange={e => setL(e.target.value)} required /></div>
          <div><Label>Comments</Label><Input type="number" value={c} onChange={e => setC(e.target.value)} /></div>
          <div><Label>Shares</Label><Input type="number" value={s} onChange={e => setS(e.target.value)} /></div>
        </div>
        <SubmitButton pending={mut.isPending} label="Calculate engagement rate" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data && (
        <ResultCard title="Your engagement rate">
          <div className="text-center mb-4">
            <div className="text-5xl font-extrabold text-primary">{mut.data.rate}%</div>
            <Badge className="mt-3" variant="secondary">{mut.data.rating}</Badge>
          </div>
          {mut.data.tip && <p className="text-sm text-muted-foreground text-center max-w-md mx-auto">{mut.data.tip}</p>}
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Thumbnail Downloader ───────────
export function ThumbnailDownloaderTool() {
  const mut = useDownloadThumbnail();
  const [url, setUrl] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { url } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div>
          <Label>YouTube video URL</Label>
          <Input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." required />
        </div>
        <SubmitButton pending={mut.isPending} label="Get thumbnails" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data && (
        <ResultCard title="Available thumbnails">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mut.data.thumbnails.map(t => (
              <div key={t.url} className="rounded-lg overflow-hidden border border-border bg-muted/40">
                <img src={t.url} alt={t.quality} className="w-full aspect-video object-cover bg-muted" />
                <div className="p-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{t.quality}</span>
                  <Button asChild size="sm" variant="outline">
                    <a href={t.url} target="_blank" rel="noreferrer" download>
                      <Download className="h-3.5 w-3.5 mr-1.5" />Open
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Generic keyword tools ───────────
function KeywordTool({ mut, label, placeholder }: { mut: any; label: string; placeholder: string }) {
  const [k, setK] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { keyword: k } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div>
          <Label>{label}</Label>
          <Input value={k} onChange={e => setK(e.target.value)} placeholder={placeholder} required />
        </div>
        <SubmitButton pending={mut.isPending} label="Generate" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data?.items && (
        <ResultCard title="Suggestions">
          <ListResult items={mut.data.items} />
        </ResultCard>
      )}
    </>
  );
}

export function ChannelNameTool() { return <KeywordTool mut={useGenerateChannelName()} label="Topic / niche" placeholder="e.g. fitness, gaming" />; }
export function YoutubeTitleTool() { return <KeywordTool mut={useGenerateYoutubeTitle()} label="Video topic" placeholder="e.g. iPhone camera tips" />; }
export function ContentIdeaTool() { return <KeywordTool mut={useGenerateContentIdeas()} label="Niche / topic" placeholder="e.g. minimalist living" />; }
export function ThumbnailTextTool() { return <KeywordTool mut={useGenerateThumbnailText()} label="Topic" placeholder="e.g. best phone" />; }
export function SeoTitleTool() { return <KeywordTool mut={useGenerateSeoTitle()} label="Keyword" placeholder="e.g. content marketing" />; }

// ─────────── Hashtag Generator ───────────
export function HashtagTool() {
  const mut = useGenerateHashtags();
  const [k, setK] = useState("");
  const [p, setP] = useState("instagram");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { keyword: k, platform: p } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>Keyword</Label><Input value={k} onChange={e => setK(e.target.value)} placeholder="e.g. fitness" required /></div>
        <div>
          <Label>Platform</Label>
          <Select value={p} onValueChange={setP}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="twitter">X / Twitter</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SubmitButton pending={mut.isPending} label="Generate hashtags" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data?.items && (
        <ResultCard title="Hashtags">
          <div className="flex flex-wrap gap-2 mb-4">
            {mut.data.items.map((h, i) => (
              <Badge key={`${h}-${i}`} variant="secondary" className="text-sm font-mono">{h}</Badge>
            ))}
          </div>
          <CopyButton value={mut.data.items.join(" ")} label="Copy all hashtags" size="default" />
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Caption Generator ───────────
export function CaptionTool() {
  const mut = useGenerateCaption();
  const [k, setK] = useState("");
  const [tone, setTone] = useState("default");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { keyword: k, tone } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>Topic / keyword</Label><Input value={k} onChange={e => setK(e.target.value)} placeholder="e.g. coffee" required /></div>
        <div>
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Casual</SelectItem>
              <SelectItem value="funny">Funny</SelectItem>
              <SelectItem value="motivational">Motivational</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <SubmitButton pending={mut.isPending} label="Generate captions" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data?.items && (
        <ResultCard title="Caption options">
          <div className="space-y-3">
            {mut.data.items.map((c, i) => (
              <div key={i} className="p-4 rounded-lg border border-border bg-muted/30 flex justify-between gap-3">
                <p className="text-sm leading-relaxed flex-1">{c}</p>
                <CopyButton value={c} label="" />
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── AI Thumbnail Generator ───────────
export function AiThumbnailTool() {
  const mut = useGenerateAiThumbnail();
  const [k, setK] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { keyword: k } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>Video topic</Label><Input value={k} onChange={e => setK(e.target.value)} placeholder="e.g. morning routine" required /></div>
        <SubmitButton pending={mut.isPending} label="Generate thumbnail concepts" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data?.layouts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mut.data.layouts.map(l => (
            <Card key={l.title}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{l.title}</h4>
                  <div className="flex gap-1">
                    {l.colors.map(c => (
                      <div key={c} className="h-6 w-6 rounded-full border border-border" style={{ backgroundColor: c }} title={c} />
                    ))}
                  </div>
                </div>
                <div className="aspect-video rounded-lg flex items-center justify-center text-2xl font-extrabold text-center px-4" style={{ backgroundColor: l.colors[0], color: l.colors[2] || "#fff" }}>
                  {l.text}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{l.tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

// ─────────── Meta Tag Generator ───────────
export function MetaTagTool() {
  const mut = useGenerateMetaTags();
  const [t, setT] = useState("");
  const [d, setD] = useState("");
  const [u, setU] = useState("");
  const [img, setImg] = useState("");
  const [kw, setKw] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { title: t, description: d, url: u || undefined, image: img || undefined, keywords: kw || undefined } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>Page title *</Label><Input value={t} onChange={e => setT(e.target.value)} required /></div>
        <div><Label>Meta description *</Label><Textarea value={d} onChange={e => setD(e.target.value)} rows={2} required /></div>
        <div><Label>Page URL</Label><Input value={u} onChange={e => setU(e.target.value)} placeholder="https://example.com/page" /></div>
        <div><Label>OG image URL</Label><Input value={img} onChange={e => setImg(e.target.value)} placeholder="https://example.com/preview.jpg" /></div>
        <div><Label>Keywords (comma-separated)</Label><Input value={kw} onChange={e => setKw(e.target.value)} /></div>
        <SubmitButton pending={mut.isPending} label="Generate meta tags" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data?.html && <ResultCard title="Generated meta tags"><CodeBlock value={mut.data.html} lang="html" /></ResultCard>}
    </>
  );
}

// ─────────── Keyword Density ───────────
export function KeywordDensityTool() {
  const mut = useKeywordDensity();
  const [text, setText] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { text } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>Paste your text</Label><Textarea rows={8} value={text} onChange={e => setText(e.target.value)} required /></div>
        <SubmitButton pending={mut.isPending} label="Analyze keywords" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data && (
        <ResultCard title={`Top keywords (${mut.data.wordCount} total words)`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr><th className="py-2">Word</th><th className="py-2">Count</th><th className="py-2">Density</th></tr>
              </thead>
              <tbody>
                {mut.data.keywords.map(k => (
                  <tr key={k.word} className="border-b border-border/40">
                    <td className="py-2 font-medium">{k.word}</td>
                    <td className="py-2">{k.count}</td>
                    <td className="py-2">{k.density}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Sitemap Generator ───────────
export function SitemapTool() {
  const mut = useGenerateSitemap();
  const [text, setText] = useState("https://example.com/\nhttps://example.com/about\nhttps://example.com/contact");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const urls = text.split("\n").map(s => s.trim()).filter(Boolean);
    mut.mutate({ data: { urls } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>URLs (one per line)</Label><Textarea rows={6} value={text} onChange={e => setText(e.target.value)} required /></div>
        <SubmitButton pending={mut.isPending} label="Generate sitemap" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data?.value && <ResultCard title="sitemap.xml"><CodeBlock value={mut.data.value} lang="xml" /></ResultCard>}
    </>
  );
}

// ─────────── Robots.txt Generator ───────────
export function RobotsTool() {
  const mut = useGenerateRobotsTxt();
  const [allow, setAllow] = useState(true);
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const [disallowed, setDisallowed] = useState("/admin\n/private");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { allowAll: allow, sitemapUrl: sitemap || undefined, disallowed: disallowed.split("\n").map(s => s.trim()).filter(Boolean) } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div>
            <Label className="text-base">Allow all bots</Label>
            <p className="text-xs text-muted-foreground mt-1">Toggle off to block all crawlers globally</p>
          </div>
          <Switch checked={allow} onCheckedChange={setAllow} />
        </div>
        <div><Label>Sitemap URL</Label><Input value={sitemap} onChange={e => setSitemap(e.target.value)} placeholder="https://yoursite.com/sitemap.xml" /></div>
        <div><Label>Disallowed paths (one per line)</Label><Textarea rows={4} value={disallowed} onChange={e => setDisallowed(e.target.value)} /></div>
        <SubmitButton pending={mut.isPending} label="Generate robots.txt" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data?.value && <ResultCard title="robots.txt"><CodeBlock value={mut.data.value} /></ResultCard>}
    </>
  );
}

// ─────────── Social Media Resizer (specs) ───────────
export function SocialResizerTool() {
  const mut = useSocialResizerSpecs();
  const onLoad = () => mut.mutate();
  return (
    <>
      <Card>
        <CardContent className="pt-6 text-sm space-y-3">
          <p className="text-muted-foreground">Browse the official image sizes for every major platform. Click below to load the latest specs.</p>
          <Button onClick={onLoad} disabled={mut.isPending} size="lg">
            {mut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Load specs
          </Button>
          <ErrorMsg error={mut.error} />
        </CardContent>
      </Card>
      {mut.data?.platforms && (
        <ResultCard title="Platform specifications">
          <div className="space-y-6">
            {mut.data.platforms.map(p => (
              <div key={p.platform}>
                <h4 className="font-semibold mb-3">{p.platform}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {p.specs.map(s => (
                    <div key={s.name} className="p-3 rounded-lg border border-border bg-muted/30">
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.width} × {s.height} px</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
    </>
  );
}

// ─────────── Creator Kit ───────────
export function CreatorKitTool() {
  const mut = useGenerateCreatorKit();
  const [k, setK] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { keyword: k } });
  };
  return (
    <>
      <FormCard onSubmit={onSubmit}>
        <div><Label>Your video / post topic</Label><Input value={k} onChange={e => setK(e.target.value)} placeholder="e.g. workout for beginners" required /></div>
        <SubmitButton pending={mut.isPending} label="Generate creator kit" />
        <ErrorMsg error={mut.error} />
      </FormCard>
      {mut.data && (
        <div className="space-y-4">
          <ResultCard title="Title">
            <div className="flex justify-between gap-3">
              <p className="text-lg font-semibold flex-1">{mut.data.title}</p>
              <CopyButton value={mut.data.title} label="" />
            </div>
          </ResultCard>
          <ResultCard title="Thumbnail idea">
            <p className="text-sm leading-relaxed">{mut.data.thumbnailIdea}</p>
          </ResultCard>
          <ResultCard title="Hashtags">
            <div className="flex flex-wrap gap-2 mb-3">
              {mut.data.hashtags.map((h, i) => <Badge key={`${h}-${i}`} variant="secondary" className="font-mono">{h}</Badge>)}
            </div>
            <CopyButton value={mut.data.hashtags.join(" ")} label="Copy all" />
          </ResultCard>
          <ResultCard title="Caption">
            <p className="text-sm leading-relaxed mb-3">{mut.data.caption}</p>
            <CopyButton value={mut.data.caption} label="Copy caption" />
          </ResultCard>
        </div>
      )}
    </>
  );
}

// ─────────── helpers ───────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center p-4 rounded-lg bg-muted/40">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Breakdown({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="space-y-2 text-sm">
      {items.map(b => (
        <div key={b.label} className="flex justify-between border-b border-border/40 pb-2">
          <span className="text-muted-foreground">{b.label}</span>
          <span className="font-medium">{b.value}</span>
        </div>
      ))}
    </div>
  );
}
