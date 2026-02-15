/**
 * Cambodia-Specific Filtering Utilities
 * Filters news, events, and data to focus on Cambodia and relevant regional context
 */

import {
  MONITORED_COUNTRIES,
  RELEVANT_ASIAN_COUNTRIES,
  isCambodiaRelevant,
  isInCambodiaRegion,
} from '../config/cambodia-config';

interface NewsItem {
  title: string;
  description?: string;
  link?: string;
  pubDate?: string;
  source?: string;
  location?: {
    lat: number;
    lon: number;
  };
}

interface GeoEvent {
  lat: number;
  lon: number;
  title?: string;
  description?: string;
  country?: string;
  [key: string]: any;
}

/**
 * Filter news items for Cambodia relevance
 */
export function filterCambodiaNews(newsItems: NewsItem[]): NewsItem[] {
  return newsItems.filter(item => {
    const title = item.title || '';
    const description = item.description || '';
    
    return isCambodiaRelevant(title, description);
  });
}

/**
 * Filter geographic events to Cambodia region
 */
export function filterRegionalEvents<T extends GeoEvent>(events: T[]): T[] {
  return events.filter(event => {
    // Include events within the regional bounds
    if (isInCambodiaRegion(event.lat, event.lon)) {
      return true;
    }
    
    // Include events from monitored countries even if outside bounds
    if (event.country && MONITORED_COUNTRIES.includes(event.country)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Calculate relevance score for news items (0-100)
 */
export function calculateRelevanceScore(newsItem: NewsItem): number {
  let score = 0;
  const text = `${newsItem.title} ${newsItem.description || ''}`.toLowerCase();
  
  // Direct Cambodia mention: +50
  if (text.includes('cambodia') || text.includes('cambodian')) {
    score += 50;
  }
  
  // Phnom Penh or major cities: +30
  if (text.includes('phnom penh') || text.includes('siem reap') || 
      text.includes('sihanoukville')) {
    score += 30;
  }
  
  // Border/neighbor countries: +20
  const neighbors = ['thailand', 'vietnam', 'laos'];
  if (neighbors.some(country => text.includes(country))) {
    score += 20;
  }
  
  // China (major partner): +15
  if (text.includes('china') || text.includes('chinese')) {
    score += 15;
  }
  
  // ASEAN context: +10
  if (text.includes('asean') || text.includes('mekong')) {
    score += 10;
  }
  
  // Economic keywords: +10
  const economicKeywords = ['trade', 'investment', 'economy', 'infrastructure', 
                            'development', 'aid', 'loan', 'project'];
  if (economicKeywords.some(keyword => text.includes(keyword))) {
    score += 10;
  }
  
  // Security/political keywords: +15
  const securityKeywords = ['border', 'military', 'defense', 'security', 
                           'dispute', 'tension', 'cooperation'];
  if (securityKeywords.some(keyword => text.includes(keyword))) {
    score += 15;
  }
  
  // Location data bonus: +10
  if (newsItem.location && isInCambodiaRegion(newsItem.location.lat, newsItem.location.lon)) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

/**
 * Sort news items by relevance to Cambodia
 */
export function sortByRelevance(newsItems: NewsItem[]): NewsItem[] {
  return newsItems
    .map(item => ({
      item,
      score: calculateRelevanceScore(item),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * Filter and categorize news by relevance level
 */
export function categorizeNewsByRelevance(newsItems: NewsItem[]) {
  const categorized = {
    critical: [] as NewsItem[],  // Score >= 70: Direct Cambodia impact
    high: [] as NewsItem[],      // Score 50-69: Regional impact
    medium: [] as NewsItem[],    // Score 30-49: Indirect relevance
    low: [] as NewsItem[],       // Score < 30: Tangential
  };
  
  newsItems.forEach(item => {
    const score = calculateRelevanceScore(item);
    
    if (score >= 70) {
      categorized.critical.push(item);
    } else if (score >= 50) {
      categorized.high.push(item);
    } else if (score >= 30) {
      categorized.medium.push(item);
    } else {
      categorized.low.push(item);
    }
  });
  
  return categorized;
}

/**
 * Check if a country is relevant for Cambodia monitoring
 */
export function isRelevantCountry(country: string): boolean {
  const normalizedCountry = country.trim();
  
  // Check if it's in monitored countries
  if (MONITORED_COUNTRIES.includes(normalizedCountry)) {
    return true;
  }
  
  // Check if it's in relevant Asian countries
  const allRelevantCountries = [
    ...RELEVANT_ASIAN_COUNTRIES.neighbors,
    ...RELEVANT_ASIAN_COUNTRIES.powers,
    ...RELEVANT_ASIAN_COUNTRIES.asean,
    ...RELEVANT_ASIAN_COUNTRIES.economicPartners,
  ];
  
  return allRelevantCountries.includes(normalizedCountry);
}

/**
 * Filter military/security events for Cambodia region
 */
export function filterSecurityEvents<T extends GeoEvent>(events: T[]): T[] {
  return events.filter(event => {
    // Within regional bounds
    if (isInCambodiaRegion(event.lat, event.lon)) {
      return true;
    }
    
    // Events involving monitored countries
    const eventText = `${event.title || ''} ${event.description || ''}`.toLowerCase();
    const hasRelevantCountry = MONITORED_COUNTRIES.some(
      country => eventText.includes(country.toLowerCase())
    );
    
    return hasRelevantCountry;
  });
}

/**
 * Extract country mentions from text
 */
export function extractCountryMentions(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const mentions: string[] = [];
  
  MONITORED_COUNTRIES.forEach(country => {
    if (normalizedText.includes(country.toLowerCase())) {
      mentions.push(country);
    }
  });
  
  return [...new Set(mentions)];
}

/**
 * Filter function for RSS feeds
 */
export function shouldIncludeFeedItem(item: NewsItem): boolean {
  // Must be relevant to Cambodia
  if (!isCambodiaRelevant(item.title, item.description || '')) {
    return false;
  }
  
  // Must have sufficient relevance score
  const score = calculateRelevanceScore(item);
  return score >= 25; // Minimum threshold
}

/**
 * Distance calculator (Haversine formula)
 */
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find events near Cambodia borders
 */
export function findBorderProximityEvents<T extends GeoEvent>(
  events: T[],
  maxDistanceKm: number = 50
): T[] {
  const cambodiaBorders = [
    { lat: 13.6549, lon: 102.5656, name: 'Poipet (Thailand)' },
    { lat: 11.0833, lon: 106.0167, name: 'Bavet (Vietnam)' },
    { lat: 13.8039, lon: 106.9813, name: 'Stung Treng (Laos)' },
  ];
  
  return events.filter(event => {
    return cambodiaBorders.some(border => {
      const distance = calculateDistance(
        event.lat,
        event.lon,
        border.lat,
        border.lon
      );
      return distance <= maxDistanceKm;
    });
  });
}

/**
 * Export all filters as a single object
 */
export const CambodiaFilters = {
  filterNews: filterCambodiaNews,
  filterEvents: filterRegionalEvents,
  filterSecurity: filterSecurityEvents,
  sortByRelevance,
  categorize: categorizeNewsByRelevance,
  calculateScore: calculateRelevanceScore,
  isRelevantCountry,
  shouldIncludeFeedItem,
  findBorderEvents: findBorderProximityEvents,
  extractCountries: extractCountryMentions,
};
