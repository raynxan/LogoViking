import { Router, type IRouter } from "express";
import { db, usageHistoryTable } from "@workspace/db";
import { and, eq, gt, sql } from "drizzle-orm";
import { getUserFromRequest } from "../lib/auth";
import {
  CalcYoutubeEarningsBody,
  CalcTiktokEarningsBody,
  CalcInstagramEarningsBody,
  CalcEngagementRateBody,
  DownloadThumbnailBody,
  GenerateChannelNameBody,
  GenerateHashtagsBody,
  GenerateCaptionBody,
  GenerateYoutubeTitleBody,
  GenerateContentIdeasBody,
  GenerateThumbnailTextBody,
  GenerateAiThumbnailBody,
  GenerateMetaTagsBody,
  KeywordDensityBody,
  GenerateSeoTitleBody,
  GenerateSitemapBody,
  GenerateRobotsTxtBody,
  GenerateCreatorKitBody,
} from "@workspace/api-zod";
import { logHistory } from "../lib/history";

const router: IRouter = Router();

function pad(n: number) { return Math.round(n * 100) / 100; }

router.post("/tools/youtube-earnings", async (req, res) => {
  const body = CalcYoutubeEarningsBody.parse(req.body);
  const cpm = body.cpm ?? 4;
  const base = (body.views / 1000) * cpm;
  const low = pad(base * 0.55);
  const avg = pad(base * 0.68);
  const high = pad(base * 0.85);
  await logHistory(req, "youtube-earnings", `${body.views.toLocaleString()} views ≈ $${avg}`);
  return res.json({
    low, avg, high, currency: "USD",
    breakdown: [
      { label: "Estimated CPM", value: `$${cpm.toFixed(2)}` },
      { label: "Gross ad revenue", value: `$${pad(base).toFixed(2)}` },
      { label: "YouTube cut (45%)", value: `-$${pad(base * 0.45).toFixed(2)}` },
      { label: "Your share (55-85%)", value: `$${low} - $${high}` },
    ],
  });
});

router.post("/tools/tiktok-earnings", async (req, res) => {
  const body = CalcTiktokEarningsBody.parse(req.body);
  const creatorFundRate = 0.025;
  const sponsorshipRate = body.followers ? body.followers / 1000 * 10 : 0;
  const fundEarnings = (body.views / 1000) * creatorFundRate;
  const total = fundEarnings + sponsorshipRate * (body.views / 100000);
  const low = pad(total * 0.5);
  const avg = pad(total);
  const high = pad(total * 1.8);
  await logHistory(req, "tiktok-earnings", `${body.views.toLocaleString()} views ≈ $${avg}`);
  return res.json({
    low, avg, high, currency: "USD",
    breakdown: [
      { label: "Creator Fund ($0.02-$0.04 per 1k)", value: `$${pad(fundEarnings).toFixed(2)}` },
      { label: "Brand deal potential", value: body.followers ? `$${pad(sponsorshipRate).toFixed(0)}/post` : "Need followers" },
      { label: "Total estimated range", value: `$${low} - $${high}` },
    ],
  });
});

router.post("/tools/instagram-earnings", async (req, res) => {
  const body = CalcInstagramEarningsBody.parse(req.body);
  const er = body.engagementRate ?? 3;
  const ratePerPost = (body.followers / 1000) * (er / 3) * 10;
  const low = pad(ratePerPost * 0.6);
  const avg = pad(ratePerPost);
  const high = pad(ratePerPost * 1.6);
  await logHistory(req, "instagram-earnings", `${body.followers.toLocaleString()} followers ≈ $${avg}/post`);
  return res.json({
    low, avg, high, currency: "USD",
    breakdown: [
      { label: "Followers", value: body.followers.toLocaleString() },
      { label: "Engagement rate", value: `${er}%` },
      { label: "Per sponsored post", value: `$${low} - $${high}` },
      { label: "Per story (50% of post)", value: `$${pad(low * 0.5)} - $${pad(high * 0.5)}` },
    ],
  });
});

router.post("/tools/engagement-rate", async (req, res) => {
  const body = CalcEngagementRateBody.parse(req.body);
  const interactions = body.likes + (body.comments ?? 0) + (body.shares ?? 0);
  const rate = pad((interactions / body.followers) * 100);
  let rating = "Low";
  let tip = "Try posting at peak hours and use 5-10 niche hashtags.";
  if (rate >= 1 && rate < 3.5) { rating = "Average"; tip = "Add a clear call-to-action in your captions to lift comments."; }
  if (rate >= 3.5 && rate < 6) { rating = "Good"; tip = "You're above the niche average. Test more carousel posts."; }
  if (rate >= 6) { rating = "Excellent"; tip = "Top-tier engagement. Consider monetising via brand deals."; }
  await logHistory(req, "engagement-rate", `${rate}% (${rating})`);
  return res.json({ rate, rating, tip });
});

