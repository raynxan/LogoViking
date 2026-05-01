import { Router, type IRouter } from "express";
import blogPosts from "../data/blog-posts.json" with { type: "json" };

const router: IRouter = Router();

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number;
  contentHtml: string;
}

const posts = blogPosts as BlogPost[];

router.get("/blog", (_req, res) => {
  return res.json({
    items: posts.map(({ slug, title, excerpt, category, readingTime }) => ({
      slug, title, excerpt, category, readingTime,
    })),
  });
});

router.get("/blog/:slug", (req, res) => {
  const post = posts.find(p => p.slug === req.params.slug);
  if (!post) return res.status(404).json({ error: "Post not found" });
  return res.json(post);
});

export default router;
