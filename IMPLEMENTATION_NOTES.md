# Cambodia Monitor Implementation Notes

## Files Added

The following files have been added to configure your World Monitor for Cambodia-focused monitoring:

### Configuration Files
1. **`src/config/cambodia-config.ts`** - Core Cambodia configuration
   - Map view settings (centered on Cambodia)
   - Regional bounds (Southeast Asia)
   - Monitored countries list
   - Cambodia-specific keywords
   - RSS feeds for Cambodia and regional news
   - Strategic locations (Phnom Penh, Sihanoukville, etc.)
   - Border monitoring configuration
   - Economic corridors

2. **`src/utils/cambodia-filter.ts`** - Filtering utilities
   - News relevance scoring (0-100)
   - Geographic event filtering
   - Country relevance checking
   - Border proximity detection
   - News categorization (critical/high/medium/low)

3. **`.env.cambodia`** - Environment template
   - Cambodia-specific environment variables
   - Map defaults
   - Feature flags
   - API key placeholders

### Documentation
4. **`CAMBODIA_SETUP.md`** - Complete setup guide
5. **`IMPLEMENTATION_NOTES.md`** - This file

### Updated Files
6. **`package.json`** - Added Cambodia variant scripts

---

## Integration Steps

To fully integrate Cambodia filtering into your existing application, follow these steps:

### Step 1: Update Config Index

Edit `src/config/index.ts` to export Cambodia configuration:

```typescript
// Add this near the top of the file
export * from './cambodia-config';
```

### Step 2: Update Variant Configuration

Edit `src/config/variant.ts` to recognize 'cambodia' variant:

```typescript
const variant = import.meta.env.VITE_VARIANT || 'full';

export const SITE_VARIANT = variant as 'full' | 'tech' | 'cambodia';

export const isCambodiaVariant = SITE_VARIANT === 'cambodia';
export const isTechVariant = SITE_VARIANT === 'tech';
export const isFullVariant = SITE_VARIANT === 'full';
```

### Step 3: Update Map Initialization

Find your map initialization code (likely in `src/App.ts`) and add Cambodia default view:

```typescript
import { CAMBODIA_MAP_VIEW, isCambodiaVariant } from './config';

// In your map initialization
const initialViewState = isCambodiaVariant 
  ? CAMBODIA_MAP_VIEW
  : {
      latitude: 0,
      longitude: 0,
      zoom: 2,
      // ... existing defaults
    };
```

### Step 4: Apply News Filtering

Find where news items are fetched/displayed and apply Cambodia filtering:

```typescript
import { CambodiaFilters } from './utils/cambodia-filter';
import { isCambodiaVariant } from './config';

// After fetching news
let newsItems = await fetchNews();

// Apply Cambodia filtering if variant is active
if (isCambodiaVariant) {
  newsItems = CambodiaFilters.filterNews(newsItems);
  newsItems = CambodiaFilters.sortByRelevance(newsItems);
  
  // Optional: Categorize by priority
  const categorized = CambodiaFilters.categorize(newsItems);
  // Display categorized.critical and categorized.high first
}
```

### Step 5: Apply Geographic Event Filtering

Find where geographic events (protests, conflicts, etc.) are processed:

```typescript
import { CambodiaFilters } from './utils/cambodia-filter';
import { isCambodiaVariant } from './config';

// After fetching events
let events = await fetchEvents();

// Filter to Cambodia region
if (isCambodiaVariant) {
  events = CambodiaFilters.filterEvents(events);
  
  // Optional: Highlight border events
  const borderEvents = CambodiaFilters.findBorderEvents(events, 50);
}
```

### Step 6: Update RSS Feed Configuration

Edit `src/config/feeds.ts` or wherever RSS feeds are configured:

```typescript
import { CAMBODIA_FOCUSED_FEEDS, isCambodiaVariant } from './cambodia-config';
import { FEEDS } from './feeds'; // Existing feeds

// Export feeds based on variant
export const ACTIVE_FEEDS = isCambodiaVariant 
  ? CAMBODIA_FOCUSED_FEEDS 
  : FEEDS;
```

### Step 7: Update Map Layers (Optional)

If you want to add Cambodia-specific markers on the map:

```typescript
import { CAMBODIA_STRATEGIC_LOCATIONS } from './config/cambodia-config';

// Add to your map layers
const cambodiaLocationsLayer = new ScatterplotLayer({
  id: 'cambodia-locations',
  data: CAMBODIA_STRATEGIC_LOCATIONS,
  getPosition: d => [d.lon, d.lat],
  getRadius: d => d.priority === 'critical' ? 50000 : 30000,
  getFillColor: d => {
    switch(d.priority) {
      case 'critical': return [255, 0, 0, 200];
      case 'high': return [255, 165, 0, 180];
      default: return [255, 255, 0, 160];
    }
  },
  pickable: true,
  visible: isCambodiaVariant,
});
```

### Step 8: Add Border Overlay Layer (Optional)

```typescript
import { CAMBODIA_BORDERS } from './config/cambodia-config';

// Visualize border monitoring zones
// This would require converting border data to GeoJSON LineStrings
```

---

## Usage Examples

### Running Cambodia Variant

```bash
# Development
npm run dev:cambodia

# Production build
npm run build:cambodia

# Desktop app
npm run desktop:dev:cambodia
npm run desktop:build:cambodia

# Tests
npm run test:e2e:cambodia
```

### Environment Setup

```bash
# Copy Cambodia config
cp .env.cambodia .env.local

# Edit and add your API keys
vim .env.local
```

### Programmatic Filtering

```typescript
import { CambodiaFilters, calculateRelevanceScore } from './utils/cambodia-filter';

// Calculate relevance
const score = calculateRelevanceScore({
  title: "Cambodia and Thailand agree on border trade",
  description: "New economic corridor development..."
});
console.log(score); // e.g., 85

// Filter news array
const relevant = CambodiaFilters.filterNews(allNews);

// Categorize by priority
const { critical, high, medium, low } = CambodiaFilters.categorize(allNews);

// Filter events to region
const regionalEvents = CambodiaFilters.filterEvents(allEvents);

// Find border-area events
const borderEvents = CambodiaFilters.findBorderEvents(allEvents, 50);
```

---

## Customization Guide

### Adjusting Geographic Bounds

Edit `.env.local` or `src/config/cambodia-config.ts`:

```typescript
export const CAMBODIA_REGION_BOUNDS = {
  north: 25.0,  // Expand north to include more of China
  south: 7.0,   // Contract south
  east: 112.0,  // Expand east
  west: 95.0,   // Expand west to include more of Myanmar
};
```

### Adding Custom Keywords

Edit `src/config/cambodia-config.ts`:

```typescript
export const CAMBODIA_KEYWORDS = [
  // Add your keywords
  'Koh Kong',
  'Kampot',
  'Battambang',
  // Industry-specific
  'Cambodia mining',
  'Cambodia rubber',
  // Infrastructure
  'Phnom Penh-Bangkok railway',
];
```

### Adjusting Relevance Scoring

Edit `src/utils/cambodia-filter.ts` function `calculateRelevanceScore()`:

```typescript
// Increase weight for economic news
if (economicKeywords.some(keyword => text.includes(keyword))) {
  score += 20; // Changed from 10
}

// Add new scoring criteria
if (text.includes('investment') || text.includes('development')) {
  score += 15;
}
```

### Adding More Monitored Countries

Edit `src/config/cambodia-config.ts`:

```typescript
export const MONITORED_COUNTRIES = [
  'Cambodia',
  'Thailand',
  'Vietnam',
  'Laos',
  'Myanmar',
  'China',
  'Malaysia',
  'Singapore',
  'Indonesia',     // Add
  'Philippines',   // Add
  'Japan',         // Add
  'South Korea',   // Add
];
```

---

## Testing

### Manual Testing Checklist

- [ ] Map centers on Cambodia (lat: 12.5657, lon: 104.991)
- [ ] Map zoom level is 7 (country-level)
- [ ] Only Cambodia-relevant news appears
- [ ] News items are sorted by relevance
- [ ] Events outside Southeast Asia are filtered out
- [ ] Strategic locations are marked on map
- [ ] Border crossings are highlighted
- [ ] RSS feeds are fetching correctly
- [ ] Filtering performance is acceptable (<100ms)