router.post("/tools/thumbnail-downloader", async (req, res) => {
  const body = DownloadThumbnailBody.parse(req.body);
  const idMatch = body.url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (!idMatch) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }
  const videoId = idMatch[1];
  const qualities = [
    { quality: "Max Resolution (1280×720)", url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
    { quality: "High Quality (480×360)", url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
    { quality: "Medium (320×180)", url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
    { quality: "Standard (640×480)", url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg` },
  ];
  await logHistory(req, "thumbnail-downloader", `Video ${videoId}`);
  return res.json({ videoId, thumbnails: qualities });
});

const NAME_PREFIXES = ["The", "Daily", "Real", "Pure", "Bold", "Modern", "Smart", "Bright", "Wild", "Epic", "Prime", "Next", "Top", "Mighty"];
const NAME_SUFFIXES = ["Hub", "Lab", "House", "Studio", "Crew", "Pulse", "Zone", "Vault", "Edge", "Society", "Insider", "Files", "Diary", "Wave"];

router.post("/tools/channel-name-generator", async (req, res) => {
  const body = GenerateChannelNameBody.parse(req.body);
  const k = body.keyword.trim();
  const cap = k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
  const items: string[] = [];
  for (let i = 0; i < 12; i++) {
    const p = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const s = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
    items.push(`${p}${cap}${s}`);
  }
  const unique = Array.from(new Set(items)).slice(0, 10);
  await logHistory(req, "channel-name-generator", `Keyword: ${k}`);
  return res.json({ items: unique });
});

const HASHTAG_BANK: Record<string, string[]> = {
  general: ["trending", "viral", "explore", "fyp", "foryou", "love", "instagood", "photooftheday", "follow", "like4like"],
  fitness: ["fitness", "gym", "workout", "fitlife", "fitfam", "training", "health", "motivation", "transformation", "fitspo"],
  food: ["food", "foodie", "foodporn", "instafood", "delicious", "yummy", "homemade", "recipe", "cooking", "foodblogger"],
  travel: ["travel", "wanderlust", "travelphotography", "adventure", "explore", "vacation", "instatravel", "travelgram", "nature", "trip"],
  fashion: ["fashion", "style", "ootd", "outfit", "fashionblogger", "streetstyle", "fashionista", "look", "trend", "stylish"],
  tech: ["tech", "technology", "innovation", "gadgets", "ai", "coding", "developer", "programming", "techreview", "future"],
  business: ["entrepreneur", "business", "startup", "marketing", "success", "motivation", "leadership", "smallbusiness", "branding", "growth"],
};

router.post("/tools/hashtag-generator", async (req, res) => {
  const body = GenerateHashtagsBody.parse(req.body);
  const keyword = body.keyword.toLowerCase().trim();
  const niche = Object.keys(HASHTAG_BANK).find(k => keyword.includes(k)) || "general";
  const cleanKw = keyword.replace(/\s+/g, "");
  const items = [
    `#${cleanKw}`,
    `#${cleanKw}lover`,
    `#${cleanKw}life`,
    `#${cleanKw}community`,
    `#${cleanKw}daily`,
    ...HASHTAG_BANK[niche].slice(0, 15).map(t => `#${t}`),
    `#${cleanKw}2025`,
    `#${cleanKw}gram`,
    `#${cleanKw}addict`,
    `#best${cleanKw}`,
  ].slice(0, 25);
  await logHistory(req, "hashtag-generator", `Keyword: ${body.keyword}`);
  return res.json({ items });
});

const CAPTION_TEMPLATES: Record<string, string[]> = {
  default: [
    "Sometimes the best moments are the ones you don't plan. ✨",
    "Doing what I love, with the people I love. About {kw} and everything in between.",
    "Reminder: {kw} doesn't have to be perfect to be worth it.",
    "Small wins, big dreams. This is my {kw} era.",
    "If you needed a sign to start your {kw} journey — this is it.",
  ],
  funny: [
    "Currently accepting applications for someone who'll be obsessed with {kw} as much as I am.",
    "Me: I'm done with {kw}. Also me: posts about {kw} again.",
    "Plot twist: {kw} is actually the main character.",
  ],
  motivational: [
    "Every expert was once a beginner. Keep going. #{kw}",
    "{kw} doesn't change your life — showing up for {kw} every day does.",
    "Discipline beats motivation. Especially when it comes to {kw}.",
  ],
};

router.post("/tools/caption-generator", async (req, res) => {
  const body = GenerateCaptionBody.parse(req.body);
  const tone = (body.tone || "default") as keyof typeof CAPTION_TEMPLATES;
  const list = CAPTION_TEMPLATES[tone] || CAPTION_TEMPLATES.default;
  const items = list.map(s => s.replace(/\{kw\}/g, body.keyword));
  await logHistory(req, "caption-generator", `Keyword: ${body.keyword}`);
  return res.json({ items });
});

router.post("/tools/youtube-title-generator", async (req, res) => {
  const body = GenerateYoutubeTitleBody.parse(req.body);
  const k = body.keyword;
  const items = [
    `I Tried ${k} for 30 Days — Here's What Happened`,
    `${k}: The Truth Nobody Tells You`,
    `Why ${k} Is Changing Everything in 2025`,
    `7 ${k} Mistakes Beginners Always Make`,
    `The Ultimate ${k} Guide (Step by Step)`,
    `How I Mastered ${k} in One Week`,
    `${k} Explained in Under 10 Minutes`,
    `Stop Doing ${k} Wrong — Do This Instead`,
    `The Best ${k} Strategy in 2025`,
    `${k} for Beginners: Where to Actually Start`,
  ];
  await logHistory(req, "youtube-title-generator", `Keyword: ${k}`);
  return res.json({ items });
});

router.post("/tools/content-idea-generator", async (req, res) => {
  const body = GenerateContentIdeasBody.parse(req.body);
  const k = body.keyword;
  const items = [
    `A day in the life of someone passionate about ${k}`,
    `Top 5 myths about ${k} — busted`,
    `Beginner mistakes in ${k} you can avoid`,
    `${k} trends that will dominate next year`,
    `Behind-the-scenes of my ${k} setup`,
    `Reacting to popular ${k} videos`,
    `${k} on a budget vs ${k} unlimited`,
    `Q&A: Everything you wanted to know about ${k}`,
    `My ${k} routine that actually works`,
    `Reviewing trending ${k} products`,
  ];
  await logHistory(req, "content-idea-generator", `Keyword: ${k}`);
  return res.json({ items });
});

router.post("/tools/thumbnail-text-generator", async (req, res) => {
  const body = GenerateThumbnailTextBody.parse(req.body);
  const k = body.keyword.toUpperCase();
  const items = [
    `${k} SECRETS`,
    `I TRIED ${k}!`,
    `${k} GONE WRONG`,
    `STOP ${k} NOW`,
    `THE BEST ${k}`,
    `${k} HACK`,
    `${k} EXPOSED`,
    `${k} IN 60s`,
    `${k} CHALLENGE`,
    `WHY ${k}?`,
  ];
  await logHistory(req, "thumbnail-text-generator", `Keyword: ${body.keyword}`);
  return res.json({ items });
});

router.post("/tools/ai-thumbnail-generator", async (req, res) => {
  const body = GenerateAiThumbnailBody.parse(req.body);
  const k = body.keyword;
  const layouts = [
    {
      title: "Bold & Curious",
      text: `${k.toUpperCase()}?!`,
      colors: ["#FF3B30", "#FFD60A", "#0A0A0A"],
      tip: "Big single word, shocked face on left, neon arrow pointing to subject.",
    },
    {
      title: "Tutorial Clean",
      text: `HOW TO ${k.toUpperCase()}`,
      colors: ["#0F172A", "#22D3EE", "#F8FAFC"],
      tip: "Split-screen before/after. Add a green checkmark on the result side.",
    },
    {
      title: "Listicle Hype",
      text: `7 ${k.toUpperCase()} HACKS`,
      colors: ["#7C3AED", "#FACC15", "#FFFFFF"],
      tip: "Number large in corner, faded screenshot stack on the side.",
    },
    {
      title: "Reaction-Style",
      text: `${k.toUpperCase()} GONE WRONG`,
      colors: ["#DC2626", "#000000", "#FCD34D"],
      tip: "Dramatic face, red circle around the failure moment, motion blur edges.",
    },
  ];
  await logHistory(req, "ai-thumbnail-generator", `Topic: ${k}`);
  return res.json({ layouts });
});

router.post("/tools/meta-tag-generator", async (req, res) => {
  const body = GenerateMetaTagsBody.parse(req.body);
  const t = body.title;
  const d = body.description;
  const url = body.url || "";
  const img = body.image || "";
  const kw = body.keywords || "";
  const html = `<title>${t}</title>
<meta name="description" content="${d}" />
${kw ? `<meta name="keywords" content="${kw}" />\n` : ""}<meta name="robots" content="index, follow" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${t}" />
<meta property="og:description" content="${d}" />
${url ? `<meta property="og:url" content="${url}" />\n` : ""}${img ? `<meta property="og:image" content="${img}" />\n` : ""}<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${t}" />
<meta name="twitter:description" content="${d}" />
${url ? `<link rel="canonical" href="${url}" />` : ""}`;
  await logHistory(req, "meta-tag-generator", t);
  return res.json({ html });
});

const STOPWORDS = new Set(["the", "a", "an", "and", "or", "but", "of", "in", "on", "for", "to", "with", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "should", "could", "may", "might", "must", "shall", "can", "need", "i", "you", "he", "she", "it", "we", "they", "this", "that", "these", "those", "as", "at", "by", "from", "if", "not", "no", "so"]);

router.post("/tools/keyword-density", async (req, res) => {
  const body = KeywordDensityBody.parse(req.body);
  const words = body.text.toLowerCase().match(/\b[a-z][a-z'-]{2,}\b/g) || [];
  const wordCount = words.length;
  const counts = new Map<string, number>();
  for (const w of words) {
    if (STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  const keywords = Array.from(counts.entries())
    .map(([word, count]) => ({ word, count, density: pad((count / wordCount) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  await logHistory(req, "keyword-density", `${wordCount} words analyzed`);
  return res.json({ wordCount, keywords });
});

router.post("/tools/seo-title-generator", async (req, res) => {
  const body = GenerateSeoTitleBody.parse(req.body);
  const k = body.keyword;
  const items = [
    `${k} — Complete Guide for 2025`,
    `Best ${k} Tools, Tips & Strategies`,
    `${k}: Everything You Need to Know`,
    `Top 10 ${k} Mistakes (And How to Fix Them)`,
    `The Ultimate ${k} Checklist`,
    `${k} for Beginners — Step by Step`,
    `How to Master ${k} in 7 Days`,
    `${k} vs Alternatives: Honest Comparison`,
    `Free ${k} Resources You Can Use Today`,
    `${k} Trends to Watch in 2025`,
  ];
  await logHistory(req, "seo-title-generator", k);
  return res.json({ items });
});

router.post("/tools/sitemap-generator", async (req, res) => {
  const body = GenerateSitemapBody.parse(req.body);
  const today = new Date().toISOString().split("T")[0];
  const urls = body.urls.map(u =>
    `  <url>\n    <loc>${u}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  ).join("\n");
  const value = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  await logHistory(req, "sitemap-generator", `${body.urls.length} URLs`);
  return res.json({ value });
});

router.post("/tools/robots-txt-generator", async (req, res) => {
  const body = GenerateRobotsTxtBody.parse(req.body);
  let value = `User-agent: *\n`;
  if (body.allowAll) {
    value += `Allow: /\n`;
  } else {
    value += `Disallow: /\n`;
  }
  for (const path of body.disallowed || []) {
    value += `Disallow: ${path}\n`;
  }
  if (body.sitemapUrl) {
    value += `\nSitemap: ${body.sitemapUrl}\n`;
  }
  await logHistory(req, "robots-txt-generator", body.allowAll ? "Allow all" : "Disallow all");
  return res.json({ value });
});

const BG_REMOVER_TOOL = "background-remover";
const BG_REMOVER_LIMITS: Record<string, number> = {
  anonymous: 3,
  free: 5,
  pro: 100,
};
const BG_REMOVER_WINDOW_MS = 24 * 60 * 60 * 1000;

interface AnonUsage {
  count: number;
  resetAt: number;
}
const anonBgUsage = new Map<string, AnonUsage>();

function recordAnonBgUsage(ip: string): number {
  const now = Date.now();
  const existing = anonBgUsage.get(ip);
  if (!existing || existing.resetAt <= now) {
    anonBgUsage.set(ip, { count: 1, resetAt: now + BG_REMOVER_WINDOW_MS });
    return 1;
  }
  existing.count += 1;
  return existing.count;
}

function peekAnonBgUsage(ip: string): number {
  const now = Date.now();
  const existing = anonBgUsage.get(ip);
  if (!existing || existing.resetAt <= now) return 0;
  return existing.count;
}

async function countUserBgUsage(userId: number): Promise<number> {
  const since = new Date(Date.now() - BG_REMOVER_WINDOW_MS);
  const rows = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(usageHistoryTable)
    .where(
      and(
        eq(usageHistoryTable.userId, userId),
        eq(usageHistoryTable.tool, BG_REMOVER_TOOL),
        gt(usageHistoryTable.createdAt, since),
      ),
    );
  return Number(rows[0]?.count ?? 0);
}

router.get("/tools/background-remover/quota", async (req, res) => {
  const user = await getUserFromRequest(req);
  const plan = user ? (user.plan === "pro" ? "pro" : "free") : "anonymous";
  const limit = BG_REMOVER_LIMITS[plan];
  const used = user
    ? await countUserBgUsage(user.id)
    : peekAnonBgUsage(req.ip ?? "unknown");
  const remaining = Math.max(0, limit - used);
  return res.json({
    allowed: used < limit,
    plan,
    used,
    limit,
    remaining,
    reason: used >= limit ? "limit_reached" : null,
  });
});

router.post("/tools/background-remover/use", async (req, res) => {
  const user = await getUserFromRequest(req);
  const plan = user ? (user.plan === "pro" ? "pro" : "free") : "anonymous";
  const limit = BG_REMOVER_LIMITS[plan];

  let used: number;
  if (user) {
    const current = await countUserBgUsage(user.id);
    if (current >= limit) {
      return res.json({
        allowed: false,
        plan,
        used: current,
        limit,
        remaining: 0,
        reason: "limit_reached",
      });
    }
    await db.insert(usageHistoryTable).values({
      userId: user.id,
      tool: BG_REMOVER_TOOL,
      summary: "Removed image background",
    });
    used = current + 1;
  } else {
    const ip = req.ip ?? "unknown";
    const current = peekAnonBgUsage(ip);
    if (current >= limit) {
      return res.json({
        allowed: false,
        plan,
        used: current,
        limit,
        remaining: 0,
        reason: "limit_reached",
      });
    }
    used = recordAnonBgUsage(ip);
  }

  return res.json({
    allowed: true,
    plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    reason: null,
  });
});

router.post("/tools/social-media-resizer", async (req, res) => {
  const platforms = [
    { platform: "Instagram", specs: [
      { name: "Square Post", width: 1080, height: 1080 },
      { name: "Portrait Post", width: 1080, height: 1350 },
      { name: "Story / Reel", width: 1080, height: 1920 },
      { name: "Profile Picture", width: 320, height: 320 },
    ]},
    { platform: "YouTube", specs: [
      { name: "Thumbnail", width: 1280, height: 720 },
      { name: "Channel Banner", width: 2560, height: 1440 },
      { name: "Shorts", width: 1080, height: 1920 },
    ]},
    { platform: "TikTok", specs: [
      { name: "Video", width: 1080, height: 1920 },
      { name: "Profile Picture", width: 200, height: 200 },
    ]},
    { platform: "Facebook", specs: [
      { name: "Post", width: 1200, height: 630 },
      { name: "Cover Photo", width: 851, height: 315 },
      { name: "Story", width: 1080, height: 1920 },
    ]},
    { platform: "X / Twitter", specs: [
      { name: "Post Image", width: 1600, height: 900 },
      { name: "Header", width: 1500, height: 500 },
    ]},
    { platform: "LinkedIn", specs: [
      { name: "Post", width: 1200, height: 627 },
      { name: "Banner", width: 1584, height: 396 },
    ]},
    { platform: "Pinterest", specs: [
      { name: "Pin", width: 1000, height: 1500 },
    ]},
  ];
  await logHistory(req, "social-media-resizer", "Loaded specs");
  return res.json({ platforms });
});

router.post("/tools/creator-kit", async (req, res) => {
  const body = GenerateCreatorKitBody.parse(req.body);
  const k = body.keyword;
  const cleanKw = k.toLowerCase().replace(/\s+/g, "");
  const niche = Object.keys(HASHTAG_BANK).find(key => k.toLowerCase().includes(key)) || "general";
  const result = {
    thumbnailIdea: `Bold close-up shot, big yellow text "${k.toUpperCase()}?!" on the left, expressive face on the right with a red arrow pointing to the subject.`,
    title: `I Tried ${k} for 30 Days — Here's What Actually Happened`,
    hashtags: [
      `#${cleanKw}`,
      `#${cleanKw}life`,
      `#${cleanKw}community`,
      `#${cleanKw}2025`,
      ...HASHTAG_BANK[niche].slice(0, 6).map(t => `#${t}`),
    ],
    caption: `Nobody told me ${k} would change everything. After 30 days of consistent ${k}, here's what I learned: it's not about being perfect, it's about showing up. Save this if you needed the reminder. What's holding you back from starting your ${k} journey?`,
  };
  await logHistory(req, "creator-kit", k);
  return res.json(result);
});

export default router;
