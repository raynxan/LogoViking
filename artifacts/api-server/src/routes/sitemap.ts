import { Router, type IRouter } from "express";
import blogPosts from "../data/blog-posts.json" with { type: "json" };

const router: IRouter = Router();

const SITE = process.env["SITE_URL"] || "https://logoviking.com";

const TOOL_SLUGS = [
  "compress", "resize", "crop", "convert", "watermark", "background-remover",
  "smart-optimizer", "ai-thumbnail-generator", "thumbnail-text-generator", "social-media-resizer",
  "youtube-earnings", "tiktok-earnings", "instagram-earnings", "engagement-rate", "thumbnail-downloader", "channel-name-generator",
  "hashtag-generator", "caption-generator", "youtube-title-generator", "content-idea-generator",
  "meta-tag-generator", "keyword-density-checker", "seo-title-generator", "sitemap-generator", "robots-txt-generator",
  "creator-kit",
];

const STATIC_PAGES = ["", "tools", "pricing", "blog", "about", "contact", "faq", "privacy-policy", "terms-of-service", "cookie-policy", "disclaimer", "dmca"];

router.get("/sitemap.xml", (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const urls: string[] = [];
  for (const p of STATIC_PAGES) {
    urls.push(`<url><loc>${SITE}/${p}</loc><lastmod>${today}</lastmod><priority>${p === "" ? "1.0" : "0.8"}</priority></url>`);
  }
  for (const slug of TOOL_SLUGS) {
    urls.push(`<url><loc>${SITE}/tools/${slug}</loc><lastmod>${today}</lastmod><priority>0.9</priority></url>`);
  }
  for (const post of blogPosts as Array<{ slug: string }>) {
    urls.push(`<url><loc>${SITE}/blog/${post.slug}</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
  res.type("application/xml").send(xml);
});

router.get("/sitemap-index.xml", (_req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE}/api/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>\n</sitemapindex>`;
  res.type("application/xml").send(xml);
});

router.get("/robots.txt", (_req, res) => {
  const txt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/api/sitemap.xml\n`;
  res.type("text/plain").send(txt);
});

export default router;
