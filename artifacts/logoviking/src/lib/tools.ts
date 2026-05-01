import {
  ImageIcon,
  Crop,
  Maximize,
  Image as FileImage,
  Wand2,
  Minimize2,
  Type,
  Youtube,
  TrendingUp,
  LineChart,
  Instagram,
  Download,
  PenTool,
  Hash,
  MessageSquare,
  Heading,
  Lightbulb,
  Search,
  SearchCheck,
  Globe,
  FileText,
  Bot,
  Zap,
  Scissors,
  Droplet,
  Settings,
  LayoutTemplate,
  Share2,
  AlignLeft
} from "lucide-react";

export type ToolCategory = 
  | "IMAGE TOOLS"
  | "SMART/AI IMAGE TOOLS"
  | "CREATOR TOOLS"
  | "VIRAL GENERATORS"
  | "SEO TOOLS"
  | "ALL-IN-ONE";

export interface ToolDef {
  slug: string;
  name: string;
  category: ToolCategory;
  shortDesc: string;
  longDesc: string;
  icon: any;
  inputType: "file" | "form" | "hybrid";
  related: string[];
  seoTitle: string;
  seoDesc: string;
}

export const TOOLS: ToolDef[] = [
  // IMAGE TOOLS
  {
    slug: "compress",
    name: "Image Compressor",
    category: "IMAGE TOOLS",
    shortDesc: "Compress images without losing quality",
    longDesc: "Reduce the file size of your images in seconds. Perfect for web optimization and faster load times.",
    icon: Minimize2,
    inputType: "file",
    related: ["resize", "convert", "smart-optimizer"],
    seoTitle: "Free Online Image Compressor - LogoViking",
    seoDesc: "Compress PNG, JPG, and WEBP images online for free. Reduce file size without losing quality."
  },
  {
    slug: "resize",
    name: "Image Resizer",
    category: "IMAGE TOOLS",
    shortDesc: "Resize images to exact dimensions",
    longDesc: "Quickly resize your images to specific widths and heights. Great for social media profiles and posts.",
    icon: Maximize,
    inputType: "file",
    related: ["crop", "social-media-resizer", "compress"],
    seoTitle: "Free Online Image Resizer - LogoViking",
    seoDesc: "Resize images online for free. Change dimensions of your photos quickly and easily."
  },
  {
    slug: "crop",
    name: "Image Cropper",
    category: "IMAGE TOOLS",
    shortDesc: "Crop images and photos easily",
    longDesc: "Remove unwanted areas from your images. Freeform crop or use standard aspect ratios.",
    icon: Crop,
    inputType: "file",
    related: ["resize", "social-media-resizer", "watermark"],
    seoTitle: "Free Online Image Cropper - LogoViking",
    seoDesc: "Crop your images online for free. Remove unwanted parts of your photos."
  },
  {
    slug: "convert",
    name: "Image Converter",
    category: "IMAGE TOOLS",
    shortDesc: "Convert between image formats",
    longDesc: "Change image formats between PNG, JPG, WEBP, and more. Fast and secure client-side conversion.",
    icon: FileImage,
    inputType: "file",
    related: ["compress", "smart-optimizer", "resize"],
    seoTitle: "Free Online Image Converter - LogoViking",
    seoDesc: "Convert images to JPG, PNG, WEBP and more for free."
  },
  {
    slug: "watermark",
    name: "Watermark Creator",
    category: "IMAGE TOOLS",
    shortDesc: "Add text watermarks to images",
    longDesc: "Protect your photos by adding custom text watermarks. Adjust opacity, color, and position.",
    icon: Droplet,
    inputType: "file",
    related: ["crop", "resize", "compress"],
    seoTitle: "Add Watermark to Photos Online - LogoViking",
    seoDesc: "Protect your images by adding text watermarks easily and for free."
  },
  {
    slug: "background-remover",
    name: "Background Remover",
    category: "IMAGE TOOLS",
    shortDesc: "Remove image backgrounds",
    longDesc: "Instantly remove backgrounds from your images. (AI removal coming soon - currently desaturates background).",
    icon: Scissors,
    inputType: "file",
    related: ["crop", "watermark", "smart-optimizer"],
    seoTitle: "Free Image Background Remover - LogoViking",
    seoDesc: "Remove backgrounds from your images quickly online."
  },

  // SMART/AI IMAGE TOOLS
  {
    slug: "smart-optimizer",
    name: "Smart Optimizer",
    category: "SMART/AI IMAGE TOOLS",
    shortDesc: "Auto-pick best format & quality",
    longDesc: "Let our smart algorithm choose the optimal format and compression level for your image.",
    icon: Wand2,
    inputType: "file",
    related: ["compress", "convert", "resize"],
    seoTitle: "Smart Image Optimizer - LogoViking",
    seoDesc: "Automatically optimize your images with the best format and quality settings."
  },
  {
    slug: "ai-thumbnail-generator",
    name: "AI Thumbnail Generator",
    category: "SMART/AI IMAGE TOOLS",
    shortDesc: "Generate YouTube thumbnail ideas",
    longDesc: "Get layout ideas, color palettes, and text suggestions for your next viral YouTube thumbnail.",
    icon: LayoutTemplate,
    inputType: "form",
    related: ["thumbnail-text-generator", "youtube-title-generator", "creator-kit"],
    seoTitle: "AI YouTube Thumbnail Generator - LogoViking",
    seoDesc: "Generate high-converting YouTube thumbnail concepts and layouts with AI."
  },
  {
    slug: "thumbnail-text-generator",
    name: "Thumbnail Text Generator",
    category: "SMART/AI IMAGE TOOLS",
    shortDesc: "Catchy text for thumbnails",
    longDesc: "Generate short, punchy text perfectly suited for YouTube thumbnails to maximize click-through rates.",
    icon: Type,
    inputType: "form",
    related: ["ai-thumbnail-generator", "youtube-title-generator", "youtube-earnings"],
    seoTitle: "Thumbnail Text Generator - LogoViking",
    seoDesc: "Create catchy, clickable text for your YouTube thumbnails."
  },
  {
    slug: "social-media-resizer",
    name: "Social Media Resizer",
    category: "SMART/AI IMAGE TOOLS",
    shortDesc: "Resize for all social platforms",
    longDesc: "Automatically resize your images to fit perfectly on Instagram, YouTube, Twitter, Facebook, and more.",
    icon: Share2,
    inputType: "file",
    related: ["resize", "crop", "compress"],
    seoTitle: "Social Media Image Resizer - LogoViking",
    seoDesc: "Resize images perfectly for Instagram, YouTube, Facebook, and other social platforms."
  },

  // CREATOR TOOLS
  {
    slug: "youtube-earnings",
    name: "YouTube Money Calculator",
    category: "CREATOR TOOLS",
    shortDesc: "Estimate YouTube ad revenue",
    longDesc: "Calculate potential YouTube earnings based on daily views, CPM, and engagement rate.",
    icon: Youtube,
    inputType: "form",
    related: ["tiktok-earnings", "instagram-earnings", "channel-name-generator"],
    seoTitle: "YouTube Money Calculator - LogoViking",
    seoDesc: "Estimate your YouTube channel revenue and earnings potential based on views and CPM."
  },
  {
    slug: "tiktok-earnings",
    name: "TikTok Money Calculator",
    category: "CREATOR TOOLS",
    shortDesc: "Estimate TikTok Creator Fund earnings",
    longDesc: "Calculate how much you could earn from TikTok based on your views and follower count.",
    icon: TrendingUp,
    inputType: "form",
    related: ["youtube-earnings", "instagram-earnings", "engagement-rate"],
    seoTitle: "TikTok Money Calculator - LogoViking",
    seoDesc: "Estimate your TikTok earnings and Creator Fund revenue."
  },
  {
    slug: "instagram-earnings",
    name: "Instagram Money Calculator",
    category: "CREATOR TOOLS",
    shortDesc: "Estimate Instagram sponsor value",
    longDesc: "Calculate how much you should charge for sponsored posts on Instagram based on your followers and engagement.",
    icon: Instagram,
    inputType: "form",
    related: ["tiktok-earnings", "youtube-earnings", "engagement-rate"],
    seoTitle: "Instagram Sponsored Post Calculator - LogoViking",
    seoDesc: "Find out how much you should charge for Instagram sponsored posts."
  },
  {
    slug: "engagement-rate",
    name: "Engagement Rate Calculator",
    category: "CREATOR TOOLS",
    shortDesc: "Calculate your true engagement",
    longDesc: "Measure your audience engagement rate across different platforms to show your value to sponsors.",
    icon: LineChart,
    inputType: "form",
    related: ["instagram-earnings", "tiktok-earnings", "youtube-earnings"],
    seoTitle: "Social Media Engagement Rate Calculator - LogoViking",
    seoDesc: "Calculate your true engagement rate for Instagram, TikTok, and YouTube."
  },
  {
    slug: "thumbnail-downloader",
    name: "Thumbnail Downloader",
    category: "CREATOR TOOLS",
    shortDesc: "Download any YouTube thumbnail",
    longDesc: "Extract and download high-quality thumbnails from any YouTube video just by pasting the URL.",
    icon: Download,
    inputType: "form",
    related: ["ai-thumbnail-generator", "thumbnail-text-generator", "youtube-title-generator"],
    seoTitle: "YouTube Thumbnail Downloader - LogoViking",
    seoDesc: "Download high-resolution YouTube thumbnails from any video URL for free."
  },
  {
    slug: "channel-name-generator",
    name: "Channel Name Generator",
    category: "CREATOR TOOLS",
    shortDesc: "Get creative YouTube channel names",
    longDesc: "Generate unique, memorable channel name ideas based on your niche and keywords.",
    icon: PenTool,
    inputType: "form",
    related: ["youtube-title-generator", "content-idea-generator", "creator-kit"],
    seoTitle: "YouTube Channel Name Generator - LogoViking",
    seoDesc: "Generate unique and catchy YouTube channel names for your new channel."
  },

  // VIRAL GENERATORS
  {
    slug: "hashtag-generator",
    name: "Hashtag Generator",
    category: "VIRAL GENERATORS",
    shortDesc: "Trending hashtags for your posts",
    longDesc: "Find the best hashtags to increase your reach on Instagram, TikTok, and Twitter.",
    icon: Hash,
    inputType: "form",
    related: ["caption-generator", "content-idea-generator", "creator-kit"],
    seoTitle: "Trending Hashtag Generator - LogoViking",
    seoDesc: "Generate the best trending hashtags for Instagram, TikTok, and YouTube."
  },
  {
    slug: "caption-generator",
    name: "Caption Generator",
    category: "VIRAL GENERATORS",
    shortDesc: "Engaging captions for social media",
    longDesc: "Create compelling captions for your social media posts in various tones and styles.",
    icon: MessageSquare,
    inputType: "form",
    related: ["hashtag-generator", "content-idea-generator", "creator-kit"],
    seoTitle: "Social Media Caption Generator - LogoViking",
    seoDesc: "Write engaging captions for your Instagram and TikTok posts instantly."
  },
  {
    slug: "youtube-title-generator",
    name: "YouTube Title Generator",
    category: "VIRAL GENERATORS",
    shortDesc: "Clickable titles for more views",
    longDesc: "Generate high-converting, click-worthy titles for your YouTube videos.",
    icon: Heading,
    inputType: "form",
    related: ["thumbnail-text-generator", "ai-thumbnail-generator", "channel-name-generator"],
    seoTitle: "YouTube Title Generator - LogoViking",
    seoDesc: "Generate catchy, click-worthy YouTube titles to get more views."
  },
  {
    slug: "content-idea-generator",
    name: "Content Idea Generator",
    category: "VIRAL GENERATORS",
    shortDesc: "Never run out of video ideas",
    longDesc: "Get fresh, viral content ideas tailored to your specific niche and audience.",
    icon: Lightbulb,
    inputType: "form",
    related: ["youtube-title-generator", "creator-kit", "hashtag-generator"],
    seoTitle: "Content Idea Generator for Creators - LogoViking",
    seoDesc: "Generate endless viral video and post ideas for your content creator journey."
  },

  // SEO TOOLS
  {
    slug: "meta-tag-generator",
    name: "Meta Tag Generator",
    category: "SEO TOOLS",
    shortDesc: "Create perfect HTML meta tags",
    longDesc: "Generate optimized HTML meta tags to improve your website's search engine visibility.",
    icon: Search,
    inputType: "form",
    related: ["seo-title-generator", "keyword-density-checker", "sitemap-generator"],
    seoTitle: "Free Meta Tag Generator - LogoViking",
    seoDesc: "Generate SEO-friendly HTML meta tags for your website for free."
  },
  {
    slug: "keyword-density-checker",
    name: "Keyword Density Checker",
    category: "SEO TOOLS",
    shortDesc: "Analyze text for SEO keywords",
    longDesc: "Check how frequently keywords appear in your text to optimize for search engines.",
    icon: SearchCheck,
    inputType: "form",
    related: ["meta-tag-generator", "seo-title-generator", "content-idea-generator"],
    seoTitle: "Keyword Density Checker - LogoViking",
    seoDesc: "Analyze your text for keyword density and SEO optimization."
  },
  {
    slug: "seo-title-generator",
    name: "SEO Title Generator",
    category: "SEO TOOLS",
    shortDesc: "Generate search-friendly titles",
    longDesc: "Create blog post and page titles that rank well on Google and attract clicks.",
    icon: AlignLeft,
    inputType: "form",
    related: ["meta-tag-generator", "keyword-density-checker", "youtube-title-generator"],
    seoTitle: "SEO Title Generator - LogoViking",
    seoDesc: "Generate search-engine-optimized titles for your articles and pages."
  },
  {
    slug: "sitemap-generator",
    name: "Sitemap Generator",
    category: "SEO TOOLS",
    shortDesc: "Create XML sitemaps easily",
    longDesc: "Generate an XML sitemap for your website to help search engines crawl your pages better.",
    icon: Globe,
    inputType: "form",
    related: ["robots-txt-generator", "meta-tag-generator", "seo-title-generator"],
    seoTitle: "XML Sitemap Generator - LogoViking",
    seoDesc: "Create valid XML sitemaps for your website instantly."
  },
  {
    slug: "robots-txt-generator",
    name: "Robots.txt Generator",
    category: "SEO TOOLS",
    shortDesc: "Control search engine bots",
    longDesc: "Generate a custom robots.txt file to tell search engines which pages they can and can't crawl.",
    icon: Bot,
    inputType: "form",
    related: ["sitemap-generator", "meta-tag-generator", "seo-title-generator"],
    seoTitle: "Robots.txt File Generator - LogoViking",
    seoDesc: "Generate a robots.txt file for your website to manage crawler access."
  },

  // ALL-IN-ONE
  {
    slug: "creator-kit",
    name: "Ultimate Creator Kit",
    category: "ALL-IN-ONE",
    shortDesc: "Generate everything at once",
    longDesc: "Input one topic and instantly get a video title, thumbnail idea, caption, and hashtags.",
    icon: Zap,
    inputType: "form",
    related: ["content-idea-generator", "youtube-title-generator", "ai-thumbnail-generator"],
    seoTitle: "Ultimate Content Creator Kit - LogoViking",
    seoDesc: "Generate titles, thumbnail ideas, captions, and hashtags all at once with one click."
  }
];

