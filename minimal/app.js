// Initialize map centered on Cambodia
const map = L.map('map').setView([12.5, 105], 7);

// Add dark theme map tiles
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO',
  maxZoom: 19
}).addTo(map);

// Add markers for key Cambodia locations
const locations = [
  { name: 'Phnom Penh', coords: [11.5564, 104.9282], type: 'capital' },
  { name: 'Siem Reap', coords: [13.3633, 103.8564], type: 'city' },
  { name: 'Sihanoukville', coords: [10.6291, 103.5278], type: 'port' },
  { name: 'Battambang', coords: [13.0957, 103.2022], type: 'city' },
  { name: 'Kampong Cham', coords: [12.0, 105.4667], type: 'city' },
];

locations.forEach(loc => {
  const color = loc.type === 'capital' ? '#ef4444' : loc.type === 'port' ? '#3b82f6' : '#10b981';
  L.circleMarker(loc.coords, {
    radius: loc.type === 'capital' ? 8 : 6,
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
  }).addTo(map).bindPopup(`<b>${loc.name}</b>`);
});

// Update time
function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Phnom_Penh'
  });
  document.getElementById('time').textContent = `${timeStr} ICT`;
}
updateTime();
setInterval(updateTime, 1000);

// News feed configuration
const FEEDS = {
  local: [
    { name: 'Khmer Times', url: 'https://www.khmertimeskh.com/feed/', proxy: true },
    { name: 'Phnom Penh Post', url: 'https://www.phnompenhpost.com/rss', proxy: true },
    { name: 'VOA Cambodia', url: 'https://www.voacambodia.com/api/zq_eoqe$oii', proxy: true },
  ],
  regional: [
    { name: 'ASEAN Today', keywords: ['cambodia', 'mekong', 'asean'] },
    { name: 'Bangkok Post', url: 'https://www.bangkokpost.com/rss', keywords: ['cambodia'] },
    { name: 'Vietnam News', url: 'https://vietnamnews.vn/rss/home.rss', keywords: ['cambodia'] },
  ],
  security: [
    { name: 'Security', keywords: ['border', 'military', 'ream', 'security', 'defense'] },
  ]
};

// Fetch and display news
async function fetchNews(feedConfig, containerId, countId) {
  const container = document.getElementById(containerId);
  const count = document.getElementById(countId);
  
  try {
    // For demo, using sample data. In production, fetch from RSS feeds via proxy
    const sampleNews = generateSampleNews(feedConfig);
    
    container.classList.remove('loading');
    container.innerHTML = '';
    
    if (sampleNews.length === 0) {
      container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 2rem;">No recent updates</p>';
      return;
    }
    
    count.textContent = sampleNews.length;
    
    sampleNews.forEach(item => {
      const newsItem = document.createElement('div');
      newsItem.className = 'news-item';
      newsItem.onclick = () => window.open(item.link, '_blank');
      
      newsItem.innerHTML = `
        <div class="news-item-header">
          <span class="news-source">${item.source}</span>
          <span class="news-time">${item.time}</span>
        </div>
        <div class="news-title">${item.title}</div>
        ${item.excerpt ? `<div class="news-excerpt">${item.excerpt}</div>` : ''}
      `;
      
      container.appendChild(newsItem);
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    container.innerHTML = '<p style="color: #ef4444; text-align: center; padding: 2rem;">Failed to load news</p>';
  }
}

// Generate sample news (replace with real RSS feed fetcher)
function generateSampleNews(config) {
  const samples = {
    local: [
      { source: 'Khmer Times', title: 'Cambodia\'s GDP growth projected at 6.5% for 2026', time: '2h ago', link: '#' },
      { source: 'Phnom Penh Post', title: 'New infrastructure projects announced in Sihanoukville', time: '4h ago', link: '#' },
      { source: 'VOA Cambodia', title: 'Hun Manet meets with ASEAN leaders in Jakarta', time: '6h ago', link: '#' },
      { source: 'Khmer Times', title: 'Tourism sector sees 25% increase in Q1 2026', time: '8h ago', link: '#' },
    ],
    regional: [
      { source: 'ASEAN Today', title: 'Mekong water levels remain stable despite dry season', time: '3h ago', link: '#' },
      { source: 'Bangkok Post', title: 'Thailand-Cambodia border trade reaches $5B annually', time: '5h ago', link: '#' },
      { source: 'Vietnam News', title: 'Vietnam and Cambodia strengthen economic ties', time: '7h ago', link: '#' },
    ],
    security: [
      { source: 'Defense News', title: 'Cambodia conducts joint ASEAN naval exercises', time: '5h ago', link: '#' },
      { source: 'Border Monitor', title: 'New border checkpoints operational in Preah Vihear', time: '9h ago', link: '#' },
    ]
  };
  
  return samples[config] || [];
}

// Weather data (placeholder - integrate with OpenWeather API)
function loadWeather() {
  document.getElementById('phnom-penh-weather').innerHTML = `
    <strong>Phnom Penh</strong><br>
    🌤️ 32°C - Partly Cloudy<br>
    Humidity: 65% | Wind: 12 km/h
  `;
  
  document.getElementById('siem-reap-weather').innerHTML = `
    <strong>Siem Reap</strong><br>
    ☀️ 34°C - Sunny<br>
    Humidity: 55% | Wind: 8 km/h
  `;
}

// Initialize dashboard
function init() {
  fetchNews('local', 'local-news', 'local-count');
  fetchNews('regional', 'regional-news', 'regional-count');
  fetchNews('security', 'security-news', 'security-count');
  loadWeather();
  
  // Refresh news every 5 minutes
  setInterval(() => {
    fetchNews('local', 'local-news', 'local-count');
    fetchNews('regional', 'regional-news', 'regional-count');
    fetchNews('security', 'security-news', 'security-count');
  }, 5 * 60 * 1000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
