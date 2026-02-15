/**
 * Cambodia-Focused Configuration
 * Customizes the World Monitor to focus on Cambodia with relevant Asian context
 */

// Default map view centered on Cambodia
export const CAMBODIA_MAP_VIEW = {
  latitude: 12.5657,
  longitude: 104.991,
  zoom: 7.5, // Country-level zoom (increased for better detail)
  pitch: 0,
  bearing: 0,
};

// Regional bounding box for relevant events (Cambodia + neighboring countries)
export const CAMBODIA_REGION_BOUNDS = {
  north: 23.0, // Southern China
  south: 8.0,  // Southern Thailand/Malaysia
  east: 110.0, // Vietnam coast
  west: 97.0,  // Myanmar border
};

// Priority countries for monitoring
export const MONITORED_COUNTRIES = [
  'Cambodia',
  'Thailand',
  'Vietnam',
  'Laos',
  'Myanmar',
  'China',
  'Malaysia',
  'Singapore',
  'United States', // For Cambodia relations
  'Japan', // Major aid donor
  'South Korea', // Economic partner
];

// Keywords for Cambodia-relevant news filtering
export const CAMBODIA_KEYWORDS = [
  // Direct mentions
  'Cambodia', 'Cambodian', 'Phnom Penh', 'Siem Reap', 'Sihanoukville',
  'Kampong', 'Battambang', 'Kampot', 'Koh Kong', 'Ratanakiri',
  'Mekong', 'Tonle Sap', 'ASEAN',
  
  // Regional relations
  'Thailand Cambodia', 'Vietnam Cambodia', 'China Cambodia',
  'Thai-Cambodian', 'Vietnam-Cambodia', 'China-Cambodia',
  'US Cambodia', 'Japan Cambodia', 'Cambodia relations',
  
  // Economic corridors
  'Southern Economic Corridor', 'Greater Mekong Subregion',
  'Belt and Road Cambodia', 'BRI Cambodia', 'GMS',
  
  // Border issues
  'Preah Vihear', 'Thai-Cambodia border', 'Mekong River',
  'Cambodia border', 'border dispute', 'border crossing',
  
  // Key industries
  'Cambodia garment', 'Cambodia textile', 'Cambodia tourism', 
  'Cambodia construction', 'Cambodia real estate',
  'Angkor Wat', 'Cambodia casino', 'Sihanoukville port',
  'Cambodia agriculture', 'Cambodia rice', 'Cambodia fishing',
  
  // Political
  'Hun Sen', 'Hun Manet', 'CPP', 'Cambodian People Party',
  'Cambodian election', 'Cambodia government', 'Cambodia politics',
  'Sam Rainsy', 'CNRP', 'Cambodia opposition',
  
  // Infrastructure
  'Cambodia railway', 'Cambodia port', 'Cambodia airport',
  'Phnom Penh airport', 'Cambodia highway', 'Cambodia infrastructure',
  'Sihanoukville development', 'Ream base', 'Cambodia dam',
  
  // Economy & Trade
  'Cambodia economy', 'Cambodia trade', 'Cambodia investment',
  'Cambodia GDP', 'Cambodia export', 'Cambodia import',
  'Riel', 'Cambodia currency', 'Cambodia FDI',
  
  // Regional Security
  'Cambodia military', 'Cambodia defense', 'Cambodia navy',
  'South China Sea Cambodia', 'Cambodia maritime',
];

// Global keywords that mention or might impact Cambodia
export const GLOBAL_IMPACT_KEYWORDS = [
  'ASEAN summit', 'ASEAN meeting', 'ASEAN agreement',
  'Mekong cooperation', 'Mekong development', 'Mekong dam',
  'Southeast Asia trade', 'Southeast Asia security',
  'China ASEAN', 'US ASEAN', 'Japan ASEAN',
  'Regional Comprehensive Economic Partnership', 'RCEP',
  'Trans-Pacific Partnership', 'CPTPP',
  'Indo-Pacific', 'Quad', // Strategic frameworks
];

