import {
  YoutubeEarningsTool, TiktokEarningsTool, InstagramEarningsTool, EngagementRateTool,
  ThumbnailDownloaderTool, ChannelNameTool, HashtagTool, CaptionTool, YoutubeTitleTool,
  ContentIdeaTool, ThumbnailTextTool, AiThumbnailTool, MetaTagTool, KeywordDensityTool,
  SeoTitleTool, SitemapTool, RobotsTool, SocialResizerTool, CreatorKitTool,
} from "./ApiTools";
import {
  CompressTool, ResizeTool, CropTool, ConvertTool, WatermarkTool,
  BackgroundRemoverTool, SmartOptimizerTool,
} from "./ImageTools";

const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "compress": CompressTool,
  "resize": ResizeTool,
  "crop": CropTool,
  "convert": ConvertTool,
  "watermark": WatermarkTool,
  "background-remover": BackgroundRemoverTool,
  "smart-optimizer": SmartOptimizerTool,
  "ai-thumbnail-generator": AiThumbnailTool,
  "thumbnail-text-generator": ThumbnailTextTool,
  "social-media-resizer": SocialResizerTool,
  "youtube-earnings": YoutubeEarningsTool,
  "tiktok-earnings": TiktokEarningsTool,
  "instagram-earnings": InstagramEarningsTool,
  "engagement-rate": EngagementRateTool,
  "thumbnail-downloader": ThumbnailDownloaderTool,
  "channel-name-generator": ChannelNameTool,
  "hashtag-generator": HashtagTool,
  "caption-generator": CaptionTool,
  "youtube-title-generator": YoutubeTitleTool,
  "content-idea-generator": ContentIdeaTool,
  "meta-tag-generator": MetaTagTool,
  "keyword-density-checker": KeywordDensityTool,
  "seo-title-generator": SeoTitleTool,
  "sitemap-generator": SitemapTool,
  "robots-txt-generator": RobotsTool,
  "creator-kit": CreatorKitTool,
};

export function getToolComponent(slug: string): React.ComponentType | null {
  return TOOL_COMPONENTS[slug] ?? null;
}
