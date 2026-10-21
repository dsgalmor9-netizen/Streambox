import React, { useState } from 'react';

// Official domains of every provider and brand to fetch the original authentic logo from the internet
export const BRAND_DOMAINS: Record<string, string> = {
  // Streaming & Video
  netflix: 'https://www.netflix.com',
  disney: 'https://www.disneyplus.com',
  prime: 'https://www.primevideo.com',
  amazon: 'https://www.primevideo.com',
  max: 'https://www.max.com',
  hbo: 'https://www.max.com',
  'apple tv': 'https://tv.apple.com',
  paramount: 'https://www.paramountplus.com',
  crunchyroll: 'https://www.crunchyroll.com',
  vix: 'https://vix.com',
  mubi: 'https://mubi.com',
  viki: 'https://www.viki.com',
  rakuten: 'https://www.viki.com',

  // Music & Audio
  spotify: 'https://open.spotify.com',
  youtube: 'https://www.youtube.com',
  'apple music': 'https://music.apple.com',
  deezer: 'https://www.deezer.com',
  tidal: 'https://tidal.com',
  audible: 'https://www.audible.com',

  // AI & Technology
  openai: 'https://chatgpt.com',
  chatgpt: 'https://chatgpt.com',
  anthropic: 'https://claude.ai',
  claude: 'https://claude.ai',
  perplexity: 'https://www.perplexity.ai',
  gemini: 'https://gemini.google.com',
  google: 'https://www.google.com',
  copilot: 'https://copilot.microsoft.com',
  midjourney: 'https://www.midjourney.com',

  // Design, Video Editing & Productivity
  canva: 'https://www.canva.com',
  adobe: 'https://www.adobe.com',
  capcut: 'https://www.capcut.com',
  blackmagic: 'https://www.blackmagicdesign.com',
  davinci: 'https://www.blackmagicdesign.com',
  microsoft: 'https://www.microsoft.com',
  office: 'https://www.microsoft.com',
  notion: 'https://www.notion.so',
  figma: 'https://www.figma.com',
  drive: 'https://drive.google.com',
  workspace: 'https://workspace.google.com',
  trello: 'https://trello.com',
  asana: 'https://asana.com',
  evernote: 'https://evernote.com',
  todoist: 'https://todoist.com',

  // VPN, Security & Utilities
  proton: 'https://protonvpn.com',
  protonvpn: 'https://protonvpn.com',
  nordvpn: 'https://nordvpn.com',
  surfshark: 'https://surfshark.com',
  expressvpn: 'https://www.expressvpn.com',
  bitdefender: 'https://www.bitdefender.com',
  '1password': 'https://1password.com',
  bitwarden: 'https://bitwarden.com',
  eset: 'https://www.eset.com',
  malwarebytes: 'https://www.malwarebytes.com',
  duolingo: 'https://www.duolingo.com',

  // Gaming & Cards
  xbox: 'https://www.xbox.com',
  playstation: 'https://www.playstation.com',
  nintendo: 'https://www.nintendo.com',
  steam: 'https://store.steampowered.com',
  epic: 'https://store.epicgames.com',
  roblox: 'https://www.roblox.com',
  ubisoft: 'https://www.ubisoft.com',
  blizzard: 'https://www.blizzard.com',
  battle: 'https://battle.net',
  ea: 'https://www.ea.com',

  // Dev & Others
  cursor: 'https://www.cursor.com',
  github: 'https://github.com',
  gitlab: 'https://gitlab.com',
  twitch: 'https://www.twitch.tv',
  streambox: 'https://streambox.tv',
};

export const getBrandLogoUrl = (brand: string, explicitUrl?: string, productName?: string): string => {
  if (explicitUrl && explicitUrl.trim() !== '') return explicitUrl;
  
  const text = `${brand || ''} ${productName || ''}`.toLowerCase().trim();

  // Look up corresponding official website domain
  for (const [key, domain] of Object.entries(BRAND_DOMAINS)) {
    // Special word boundary check for short words like 'ea' to avoid matching 'stream'
    if (key === 'ea') {
      if (/\bea\b/.test(text) || text.includes('electronic arts')) {
        return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(domain)}&size=128`;
      }
      continue;
    }

    if (text.includes(key)) {
      return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(domain)}&size=128`;
    }
  }

  // Default StreamBox official icon
  return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent('https://streambox.tv')}&size=128`;
};

interface BrandLogoProps {
  brand: string;
  logoUrl?: string;
  logoColor?: string;
  productName?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  brand,
  logoUrl,
  logoColor = '#8B5CF6',
  productName,
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const resolvedUrl = getBrandLogoUrl(brand, logoUrl, productName);

  const dimensions = {
    xs: 'w-5 h-5 text-[10px] rounded-md p-0.5',
    sm: 'w-7 h-7 text-xs rounded-lg p-1',
    md: 'w-11 h-11 text-sm rounded-xl p-1.5',
    lg: 'w-14 h-14 text-base rounded-2xl p-2',
    xl: 'w-20 h-20 text-xl rounded-2xl p-3',
  }[size];

  const brandInitials = (brand || 'SB').slice(0, 2).toUpperCase();

  // If we have a resolvedUrl and image hasn't errored
  if (resolvedUrl && !imageError) {
    return (
      <div
        className={`relative shrink-0 flex items-center justify-center overflow-hidden border border-white/10 bg-zinc-950/90 shadow-md ${dimensions} ${className}`}
        title={`Logo oficial de la página de ${brand}`}
      >
        <img
          src={resolvedUrl}
          alt={`Logo oficial de ${brand}`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain filter drop-shadow-sm transition-transform hover:scale-110 duration-200"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Graceful fallback to styled chromatic initials
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-black text-white shadow-md border border-white/10 select-none ${dimensions} ${className}`}
      style={{
        backgroundColor: logoColor || '#6366F1',
        backgroundImage: `linear-gradient(135deg, ${logoColor || '#6366F1'}dd, #12121A)`,
      }}
      title={brand}
    >
      <span>{brandInitials}</span>
    </div>
  );
};