// Thailand-specific keywords relevant to Cambodia
export const THAILAND_CAMBODIA_KEYWORDS = [
  'Thailand Cambodia', 'Thai Cambodia', 'Thai-Cambodian',
  'Thailand border', 'Aranyaprathet', 'Poipet',
  'Bangkok Phnom Penh', 'Thailand ASEAN',
  'Thailand Mekong', 'Thailand trade corridor',
];

// Asian countries that might impact Cambodia
export const RELEVANT_ASIAN_COUNTRIES = {
  // Direct neighbors
  neighbors: ['Thailand', 'Vietnam', 'Laos'],
  
  // Major regional powers
  powers: ['China', 'Japan', 'South Korea', 'India', 'United States'],
  
  // ASEAN members
  asean: ['Thailand', 'Vietnam', 'Laos', 'Myanmar', 'Singapore', 
          'Malaysia', 'Indonesia', 'Philippines', 'Brunei'],
  
  // Economic partners
  economicPartners: ['China', 'Japan', 'South Korea', 'Singapore', 
                     'Thailand', 'Vietnam', 'United States', 'European Union'],
};

// RSS Feeds focused on Cambodia and regional news
export const CAMBODIA_FOCUSED_FEEDS = [
  // Cambodia-specific
  {
    url: 'https://www.phnompenhpost.com/rss',
    name: 'Phnom Penh Post',
    tier: 2,
    type: 'news',
    region: 'Cambodia',
  },
  {
    url: 'https://www.khmertimeskh.com/feed/',
    name: 'Khmer Times',
    tier: 2,
    type: 'news',
    region: 'Cambodia',
  },
  {
    url: 'https://www.voacambodia.com/api/zr$oteuoi',
    name: 'VOA Cambodia',
    tier: 1,
    type: 'news',
    region: 'Cambodia',
  },
  
  // Regional context - Thailand
  {
    url: 'https://www.bangkokpost.com/rss/data/news.xml',
    name: 'Bangkok Post',
    tier: 2,
    type: 'news',
    region: 'Thailand',
  },
  {
    url: 'https://www.nationthailand.com/rss/news',
    name: 'The Nation Thailand',
    tier: 2,
    type: 'news',
    region: 'Thailand',
  },
  
  // Regional context - Vietnam
  {
    url: 'https://e.vnexpress.net/rss/news.rss',
    name: 'VnExpress International',
    tier: 2,
    type: 'news',
    region: 'Vietnam',
  },
  {
    url: 'https://vietnamnews.vn/rss/home.rss',
    name: 'Vietnam News',
    tier: 2,
    type: 'news',
    region: 'Vietnam',
  },
  
  // Regional analysis
  {
    url: 'https://thediplomat.com/feed/',
    name: 'The Diplomat (Asia)',
    tier: 2,
    type: 'geopolitical',
    region: 'Asia',
  },
  {
    url: 'https://asia.nikkei.com/rss/feed/nar',
    name: 'Nikkei Asia',
    tier: 2,
    type: 'economic',
    region: 'Asia',
  },
  {
    url: 'https://www.scmp.com/rss/2/feed',
    name: 'South China Morning Post',
    tier: 2,
    type: 'news',
    region: 'Asia',
  },
  
  // ASEAN focus
  {
    url: 'https://asean.org/feed/',
    name: 'ASEAN Official',
    tier: 1,
    type: 'official',
    region: 'Southeast Asia',
  },
  {
    url: 'https://theaseanpost.com/feed',
    name: 'The ASEAN Post',
    tier: 2,
    type: 'regional',
    region: 'Southeast Asia',
  },
  
  // Global news with Asia focus
  {
    url: 'https://www.reuters.com/rssfeed/asiaNews',
    name: 'Reuters Asia',
    tier: 1,
    type: 'news',
    region: 'Asia',
  },
  {
    url: 'https://www.bbc.com/news/world/asia/rss.xml',
    name: 'BBC Asia',
    tier: 1,
    type: 'news',
    region: 'Asia',
  },
  {
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    name: 'Al Jazeera (filtered for Asia)',
    tier: 1,
    type: 'news',
    region: 'Global',
  },
];

