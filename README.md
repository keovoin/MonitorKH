# 🇰🇭 Cambodia Monitor

Real-time monitoring dashboard for Cambodia - news, weather, and regional updates.

## 🚀 Quick Deploy to Vercel

This repository is configured to automatically deploy the **minimal Cambodia dashboard** from the `minimal/` directory.

### Deploy Now

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/keovoin/MonitorKH)

**OR** connect your existing Vercel project:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your MonitorKH project
3. Go to **Settings** → **Git**
4. Trigger a new deployment
5. Done! Your minimal dashboard will deploy automatically

## 📁 Project Structure

```
MonitorKH/
├── minimal/              # ⭐ Minimal Cambodia Dashboard (deployed by default)
│   ├── index.html       # Main page
│   ├── styles.css       # Styling
│   ├── app.js           # Functionality
│   └── README.md        # Dashboard documentation
├── src/                 # Original full dashboard (not deployed)
├── vercel.json          # Configured to deploy minimal/ directory
└── README.md            # This file
```

## ✨ Features

### 📍 Interactive Map
- Centered on Cambodia (Phnom Penh)
- Key cities: Phnom Penh, Siem Reap, Sihanoukville, Battambang, Kampong Cham
- Dark theme for 24/7 monitoring

### 📰 News Sections

1. **🇰🇭 Cambodia News** - Khmer Times, Phnom Penh Post, VOA Cambodia
2. **🌏 Regional Updates** - ASEAN & neighboring countries
3. **🛡️ Security Monitor** - Border activity & defense news
4. **🌦️ Weather Widget** - Real-time conditions

## 🛠️ Local Development

### Test the Minimal Dashboard

```bash
# Clone the repository
git clone https://github.com/keovoin/MonitorKH.git
cd MonitorKH/minimal

# Serve locally (choose one)
python -m http.server 8000
# or
npx serve
# or
php -S localhost:8000

# Open browser
open http://localhost:8000
```

### Make Changes

1. Edit files in `minimal/` directory
2. Commit and push to `main` branch
3. Vercel will auto-deploy

## 📊 What You'll See

```
┌─────────────────────────────────────┐
│  🇰🇭 Cambodia Monitor    🟢 LIVE   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         📍 CAMBODIA MAP             │
│  [Interactive Leaflet Map]          │
│  • Phnom Penh  • Siem Reap          │
│  • Sihanoukville  • Battambang      │
└─────────────────────────────────────┘

┌─────────┬─────────┬─────────┬────────┐
│Cambodia │Regional │Security │Weather │
│ News    │Updates  │Monitor  │Widget  │
└─────────┴─────────┴─────────┴────────┘
```

## ⚙️ Configuration

### Add More News Sources

Edit `minimal/app.js`:

```javascript
const FEEDS = {
  local: [
    { name: 'Your Source', url: 'https://example.com/feed/', proxy: true },
  ]
};
```

### Customize Map Center

Edit `minimal/app.js`:

```javascript
const map = L.map('map').setView([12.5, 105], 7);
//                                  ↑     ↑    ↑
//                                 lat   lon  zoom
```

## 🔧 Vercel Configuration

The `vercel.json` file is pre-configured to:
- Deploy from `minimal/` directory
- No build step needed (pure HTML/CSS/JS)
- Automatic caching headers
- Clean URLs enabled

## 📚 Documentation

- [Minimal Dashboard README](./minimal/README.md) - Detailed docs for the dashboard
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Leaflet.js Documentation](https://leafletjs.com/)

## 🐛 Troubleshooting

### Dashboard not updating?
1. Check Vercel deployment logs
2. Ensure `vercel.json` points to `minimal/` directory
3. Clear browser cache

### Map not showing?
1. Check browser console for errors
2. Verify Leaflet.js CDN is loading
3. Check internet connection

## 📝 License

MIT License - Free to use and modify

## 🤝 Contributing

Feel free to:
- Add more news sources
- Improve the UI
- Add new features
- Report bugs

## 🌟 Future Features

- [ ] Live RSS feed integration
- [ ] OpenWeather API integration
- [ ] Currency exchange rates (KHR/USD)
- [ ] Border crossing traffic
- [ ] Mekong River water levels
- [ ] Air quality index
- [ ] Flight arrivals/departures

---

**Built for Cambodia 🇰🇭** | Powered by [Vercel](https://vercel.com)
