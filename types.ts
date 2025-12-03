
export enum RiskLevel {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

export interface ModerationIssue {
  category: string; // e.g., "Foreign Agent", "Hate Speech", "Banned Org", "Ad Violation"
  snippet: string; // The problematic text found
  reason: string; // Why it's flagged
  suggestion: string; // How to fix it
  severity: RiskLevel;
}

export interface AnalysisResult {
  isSafe: boolean;
  overallRisk: RiskLevel;
  issues: ModerationIssue[];
  revisedText: string; // A suggested safe version of the full text
  imageAnalysis?: string; // Description of potential issues in the image
}

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl?: (text: string) => string;
  homeUrl?: string;
  supportsApi: boolean;
}

export interface PlatformCredentials {
  telegramToken: string;
  telegramChatId: string;
  vkToken: string;
  vkOwnerId: string;
  discordWebhookUrl: string;
  discordBotToken?: string;
  discordChannelId?: string;
}

export const PLATFORMS: PlatformConfig[] = [
  { 
    id: 'telegram', 
    name: 'Telegram', 
    icon: 'send', 
    color: 'bg-sky-500',
    shareUrl: (text) => `https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encodeURIComponent(text)}`,
    homeUrl: 'https://web.telegram.org/',
    supportsApi: true 
  },
  { 
    id: 'vk', 
    name: 'VKontakte', 
    icon: 'aperture', 
    color: 'bg-blue-600',
    shareUrl: (text) => `https://vk.com/share.php?title=${encodeURIComponent('Публикация через ContentGuard')}&comment=${encodeURIComponent(text)}`,
    homeUrl: 'https://vk.com/',
    supportsApi: true 
  },
  { 
    id: 'discord', 
    name: 'Discord', 
    icon: 'discord', 
    color: 'bg-indigo-500', 
    homeUrl: 'https://discord.com/app',
    supportsApi: true
  }
];