// Enhanced filter function to check if news is relevant to Cambodia
export function isCambodiaRelevant(headline: string, description: string = '', source: string = ''): boolean {
  const text = `${headline} ${description}`.toLowerCase();
  const sourceLower = source.toLowerCase();
  
  // Always include Cambodia-specific sources
  if (sourceLower.includes('cambodia') || 
      sourceLower.includes('phnom penh') || 
      sourceLower.includes('khmer')) {
    return true;
  }
  
  // Direct Cambodia mentions (highest priority)
  if (CAMBODIA_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))) {
    return true;
  }
  
  // Thailand news specifically mentioning Cambodia
  if (sourceLower.includes('thailand') || sourceLower.includes('bangkok')) {
    const hasThaiCambodiaKeyword = THAILAND_CAMBODIA_KEYWORDS.some(
      keyword => text.includes(keyword.toLowerCase())
    );
    if (hasThaiCambodiaKeyword) return true;
  }
  
  // Global impact keywords
  if (GLOBAL_IMPACT_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))) {
    return true;
  }
  
  // Check for monitored country mentions + economic/political/security keywords
  const hasMonitoredCountry = MONITORED_COUNTRIES.some(
    country => text.includes(country.toLowerCase())
  );
  
  if (hasMonitoredCountry) {
    const hasRelevantContext = [
      'trade', 'investment', 'border', 'dispute', 'agreement', 'treaty',
      'military', 'defense', 'security', 'cooperation', 'partnership',
      'mekong', 'asean', 'infrastructure', 'development', 'aid',
      'tourism', 'economy', 'sanctions', 'tariff', 'export', 'import',
      'summit', 'meeting', 'conference', 'bilateral', 'trilateral',
      'corridor', 'port', 'railway', 'highway', 'airport',
    ].some(keyword => text.includes(keyword));
    
    if (hasRelevantContext) return true;
  }
  
  return false;
}

// Geographic filter for events
export function isInCambodiaRegion(lat: number, lon: number): boolean {
  return (
    lat >= CAMBODIA_REGION_BOUNDS.south &&
    lat <= CAMBODIA_REGION_BOUNDS.north &&
    lon >= CAMBODIA_REGION_BOUNDS.west &&
    lon <= CAMBODIA_REGION_BOUNDS.east
  );
}

// Priority locations within Cambodia
export const CAMBODIA_STRATEGIC_LOCATIONS = [
  {
    name: 'Phnom Penh',
    lat: 11.5564,
    lon: 104.9282,
    type: 'capital',
    priority: 'critical',
    description: 'Capital city and economic center',
  },
  {
    name: 'Sihanoukville Port',
    lat: 10.6279,
    lon: 103.5278,
    type: 'port',
    priority: 'critical',
    description: 'Primary deep-water port, major Chinese investment',
  },
  {
    name: 'Siem Reap (Angkor)',
    lat: 13.3671,
    lon: 103.8448,
    type: 'tourism',
    priority: 'high',
    description: 'Tourism hub, Angkor Wat temple complex',
  },
  {
    name: 'Poipet Border Crossing',
    lat: 13.6549,
    lon: 102.5656,
    type: 'border',
    priority: 'high',
    description: 'Main Cambodia-Thailand border crossing',
  },
  {
    name: 'Bavet Border Crossing',
    lat: 11.0833,
    lon: 106.0167,
    type: 'border',
    priority: 'high',
    description: 'Main Cambodia-Vietnam border crossing',
  },
  {
    name: 'Ream Naval Base',
    lat: 10.5167,
    lon: 103.6333,
    type: 'military',
    priority: 'critical',
    description: 'Naval base with Chinese development',
  },
  {
    name: 'Phnom Penh International Airport',
    lat: 11.5466,
    lon: 104.8440,
    type: 'airport',
    priority: 'high',
    description: 'Main international gateway',
  },
  {
    name: 'Siem Reap International Airport',
    lat: 13.4107,
    lon: 103.8130,
    type: 'airport',
    priority: 'medium',
    description: 'Tourism gateway to Angkor',
  },
  {
    name: 'Kampong Som (Sihanoukville)',
    lat: 10.6297,
    lon: 103.5067,
    type: 'city',
    priority: 'high',
    description: 'Coastal city, special economic zone',
  },
  {
    name: 'Battambang',
    lat: 13.0957,
    lon: 103.2022,
    type: 'city',
    priority: 'medium',
    description: 'Second largest city, agricultural hub',
  },
];

