# 🇰🇭 Cambodia Monitor - Minimal Version

A lightweight, fast-loading Cambodia monitoring dashboard focused on local news and regional updates.

## Features

### 📍 Interactive Map
- Centered on Cambodia (Phnom Penh)
- Key cities marked: Phnom Penh, Siem Reap, Sihanoukville, Battambang, Kampong Cham
- Dark theme optimized for 24/7 monitoring

### 📰 News Sections

1. **🇰🇭 Cambodia News**
   - Khmer Times
   - Phnom Penh Post
   - VOA Cambodia

2. **🌏 ASEAN & Regional**
   - ASEAN Today
   - Bangkok Post (Cambodia coverage)
   - Vietnam News (Cambodia coverage)

3. **🛡️ Border & Security**
   - Border activity updates
   - Military and defense news
   - Security developments

4. **🌦️ Weather & Environment**
   - Phnom Penh weather
   - Siem Reap weather
   - Real-time updates

## Tech Stack

- **Pure HTML/CSS/JavaScript** - No frameworks, fast loading
- **Leaflet.js** - Interactive maps
- **RSS Feeds** - Real-time news updates
- **Dark Theme** - Easy on the eyes for extended monitoring

## Deployment

### Deploy to Vercel

```bash
# Deploy this minimal version
vercel --prod
```

### Local Development

```bash
# Serve locally (any HTTP server works)
python -m http.server 8000
# or
npx serve
```

Then open: http://localhost:8000

## Configuration

### Add More News Sources

Edit `app.js` and add to the `FEEDS` object:

```javascript
const FEEDS = {
  local: [
    { name: 'Your Source', url: 'https://example.com/feed/', proxy: true },
  ]
};
```

### Customize Map

Edit map center in `app.js`:

```javascript
const map = L.map('map').setView([12.5, 105], 7);
//                                  ↑     ↑    ↑
//                                 lat   lon  zoom
```

### Add Markers

Add locations to the `locations` array in `app.js`:

```javascript
const locations = [
  { name: 'Your City', coords: [lat, lon], type: 'city' },
];
```

## File Structure

```
minimal/
├── index.html      # Main page structure
├── styles.css      # Clean, modern styling
├── app.js          # Map, news feeds, updates
├── vercel.json     # Deployment config
└── README.md       # This file
```

## Performance

- ✅ **No build step** - Deploy instantly
- ✅ **~15KB total** - Lightning fast
- ✅ **Pure static** - No server needed
- ✅ **Auto-refresh** - Updates every 5 minutes

## Next Steps

### Integrate Real RSS Feeds

1. Create a simple proxy endpoint (Vercel serverless function)
2. Fetch RSS feeds server-side to avoid CORS
3. Parse and return JSON

### Add Weather API

```javascript
const API_KEY = 'your-openweather-key';
const url = `https://api.openweathermap.org/data/2.5/weather?q=Phnom Penh&appid=${API_KEY}`;
```

### Add More Features

- [ ] Border crossing traffic
- [ ] Currency exchange rates (KHR/USD)
- [ ] Flight arrivals/departures
- [ ] Mekong River water levels
- [ ] Air quality index

## License

MIT - Free to use and modify

---

**Built for Cambodia 🇰🇭**
