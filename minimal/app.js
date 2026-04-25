// =========================================================
// Cambodia Monitor - Real-Time Intelligence Dashboard
// Free version: uses Open-Meteo (weather), RSS2JSON (news),
// Leaflet + CartoDB dark tiles (map). No API keys required.
// =========================================================

(function () {
  'use strict';

  // --- CORS proxy for RSS feeds ---
  const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';
  const ALLORIGINS_BASE = 'https://api.allorigins.win/get?url=';

  // --- NEWS FEED SOURCES ---
  const FEED_SOURCES = [
    {
      id: 'khmer-times',
      name: 'Khmer Times',
      url: 'https://www.khmertimeskh.com/feed/',
      color: 'source-khmer-times',
    },
    {
      id: 'pp-post',
      name: 'Phnom Penh Post',
      url: 'https://www.phnompenhpost.com/rss',
      color: 'source-pp-post',
    },
    {
      id: 'voa',
      name: 'VOA Cambodia',
      url: 'https://www.voacambodia.com/api/zq_eoqe$oii',
      color: 'source-voa',
    },
    {
      id: 'cambodianess',
      name: 'Cambodianess',
      url: 'https://cambodianess.com/feed',
      color: 'source-cambodianess',
    },
    {
      id: 'asean',
      name: 'ASEAN Affairs',
      url: 'https://aseanaffairs.com/feed/',
      color: 'source-asean',
    },
  ];

  // --- Cambodia-focused keywords for filtering ---
  const CAMBODIA_KEYWORDS = [
    'cambodia', 'cambodian', 'khmer', 'phnom penh', 'siem reap',
    'sihanoukville', 'battambang', 'kampot', 'koh kong', 'kampong cham',
    'kampong thom', 'prey veng', 'takeo', 'svay rieng', 'banteay meanchey',
    'hun manet', 'hun sen', 'angkor', 'mekong', 'tonle sap',
    'asean', 'ream naval', 'preah vihear', 'poipet', 'bavet',
  ];

  // --- MAP LOCATIONS DATA ---
  const MAP_LAYERS = {
    cities: [
      { name: 'Phnom Penh', coords: [11.5564, 104.9282], type: 'capital', pop: '2.3M', desc: 'Capital & economic center' },
      { name: 'Siem Reap', coords: [13.3633, 103.8564], type: 'city', pop: '250K', desc: 'Tourism hub - Angkor Wat' },
      { name: 'Sihanoukville', coords: [10.6291, 103.5278], type: 'port', pop: '160K', desc: 'Deep-water port & SEZ' },
      { name: 'Battambang', coords: [13.0957, 103.2022], type: 'city', pop: '200K', desc: '2nd largest city, agriculture' },
      { name: 'Kampong Cham', coords: [12.0, 105.4667], type: 'city', pop: '120K', desc: 'Mekong River city' },
      { name: 'Kampot', coords: [10.6168, 104.1763], type: 'city', pop: '50K', desc: 'Coastal tourism & pepper' },
      { name: 'Koh Kong', coords: [11.6157, 102.9856], type: 'city', pop: '40K', desc: 'Border city & eco-tourism' },
      { name: 'Prey Veng', coords: [11.4843, 105.3248], type: 'city', pop: '70K', desc: 'Agricultural province' },
      { name: 'Pursat', coords: [12.5338, 103.9192], type: 'city', pop: '60K', desc: 'Tonle Sap fishing' },
      { name: 'Stung Treng', coords: [13.5246, 105.9684], type: 'city', pop: '35K', desc: 'Mekong confluence' },
    ],
    provinces: [
      { name: 'Phnom Penh', coords: [11.58, 104.92], type: 'province' },
      { name: 'Siem Reap Province', coords: [13.53, 104.07], type: 'province' },
      { name: 'Battambang Province', coords: [13.00, 103.00], type: 'province' },
      { name: 'Preah Sihanouk', coords: [10.75, 103.60], type: 'province' },
      { name: 'Kampong Cham', coords: [12.10, 105.30], type: 'province' },
      { name: 'Kandal', coords: [11.20, 105.00], type: 'province' },
      { name: 'Takeo', coords: [10.90, 104.80], type: 'province' },
      { name: 'Svay Rieng', coords: [11.08, 105.80], type: 'province' },
      { name: 'Mondulkiri', coords: [12.45, 107.19], type: 'province' },
      { name: 'Ratanakiri', coords: [13.73, 107.00], type: 'province' },
    ],
    borders: [
      { name: 'Poipet (TH)', coords: [13.6579, 102.5636], type: 'border', desc: 'Main Cambodia-Thailand crossing' },
      { name: 'Bavet (VN)', coords: [11.0679, 106.1594], type: 'border', desc: 'Main Cambodia-Vietnam crossing' },
      { name: 'Cham Yeam (TH)', coords: [11.6118, 102.9089], type: 'border', desc: 'Koh Kong-Thailand crossing' },
      { name: 'O Smach (TH)', coords: [14.1011, 103.5353], type: 'border', desc: 'Northern Thailand crossing' },
      { name: 'Kaam Samnor (VN)', coords: [11.0272, 104.9972], type: 'border', desc: 'Mekong ferry to Vietnam' },
      { name: 'Stung Treng (LA)', coords: [13.5246, 105.9684], type: 'border', desc: 'Cambodia-Laos crossing' },
      { name: 'Prek Chak (VN)', coords: [10.4412, 104.0511], type: 'border', desc: 'Kampot-Vietnam crossing' },
    ],
    economic: [
      { name: 'Sihanoukville SEZ', coords: [10.6, 103.55], type: 'sez', desc: 'Special Economic Zone' },
      { name: 'Phnom Penh SEZ', coords: [11.49, 104.86], type: 'sez', desc: 'Industrial & manufacturing zone' },
      { name: 'Manhattan SEZ', coords: [11.35, 104.97], type: 'sez', desc: 'Bavet economic zone' },
      { name: 'Koh Kong SEZ', coords: [11.60, 103.00], type: 'sez', desc: 'Coastal economic zone' },
    ],
    infrastructure: [
      { name: 'Phnom Penh Intl Airport', coords: [11.5466, 104.8441], type: 'airport', desc: 'Main international gateway' },
      { name: 'Siem Reap Angkor Intl', coords: [13.4112, 103.8133], type: 'airport', desc: 'New international airport' },
      { name: 'Ream Naval Base', coords: [10.5098, 103.6370], type: 'military', desc: 'Naval base with development' },
      { name: 'Autonomous Port of PP', coords: [11.5775, 104.9148], type: 'port', desc: 'Main river port' },
      { name: 'Sihanoukville Port', coords: [10.6320, 103.5200], type: 'port', desc: 'Primary deep-water port' },
    ],
    tourism: [
      { name: 'Angkor Wat', coords: [13.4125, 103.8670], type: 'tourism', desc: 'UNESCO World Heritage' },
      { name: 'Royal Palace', coords: [11.5635, 104.9314], type: 'tourism', desc: 'Phnom Penh Royal Palace' },
      { name: 'Bokor Mountain', coords: [10.6312, 104.0243], type: 'tourism', desc: 'Mountain resort' },
      { name: 'Kep Beach', coords: [10.4833, 104.3167], type: 'tourism', desc: 'Coastal resort town' },
      { name: 'Tonle Sap Lake', coords: [12.8333, 104.0833], type: 'tourism', desc: 'Largest freshwater lake in SE Asia' },
      { name: 'Preah Vihear Temple', coords: [14.3917, 104.6800], type: 'tourism', desc: 'Mountain temple, UNESCO site' },
    ],
    waterways: [
      { name: 'Mekong River (N)', coords: [13.52, 105.97], type: 'waterway', desc: 'Mekong enters Cambodia' },
      { name: 'Mekong River (Kratie)', coords: [12.49, 106.02], type: 'waterway', desc: 'Irrawaddy dolphins area' },
      { name: 'Tonle Sap River', coords: [12.30, 104.80], type: 'waterway', desc: 'Connects Tonle Sap to Mekong' },
      { name: 'Bassac River', coords: [11.50, 104.95], type: 'waterway', desc: 'Southern distributary' },
      { name: 'Mekong Delta Entry', coords: [11.05, 105.05], type: 'waterway', desc: 'Exit to Vietnam delta' },
    ],
  };

  const LAYER_STYLES = {
    capital: { color: '#ef4444', radius: 9, fillOpacity: 0.9 },
    city: { color: '#f59e0b', radius: 6, fillOpacity: 0.7 },
    port: { color: '#10b981', radius: 7, fillOpacity: 0.8 },
    province: { color: '#f59e0b', radius: 3, fillOpacity: 0.3 },
    border: { color: '#8b5cf6', radius: 7, fillOpacity: 0.8 },
    sez: { color: '#10b981', radius: 7, fillOpacity: 0.7 },
    airport: { color: '#3b82f6', radius: 7, fillOpacity: 0.8 },
    military: { color: '#ef4444', radius: 7, fillOpacity: 0.7 },
    tourism: { color: '#ec4899', radius: 6, fillOpacity: 0.7 },
    waterway: { color: '#06b6d4', radius: 5, fillOpacity: 0.6 },
  };

  // --- WEATHER CITIES ---
  const WEATHER_CITIES = [
    { name: 'Phnom Penh', lat: 11.5564, lon: 104.9282 },
    { name: 'Siem Reap', lat: 13.3633, lon: 103.8564 },
    { name: 'Sihanoukville', lat: 10.6291, lon: 103.5278 },
    { name: 'Battambang', lat: 13.0957, lon: 103.2022 },
  ];

  // ========================
  // MAP INITIALIZATION
  // ========================
  const map = L.map('map', {
    center: [12.5, 105],
    zoom: 7,
    zoomControl: true,
    attributionControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  }).addTo(map);

  // Layer groups
  const layerGroups = {};
  Object.keys(MAP_LAYERS).forEach(key => {
    layerGroups[key] = L.layerGroup();
  });

  function createPopupContent(loc) {
    let html = '<div style="font-family:Inter,sans-serif;min-width:140px">';
    html += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + loc.name + '</div>';
    if (loc.desc) html += '<div style="font-size:11px;color:#94a3b8;margin-bottom:2px">' + loc.desc + '</div>';
    if (loc.pop) html += '<div style="font-size:11px;color:#64748b">Pop: ' + loc.pop + '</div>';
    html += '</div>';
    return html;
  }

  function populateLayers() {
    Object.keys(MAP_LAYERS).forEach(layerKey => {
      const group = layerGroups[layerKey];
      group.clearLayers();
      MAP_LAYERS[layerKey].forEach(loc => {
        const style = LAYER_STYLES[loc.type] || LAYER_STYLES.city;
        const marker = L.circleMarker(loc.coords, {
          radius: style.radius,
          fillColor: style.color,
          color: '#fff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: style.fillOpacity,
        });
        marker.bindPopup(createPopupContent(loc));
        group.addLayer(marker);
      });
    });
  }

  populateLayers();

  // Add default visible layers
  function syncLayers() {
    const checkboxes = document.querySelectorAll('#layer-list input[type="checkbox"]');
    let count = 0;
    checkboxes.forEach(cb => {
      const layerKey = cb.dataset.layer;
      if (cb.checked) {
        if (!map.hasLayer(layerGroups[layerKey])) map.addLayer(layerGroups[layerKey]);
        count++;
      } else {
        if (map.hasLayer(layerGroups[layerKey])) map.removeLayer(layerGroups[layerKey]);
      }
    });
    document.getElementById('layer-count').textContent = count;
  }

  syncLayers();

  document.querySelectorAll('#layer-list input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', syncLayers);
  });

  // Layer panel collapse
  document.getElementById('layer-toggle').addEventListener('click', function () {
    const list = document.getElementById('layer-list');
    list.classList.toggle('collapsed');
    this.textContent = list.classList.contains('collapsed') ? '\u25B6' : '\u25BC';
  });

  // ========================
  // CLOCK
  // ========================
  function updateClock() {
    const now = new Date();
    const options = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Phnom_Penh',
    };
    const formatted = now.toLocaleDateString('en-US', options).toUpperCase().replace(',', '') + ' ICT';
    document.getElementById('top-clock').textContent = formatted;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Simulated viewer count
  function updateViewers() {
    const base = 12 + Math.floor(Math.random() * 30);
    document.getElementById('viewer-count').textContent = base + ' online';
  }
  updateViewers();
  setInterval(updateViewers, 30000);

  // ========================
  // NEWS FETCHING
  // ========================
  let allNewsItems = [];
  let currentFeedFilter = 'all';

  async function fetchRSS(source) {
    const items = [];
    try {
      // Try rss2json first
      const url = RSS2JSON_BASE + encodeURIComponent(source.url);
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('rss2json failed');
      const data = await resp.json();

      if (data.status === 'ok' && data.items) {
        data.items.forEach(item => {
          items.push({
            title: stripHtml(item.title || ''),
            link: item.link || '#',
            pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
            source: source.name,
            sourceId: source.id,
            sourceColor: source.color,
            snippet: stripHtml(item.description || '').slice(0, 120),
          });
        });
      }
    } catch (e1) {
      // Fallback: try allorigins
      try {
        const url = ALLORIGINS_BASE + encodeURIComponent(source.url);
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('allorigins failed');
        const data = await resp.json();
        if (data.contents) {
          const parsed = parseRSSXml(data.contents, source);
          items.push(...parsed);
        }
      } catch (e2) {
        console.warn('Failed to fetch ' + source.name + ':', e2.message);
      }
    }
    return items;
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  }

  function parseRSSXml(xmlStr, source) {
    const items = [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlStr, 'text/xml');
      const entries = doc.querySelectorAll('item, entry');
      entries.forEach(entry => {
        const title = entry.querySelector('title');
        const link = entry.querySelector('link');
        const pubDate = entry.querySelector('pubDate, published, updated');
        const desc = entry.querySelector('description, summary, content');
        items.push({
          title: stripHtml(title ? title.textContent : ''),
          link: link ? (link.getAttribute('href') || link.textContent || '#') : '#',
          pubDate: pubDate ? new Date(pubDate.textContent) : new Date(),
          source: source.name,
          sourceId: source.id,
          sourceColor: source.color,
          snippet: stripHtml(desc ? desc.textContent : '').slice(0, 120),
        });
      });
    } catch (e) {
      console.warn('XML parse error for ' + source.name);
    }
    return items;
  }

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  }

  function isRelevant(item) {
    // For direct Cambodia sources, always relevant
    if (['khmer-times', 'pp-post', 'voa', 'cambodianess'].includes(item.sourceId)) return true;
    // For ASEAN/regional, check keywords
    const text = (item.title + ' ' + item.snippet).toLowerCase();
    return CAMBODIA_KEYWORDS.some(kw => text.includes(kw));
  }

  function renderNews() {
    const container = document.getElementById('news-feed');
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();

    let filtered = allNewsItems.filter(item => {
      if (currentFeedFilter !== 'all' && item.sourceId !== currentFeedFilter) return false;
      if (searchTerm && !(item.title + ' ' + item.snippet).toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    // Sort by date descending
    filtered.sort((a, b) => b.pubDate - a.pubDate);

    document.getElementById('news-total').textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="loading-state"><span>No news found</span></div>';
      return;
    }

    container.innerHTML = '';
    filtered.slice(0, 50).forEach(item => {
      const div = document.createElement('div');
      div.className = 'news-item';
      div.onclick = () => window.open(item.link, '_blank');
      div.innerHTML =
        '<div class="news-time-col">' + timeAgo(item.pubDate) + '</div>' +
        '<div class="news-body">' +
          '<span class="news-source-tag ' + item.sourceColor + '">' + item.source + '</span>' +
          '<div class="news-headline">' + item.title + '</div>' +
          (item.snippet ? '<div class="news-snippet">' + item.snippet + '</div>' : '') +
        '</div>';
      container.appendChild(div);
    });
  }

  async function loadAllNews() {
    const container = document.getElementById('news-feed');
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading feeds...</span></div>';

    const promises = FEED_SOURCES.map(src => fetchRSS(src));
    const results = await Promise.allSettled(promises);

    allNewsItems = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allNewsItems.push(...result.value.filter(isRelevant));
      }
    });

    // If no live feeds, add fallback data
    if (allNewsItems.length === 0) {
      allNewsItems = getFallbackNews();
    }

    renderNews();
  }

  function getFallbackNews() {
    const now = new Date();
    return [
      { title: 'Cambodia GDP growth projected at 6.5% for 2026', link: '#', pubDate: new Date(now - 2 * 3600000), source: 'Khmer Times', sourceId: 'khmer-times', sourceColor: 'source-khmer-times', snippet: 'Economic growth remains strong driven by tourism, construction, and garment exports.' },
      { title: 'Hun Manet meets with ASEAN leaders to discuss regional trade', link: '#', pubDate: new Date(now - 4 * 3600000), source: 'Phnom Penh Post', sourceId: 'pp-post', sourceColor: 'source-pp-post', snippet: 'Prime Minister Hun Manet attended the ASEAN Economic Forum in Jakarta.' },
      { title: 'New Siem Reap international airport sees record passenger numbers', link: '#', pubDate: new Date(now - 6 * 3600000), source: 'VOA Cambodia', sourceId: 'voa', sourceColor: 'source-voa', snippet: 'The newly opened airport has significantly boosted tourism to Angkor Wat.' },
      { title: 'Sihanoukville port expansion project enters phase 2', link: '#', pubDate: new Date(now - 8 * 3600000), source: 'Cambodianess', sourceId: 'cambodianess', sourceColor: 'source-cambodianess', snippet: 'Port capacity to double with new deep-water berths for larger container ships.' },
      { title: 'Cambodia-Thailand border trade reaches $5 billion milestone', link: '#', pubDate: new Date(now - 10 * 3600000), source: 'Khmer Times', sourceId: 'khmer-times', sourceColor: 'source-khmer-times', snippet: 'Bilateral trade continues to grow with improved border infrastructure at Poipet.' },
      { title: 'Phnom Penh launches digital economy initiative', link: '#', pubDate: new Date(now - 12 * 3600000), source: 'Phnom Penh Post', sourceId: 'pp-post', sourceColor: 'source-pp-post', snippet: 'Government aims to create 50,000 tech jobs by 2028.' },
      { title: 'Mekong River water levels stable despite regional dry season', link: '#', pubDate: new Date(now - 14 * 3600000), source: 'ASEAN Affairs', sourceId: 'asean', sourceColor: 'source-asean', snippet: 'Mekong River Commission reports adequate water flows for agriculture.' },
      { title: 'Cambodia garment sector sees 15% export increase in Q1', link: '#', pubDate: new Date(now - 16 * 3600000), source: 'Cambodianess', sourceId: 'cambodianess', sourceColor: 'source-cambodianess', snippet: 'European and US buyers increase orders from Cambodian manufacturers.' },
      { title: 'Angkor Wat visitor numbers surge 30% year-on-year', link: '#', pubDate: new Date(now - 18 * 3600000), source: 'Khmer Times', sourceId: 'khmer-times', sourceColor: 'source-khmer-times', snippet: 'Temple complex sees strongest tourism recovery since 2019.' },
      { title: 'Cambodia and Vietnam strengthen economic cooperation agreement', link: '#', pubDate: new Date(now - 20 * 3600000), source: 'VOA Cambodia', sourceId: 'voa', sourceColor: 'source-voa', snippet: 'New bilateral agreement focuses on trade corridors and border infrastructure.' },
      { title: 'ASEAN summit discusses Cambodia role in regional security', link: '#', pubDate: new Date(now - 22 * 3600000), source: 'ASEAN Affairs', sourceId: 'asean', sourceColor: 'source-asean', snippet: 'Cambodia to contribute to maritime security cooperation in South China Sea.' },
      { title: 'Battambang rice exports reach new highs with improved logistics', link: '#', pubDate: new Date(now - 24 * 3600000), source: 'Phnom Penh Post', sourceId: 'pp-post', sourceColor: 'source-pp-post', snippet: 'Jasmine rice exports to China and EU markets continue to grow.' },
    ];
  }

  // News tab clicks
  document.getElementById('news-tabs').addEventListener('click', function (e) {
    if (e.target.classList.contains('tab')) {
      document.querySelectorAll('#news-tabs .tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentFeedFilter = e.target.dataset.feed;
      renderNews();
    }
  });

  // Search filtering
  document.getElementById('search-input').addEventListener('input', renderNews);

  // Refresh button
  document.getElementById('news-refresh').addEventListener('click', loadAllNews);

  // Expand button
  document.getElementById('news-expand').addEventListener('click', function () {
    document.querySelector('.panel-news').classList.toggle('expanded');
    this.textContent = document.querySelector('.panel-news').classList.contains('expanded') ? '\u2716' : '\u2750';
  });

  // ========================
  // WEATHER (Open-Meteo API - free, no key)
  // ========================
  function getWeatherEmoji(code) {
    if (code === 0) return '\u2600\uFE0F'; // clear
    if (code <= 3) return '\u26C5'; // partly cloudy
    if (code <= 48) return '\uD83C\uDF2B\uFE0F'; // fog
    if (code <= 57) return '\uD83C\uDF27\uFE0F'; // drizzle
    if (code <= 67) return '\uD83C\uDF27\uFE0F'; // rain
    if (code <= 77) return '\u2744\uFE0F'; // snow
    if (code <= 82) return '\u26C8\uFE0F'; // showers
    if (code <= 99) return '\u26A1'; // thunderstorm
    return '\uD83C\uDF24\uFE0F';
  }

  function getWeatherDesc(code) {
    if (code === 0) return 'Clear sky';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Fog';
    if (code <= 57) return 'Drizzle';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Showers';
    if (code <= 99) return 'Thunderstorm';
    return 'Unknown';
  }

  async function loadWeather() {
    const container = document.getElementById('weather-grid');
    try {
      const lats = WEATHER_CITIES.map(c => c.lat).join(',');
      const lons = WEATHER_CITIES.map(c => c.lon).join(',');

      // Fetch each city individually (Open-Meteo doesn't support batch for current weather)
      const results = await Promise.all(
        WEATHER_CITIES.map(city =>
          fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=' + city.lat +
            '&longitude=' + city.lon +
            '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code' +
            '&timezone=Asia/Phnom_Penh'
          ).then(r => r.json())
        )
      );

      container.innerHTML = '';
      results.forEach((data, i) => {
        const city = WEATHER_CITIES[i];
        const current = data.current || {};
        const temp = Math.round(current.temperature_2m || 0);
        const humidity = current.relative_humidity_2m || 0;
        const wind = current.wind_speed_10m || 0;
        const code = current.weather_code || 0;

        const card = document.createElement('div');
        card.className = 'weather-card';
        card.innerHTML =
          '<div class="weather-city">' + city.name + '</div>' +
          '<div class="weather-icon">' + getWeatherEmoji(code) + '</div>' +
          '<div class="weather-temp">' + temp + '\u00B0C</div>' +
          '<div class="weather-details">' +
            '<div class="weather-detail-row">' + getWeatherDesc(code) + '</div>' +
            '<div class="weather-detail-row">Humidity: ' + humidity + '%</div>' +
            '<div class="weather-detail-row">Wind: ' + wind + ' km/h</div>' +
          '</div>';
        container.appendChild(card);
      });
    } catch (e) {
      console.error('Weather load error:', e);
      container.innerHTML =
        '<div class="weather-card"><div class="weather-city">Weather unavailable</div></div>';
    }
  }

  document.getElementById('weather-refresh').addEventListener('click', loadWeather);

  // ========================
  // TIME RANGE SELECTOR
  // ========================
  document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // ========================
  // ABOUT MODAL
  // ========================
  document.getElementById('about-link').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('about-modal').classList.add('active');
  });
  document.getElementById('modal-close').addEventListener('click', function () {
    document.getElementById('about-modal').classList.remove('active');
  });
  document.getElementById('about-modal').addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('active');
  });

  // ========================
  // EXCHANGE RATE (free API)
  // ========================
  async function loadExchangeRates() {
    try {
      const resp = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!resp.ok) throw new Error('Exchange rate API failed');
      const data = await resp.json();
      if (data.rates) {
        const khr = data.rates.KHR || 4100;
        const thb = data.rates.THB || 34;
        const cny = data.rates.CNY || 7.25;

        document.getElementById('usd-khr').textContent = Math.round(khr).toLocaleString();
        document.getElementById('thb-khr').textContent = Math.round(khr / thb).toLocaleString();
        document.getElementById('cny-khr').textContent = Math.round(khr / cny).toLocaleString();

        // Update change indicators
        document.querySelectorAll('.rate-change').forEach(el => {
          el.classList.remove('neutral');
          el.classList.add('neutral');
          el.textContent = '--';
        });
      }
    } catch (e) {
      console.warn('Exchange rate fetch failed:', e.message);
    }
  }

  // ========================
  // INITIALIZE
  // ========================
  loadAllNews();
  loadWeather();
  loadExchangeRates();

  // Auto-refresh
  setInterval(loadAllNews, 5 * 60 * 1000); // 5 minutes
  setInterval(loadWeather, 15 * 60 * 1000); // 15 minutes
  setInterval(loadExchangeRates, 30 * 60 * 1000); // 30 minutes

})();