// Border monitoring areas
export const CAMBODIA_BORDERS = [
  {
    name: 'Cambodia-Thailand Border',
    neighbor: 'Thailand',
    length_km: 817,
    priority: 'critical',
    hotspots: ['Preah Vihear Temple', 'Poipet', 'O Smach', 'Pailin'],
    issues: ['Border disputes', 'Human trafficking', 'Trade smuggling'],
  },
  {
    name: 'Cambodia-Vietnam Border',
    neighbor: 'Vietnam',
    length_km: 1158,
    priority: 'high',
    hotspots: ['Bavet', 'Kaam Samnor', 'Trapeang Phlong'],
    issues: ['Border demarcation', 'Fishing disputes', 'Trade corridor'],
  },
  {
    name: 'Cambodia-Laos Border',
    neighbor: 'Laos',
    length_km: 555,
    priority: 'medium',
    hotspots: ['Stung Treng', 'Preah Vihear'],
    issues: ['Mekong River management', 'Cross-border trade'],
  },
];

// Economic corridors relevant to Cambodia
export const ECONOMIC_CORRIDORS = [
  {
    name: 'Southern Economic Corridor',
    countries: ['Thailand', 'Cambodia', 'Vietnam'],
    description: 'Bangkok - Phnom Penh - Ho Chi Minh City - Vung Tau',
    priority: 'critical',
    status: 'Active',
  },
  {
    name: 'Southern Coastal Corridor',
    countries: ['Thailand', 'Cambodia'],
    description: 'Dawei - Kanchanaburi - Phnom Penh - Ho Chi Minh City - Vung Tau',
    priority: 'high',
    status: 'Under Development',
  },
  {
    name: 'GMS North-South Economic Corridor',
    countries: ['China', 'Laos', 'Thailand', 'Cambodia'],
    description: 'Kunming - Chiang Rai - Bangkok - Phnom Penh',
    priority: 'high',
    status: 'Active',
  },
];

// Alert priorities for Cambodia-specific events
export const CAMBODIA_ALERT_PRIORITIES = {
  critical: [
    'border conflict',
    'political crisis',
    'natural disaster',
    'major infrastructure damage',
    'diplomatic incident',
    'coup',
    'civil unrest',
    'terrorist attack',
  ],
  high: [
    'trade policy change',
    'investment announcement',
    'tourism impact',
    'currency fluctuation',
    'regional security',
    'border tension',
    'mekong dispute',
    'ASEAN disagreement',
  ],
  medium: [
    'economic indicator',
    'infrastructure project',
    'cultural event',
    'environmental issue',
    'political appointment',
    'trade statistics',
  ],
};

// Custom panel configuration for Cambodia focus
export const CAMBODIA_PANELS = {
  enabled: [
    'cambodia-news',      // Cambodia-specific news
    'regional-news',      // ASEAN & neighboring countries
    'thailand-news',      // Thailand news (Cambodia-relevant)
    'border-monitor',     // Border activity monitoring
    'economic-updates',   // Trade & investment
    'infrastructure',     // Infrastructure projects
    'mekong-monitor',     // Mekong River issues
    'map',               // Centered on Cambodia
  ],
  disabled: [
    'global-conflicts',  // Not relevant for Cambodia focus
    'nato-tracker',      // Not relevant
    'middle-east',       // Not relevant
    'ukraine-tracker',   // Not relevant
    'crypto-markets',    // Optional - can be enabled if needed
  ],
};

// Color scheme for Cambodia-focused UI
export const CAMBODIA_THEME = {
  primary: '#CE1126', // Cambodian flag red
  secondary: '#032EA1', // Cambodian flag blue
  accent: '#FFD700', // Gold (Angkor symbolism)
  background: '#1a1a2e',
  text: '#ffffff',
};