### Automated Testing

Create test file `tests/cambodia-filter.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { 
  calculateRelevanceScore,
  isCambodiaRelevant,
  isInCambodiaRegion 
} from '../src/utils/cambodia-filter';

describe('Cambodia Filtering', () => {
  it('should give high score to direct Cambodia mentions', () => {
    const score = calculateRelevanceScore({
      title: 'Cambodia signs trade deal with Thailand',
      description: 'Phnom Penh agreement'
    });
    expect(score).toBeGreaterThan(70);
  });
  
  it('should identify Cambodia-relevant news', () => {
    expect(isCambodiaRelevant('Cambodia economy grows')).toBe(true);
    expect(isCambodiaRelevant('Brazil election results')).toBe(false);
  });
  
  it('should identify locations in Cambodia region', () => {
    expect(isInCambodiaRegion(12.5657, 104.991)).toBe(true); // Phnom Penh
    expect(isInCambodiaRegion(48.8566, 2.3522)).toBe(false); // Paris
  });
});
```

---

## Performance Considerations

### Filtering Performance

- Relevance scoring: ~0.1ms per news item
- Geographic filtering: ~0.05ms per event
- Expected load: 1000 news items = ~100ms

### Optimization Tips

1. **Cache relevance scores** if news items don't change:
```typescript
const scoreCache = new Map();

function getCachedScore(item: NewsItem) {
  const key = item.title + item.description;
  if (!scoreCache.has(key)) {
    scoreCache.set(key, calculateRelevanceScore(item));
  }
  return scoreCache.get(key);
}
```

2. **Lazy load filters** - only import when needed:
```typescript
const filters = isCambodiaVariant 
  ? await import('./utils/cambodia-filter')
  : null;
```

3. **Use Web Workers** for heavy filtering (1000+ items):
```typescript
const worker = new Worker('./cambodia-filter.worker.ts');
worker.postMessage({ news: allNews });
worker.onmessage = (e) => {
  const filtered = e.data;
};
```

---

## Troubleshooting

### Issue: Map not centering on Cambodia
**Solution:** Verify `.env.local` has:
```bash
VITE_DEFAULT_LAT=12.5657
VITE_DEFAULT_LON=104.991
VITE_DEFAULT_ZOOM=7
```

### Issue: No news appearing
**Solution:** 
1. Check RSS feeds are accessible
2. Lower `VITE_MIN_RELEVANCE_SCORE` in `.env.local`
3. Verify keywords in `cambodia-config.ts` match news content

### Issue: Too much irrelevant content
**Solution:**
1. Increase `VITE_MIN_RELEVANCE_SCORE` (e.g., 40)
2. Add more specific keywords to `CAMBODIA_KEYWORDS`
3. Adjust scoring weights in `calculateRelevanceScore()`

### Issue: Performance degradation
**Solution:**
1. Implement caching (see Performance section)
2. Reduce number of monitored RSS feeds
3. Increase refresh intervals

---

## Future Enhancements

Consider implementing:

1. **Machine Learning Classification**
   - Train model on Cambodia-relevant vs. irrelevant news
   - Use TensorFlow.js for browser-side inference

2. **Sentiment Analysis**
   - Track sentiment toward Cambodia in regional news
   - Alert on negative sentiment spikes

3. **Entity Recognition**
   - Auto-extract mentioned places, people, organizations
   - Link to knowledge base

4. **Trend Detection**
   - Track keyword frequency over time
   - Identify emerging topics

5. **Alert System**
   - Browser notifications for critical events
   - Email/SMS for high-priority alerts

6. **Mobile App**
   - React Native version with Cambodia focus
   - Push notifications for border incidents

---

## Contributing

To contribute Cambodia-specific improvements:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/cambodia-enhancement`
3. Make changes to configuration or filters
4. Test with `npm run dev:cambodia`
5. Submit pull request with "Cambodia" label

---

## Support

For Cambodia variant issues:
- Open GitHub issue with `[Cambodia]` prefix
- Include `.env.local` settings (without API keys)
- Describe expected vs. actual behavior

---

**Last Updated:** February 15, 2026
**Variant Version:** 1.0.0
**Compatible with World Monitor:** v2.2.1+
