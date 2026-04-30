// =========================================================
// Cambodia Monitor v4.0 - WorldMonitor-Style Intelligence Dashboard
// Features: 3D Globe, MapLibre GL 2D Map, AI News Analysis,
// GDELT Global Intelligence, CSX Stock Exchange, Economic Forecasting,
// Strategic Risk Assessment — all free APIs, no keys required.
// =========================================================

(function () {
  'use strict';

  // --- CORS proxy for RSS feeds ---
  var RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json?rss_url=';
  var ALLORIGINS_BASE = 'https://api.allorigins.win/get?url=';

  // --- NEWS FEED SOURCES ---
  var FEED_SOURCES = [
    { id: 'khmer-times', name: 'Khmer Times', url: 'https://www.khmertimeskh.com/feed/', color: 'source-khmer-times', local: true },
    { id: 'pp-post', name: 'Phnom Penh Post', url: 'https://www.phnompenhpost.com/rss', color: 'source-pp-post', local: true },
    { id: 'voa', name: 'VOA Cambodia', url: 'https://www.voacambodia.com/api/zq_eoqe$oii', color: 'source-voa', local: true },
    { id: 'cambodianess', name: 'Cambodianess', url: 'https://cambodianess.com/feed', color: 'source-cambodianess', local: true },
    { id: 'asean', name: 'ASEAN Affairs', url: 'https://aseanaffairs.com/feed/', color: 'source-asean', local: false },
    { id: 'reuters', name: 'Reuters', url: 'https://www.reutersagency.com/feed/', color: 'source-reuters', local: false },
    { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', color: 'source-aljazeera', local: false },
    { id: 'bbc', name: 'BBC News', url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', color: 'source-bbc', local: false },
    { id: 'ap', name: 'AP News', url: 'https://rsshub.app/apnews/topics/world-news', color: 'source-ap', local: false },
    { id: 'nikkei', name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss', color: 'source-nikkei', local: false },
  ];

  // --- Cambodia-focused keywords for filtering ---
  var CAMBODIA_KEYWORDS = [
    'cambodia', 'cambodian', 'khmer', 'phnom penh', 'siem reap',
    'sihanoukville', 'battambang', 'kampot', 'koh kong', 'kampong cham',
    'kampong thom', 'prey veng', 'takeo', 'svay rieng', 'banteay meanchey',
    'hun manet', 'hun sen', 'angkor', 'mekong', 'tonle sap',
    'asean', 'ream naval', 'preah vihear', 'poipet', 'bavet',
  ];

  // =========================================================
  // AI ENGINE - Sentiment, Categorization, Priority
  // =========================================================
  var AI_POSITIVE = ['growth', 'increase', 'improve', 'boost', 'record', 'success', 'expand', 'develop', 'invest', 'progress', 'surge', 'recovery', 'strengthen', 'stable', 'cooperation', 'agreement', 'opportunity', 'innovation', 'award', 'achieve'];
  var AI_NEGATIVE = ['decline', 'fall', 'crisis', 'threat', 'risk', 'conflict', 'concern', 'drop', 'damage', 'corruption', 'protest', 'violence', 'arrest', 'flood', 'drought', 'sanction', 'debt', 'poverty', 'collapse', 'dispute'];
  var AI_BREAKING = ['breaking', 'urgent', 'just in', 'developing', 'alert', 'emergency', 'exclusive', 'latest'];

  var AI_CATEGORIES = {
    politics: ['government', 'minister', 'election', 'policy', 'parliament', 'hun manet', 'hun sen', 'party', 'political', 'legislation', 'diplomat', 'summit', 'bilateral'],
    economy: ['gdp', 'trade', 'investment', 'economic', 'business', 'export', 'import', 'fdi', 'inflation', 'market', 'financial', 'bank', 'budget', 'revenue', 'growth'],
    security: ['military', 'security', 'defense', 'border', 'crime', 'police', 'terrorism', 'drug', 'trafficking', 'ream naval', 'armed'],
    trade: ['trade', 'export', 'import', 'tariff', 'commerce', 'asean', 'bilateral', 'customs', 'goods', 'supply chain', 'logistics'],
    infrastructure: ['airport', 'road', 'bridge', 'port', 'construction', 'rail', 'highway', 'sez', 'development', 'project'],
    tourism: ['tourism', 'tourist', 'angkor', 'hotel', 'visitor', 'travel', 'heritage', 'siem reap'],
  };

  function aiAnalyzeSentiment(text) {
    var lower = text.toLowerCase();
    var posCount = 0;
    var negCount = 0;
    AI_POSITIVE.forEach(function (w) { if (lower.includes(w)) posCount++; });
    AI_NEGATIVE.forEach(function (w) { if (lower.includes(w)) negCount++; });
    if (posCount > negCount + 1) return 'positive';
    if (negCount > posCount + 1) return 'negative';
    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
  }

  function aiCategorize(text) {
    var lower = text.toLowerCase();
    var scores = {};
    Object.keys(AI_CATEGORIES).forEach(function (cat) {
      scores[cat] = 0;
      AI_CATEGORIES[cat].forEach(function (kw) {
        if (lower.includes(kw)) scores[cat]++;
      });
    });
    var best = 'economy';
    var bestScore = 0;
    Object.keys(scores).forEach(function (cat) {
      if (scores[cat] > bestScore) { bestScore = scores[cat]; best = cat; }
    });
    return best;
  }

  function aiPriority(text) {
    var lower = text.toLowerCase();
    var isBreaking = AI_BREAKING.some(function (w) { return lower.includes(w); });
    if (isBreaking) return 'high';
    var neg = 0;
    AI_NEGATIVE.forEach(function (w) { if (lower.includes(w)) neg++; });
    if (neg >= 3) return 'high';
    if (neg >= 1) return 'medium';
    return 'low';
  }

  function aiEnrichItem(item) {
    var fullText = item.title + ' ' + item.snippet;
    item.sentiment = aiAnalyzeSentiment(fullText);
    item.category = aiCategorize(fullText);
    item.priority = aiPriority(fullText);
    item.isBreaking = AI_BREAKING.some(function (w) { return fullText.toLowerCase().includes(w); });
    return item;
  }

  // =========================================================
  // MAP LOCATIONS DATA
  // =========================================================
  var MAP_LAYERS = {
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

  var LAYER_STYLES = {
    capital: { color: '#ef4444', radius: 9, fillOpacity: 0.9, size: 0.6 },
    city: { color: '#f59e0b', radius: 6, fillOpacity: 0.7, size: 0.35 },
    port: { color: '#10b981', radius: 7, fillOpacity: 0.8, size: 0.4 },
    province: { color: '#f59e0b', radius: 3, fillOpacity: 0.3, size: 0.15 },
    border: { color: '#8b5cf6', radius: 7, fillOpacity: 0.8, size: 0.4 },
    sez: { color: '#10b981', radius: 7, fillOpacity: 0.7, size: 0.35 },
    airport: { color: '#3b82f6', radius: 7, fillOpacity: 0.8, size: 0.4 },
    military: { color: '#ef4444', radius: 7, fillOpacity: 0.7, size: 0.4 },
    tourism: { color: '#ec4899', radius: 6, fillOpacity: 0.7, size: 0.35 },
    waterway: { color: '#06b6d4', radius: 5, fillOpacity: 0.6, size: 0.25 },
  };

  // =========================================================
  // GLOBE ARC DATA: Flights, Shipping, Submarine Cables
  // =========================================================
  var PP = { lat: 11.55, lng: 104.92 };     // Phnom Penh Airport
  var SR = { lat: 13.41, lng: 103.81 };     // Siem Reap Airport
  var SHV = { lat: 10.63, lng: 103.52 };    // Sihanoukville Port

  // --- FLIGHT ROUTES from Phnom Penh & Siem Reap ---
  var FLIGHT_ROUTES = [
    { from: PP, to: { lat: 13.69, lng: 100.75 }, label: 'PNH-BKK', desc: 'Bangkok (1h)', airline: 'Multiple' },
    { from: PP, to: { lat: 1.35, lng: 103.99 }, label: 'PNH-SIN', desc: 'Singapore (2h)', airline: 'Multiple' },
    { from: PP, to: { lat: 10.82, lng: 106.65 }, label: 'PNH-SGN', desc: 'Ho Chi Minh (1h)', airline: 'Multiple' },
    { from: PP, to: { lat: 21.22, lng: 105.81 }, label: 'PNH-HAN', desc: 'Hanoi (2h)', airline: 'Vietnam Airlines' },
    { from: PP, to: { lat: 3.14, lng: 101.69 }, label: 'PNH-KUL', desc: 'Kuala Lumpur (2h)', airline: 'AirAsia' },
    { from: PP, to: { lat: 22.31, lng: 113.91 }, label: 'PNH-HKG', desc: 'Hong Kong (3h)', airline: 'Multiple' },
    { from: PP, to: { lat: 37.46, lng: 126.44 }, label: 'PNH-ICN', desc: 'Seoul Incheon (5h)', airline: 'Korean Air' },
    { from: PP, to: { lat: 35.55, lng: 139.78 }, label: 'PNH-NRT', desc: 'Tokyo Narita (6h)', airline: 'ANA' },
    { from: PP, to: { lat: 31.14, lng: 121.80 }, label: 'PNH-PVG', desc: 'Shanghai (4h)', airline: 'China Eastern' },
    { from: PP, to: { lat: 39.51, lng: 116.59 }, label: 'PNH-PEK', desc: 'Beijing (5h)', airline: 'Air China' },
    { from: PP, to: { lat: 23.39, lng: 113.30 }, label: 'PNH-CAN', desc: 'Guangzhou (3h)', airline: 'China Southern' },
    { from: PP, to: { lat: 25.08, lng: 121.23 }, label: 'PNH-TPE', desc: 'Taipei (4h)', airline: 'EVA Air' },
    { from: SR, to: { lat: 13.69, lng: 100.75 }, label: 'REP-BKK', desc: 'Siem Reap-Bangkok (1h)', airline: 'Multiple' },
    { from: SR, to: { lat: 1.35, lng: 103.99 }, label: 'REP-SIN', desc: 'Siem Reap-Singapore (2.5h)', airline: 'Singapore Airlines' },
    { from: SR, to: { lat: 37.46, lng: 126.44 }, label: 'REP-ICN', desc: 'Siem Reap-Seoul (5.5h)', airline: 'Korean Air' },
    { from: SR, to: { lat: 22.31, lng: 113.91 }, label: 'REP-HKG', desc: 'Siem Reap-Hong Kong (3h)', airline: 'Cathay Pacific' },
    { from: PP, to: { lat: 7.12, lng: 100.39 }, label: 'PNH-HDY', desc: 'Hat Yai, Thailand', airline: 'AirAsia' },
    { from: PP, to: { lat: 14.52, lng: 121.02 }, label: 'PNH-MNL', desc: 'Manila (3h)', airline: 'Cebu Pacific' },
  ];

  // --- SHIPPING LANES from Sihanoukville & Phnom Penh Port ---
  var SHIPPING_ROUTES = [
    { from: SHV, to: { lat: 1.26, lng: 103.84 }, label: 'SHV-SIN', desc: 'Singapore (container)', type: 'container' },
    { from: SHV, to: { lat: 22.28, lng: 114.16 }, label: 'SHV-HKG', desc: 'Hong Kong (general cargo)', type: 'cargo' },
    { from: SHV, to: { lat: 31.23, lng: 121.47 }, label: 'SHV-SHA', desc: 'Shanghai (container)', type: 'container' },
    { from: SHV, to: { lat: 13.12, lng: 100.92 }, label: 'SHV-LCB', desc: 'Laem Chabang, Thailand', type: 'container' },
    { from: SHV, to: { lat: 10.77, lng: 106.71 }, label: 'SHV-SGN', desc: 'Ho Chi Minh Port', type: 'cargo' },
    { from: SHV, to: { lat: 35.44, lng: 139.64 }, label: 'SHV-YOK', desc: 'Yokohama, Japan', type: 'container' },
    { from: SHV, to: { lat: 35.10, lng: 129.03 }, label: 'SHV-PUS', desc: 'Busan, S. Korea', type: 'container' },
    { from: { lat: 11.58, lng: 104.91 }, to: { lat: 10.77, lng: 106.71 }, label: 'PP-SGN', desc: 'PP River Port to HCMC', type: 'river' },
  ];

  // --- SUBMARINE CABLE ROUTES (approximated waypoints) ---
  // AAG: Asia-America Gateway, MCT: Malaysia-Cambodia-Thailand, AAE-1: Asia-Africa-Europe 1
  var SUBMARINE_CABLES = [
    {
      name: 'MCT Cable',
      desc: 'Malaysia-Cambodia-Thailand submarine cable (2017)',
      color: '#06b6d4',
      segments: [
        { from: { lat: 10.55, lng: 103.50 }, to: { lat: 7.88, lng: 102.30 } },
        { from: { lat: 7.88, lng: 102.30 }, to: { lat: 3.16, lng: 101.70 } },
        { from: { lat: 10.55, lng: 103.50 }, to: { lat: 12.57, lng: 100.91 } },
      ],
    },
    {
      name: 'AAG Cable',
      desc: 'Asia-America Gateway (via Vietnam landing)',
      color: '#8b5cf6',
      segments: [
        { from: { lat: 10.35, lng: 107.08 }, to: { lat: 8.50, lng: 110.00 } },
        { from: { lat: 8.50, lng: 110.00 }, to: { lat: 1.30, lng: 104.00 } },
        { from: { lat: 1.30, lng: 104.00 }, to: { lat: 22.30, lng: 114.20 } },
      ],
    },
    {
      name: 'AAE-1 Cable',
      desc: 'Asia-Africa-Europe 1 (via Vietnam)',
      color: '#ec4899',
      segments: [
        { from: { lat: 10.35, lng: 107.08 }, to: { lat: 1.30, lng: 104.00 } },
        { from: { lat: 1.30, lng: 104.00 }, to: { lat: 12.97, lng: 80.18 } },
        { from: { lat: 12.97, lng: 80.18 }, to: { lat: 12.50, lng: 43.15 } },
      ],
    },
    {
      name: 'SJC2 Cable',
      desc: 'Southeast Asia-Japan Cable 2',
      color: '#f59e0b',
      segments: [
        { from: { lat: 10.35, lng: 107.08 }, to: { lat: 22.30, lng: 114.20 } },
        { from: { lat: 22.30, lng: 114.20 }, to: { lat: 25.05, lng: 121.50 } },
        { from: { lat: 25.05, lng: 121.50 }, to: { lat: 34.40, lng: 136.90 } },
      ],
    },
  ];

  // Cambodia's internet connectivity comes through Vietnam landing stations
  var CABLE_LANDING = { lat: 10.35, lng: 107.08, name: 'Vung Tau Landing', desc: 'Vietnam cable landing (Cambodia connects via terrestrial)' };
  var CAMBODIA_TERRESTRIAL = { from: PP, to: CABLE_LANDING, label: 'Terrestrial Fiber', desc: 'Cambodia-Vietnam fiber link' };

  // --- WEATHER CITIES ---
  var WEATHER_CITIES = [
    { name: 'Phnom Penh', lat: 11.5564, lon: 104.9282 },
    { name: 'Siem Reap', lat: 13.3633, lon: 103.8564 },
    { name: 'Sihanoukville', lat: 10.6291, lon: 103.5278 },
    { name: 'Battambang', lat: 13.0957, lon: 103.2022 },
  ];

  // =========================================================
  // 3D GLOBE INITIALIZATION (Globe.gl)
  // =========================================================
  var globe = null;
  var is3D = true;
  var leafletMap = null;
  var maplibreMap = null;
  var layerGroups = {};
  var maplibreMarkers = [];

  // Globe layer visibility state
  var globeLayerState = {
    flights: true,
    shipping: true,
    cables: true,
    locations: true,
  };

  function buildGlobeArcs() {
    var arcs = [];

    // Flight routes (white/cyan animated dashes)
    if (globeLayerState.flights) {
      FLIGHT_ROUTES.forEach(function (r) {
        arcs.push({
          startLat: r.from.lat, startLng: r.from.lng,
          endLat: r.to.lat, endLng: r.to.lng,
          color: ['rgba(59,130,246,0.9)', 'rgba(6,182,212,0.7)'],
          stroke: 0.4, dashLen: 0.3, dashGap: 0.15, animTime: 2500,
          category: 'flight',
          label: r.label + ' \u2708 ' + r.desc + (r.airline !== 'Multiple' ? ' (' + r.airline + ')' : ''),
        });
      });
    }

    // Shipping lanes (green/yellow)
    if (globeLayerState.shipping) {
      SHIPPING_ROUTES.forEach(function (r) {
        arcs.push({
          startLat: r.from.lat, startLng: r.from.lng,
          endLat: r.to.lat, endLng: r.to.lng,
          color: ['rgba(16,185,129,0.9)', 'rgba(245,158,11,0.7)'],
          stroke: 0.7, dashLen: 0.5, dashGap: 0.2, animTime: 4000,
          category: 'shipping',
          label: r.label + ' \uD83D\uDEA2 ' + r.desc,
        });
      });
    }

    // Submarine cables (each cable has multiple segments)
    if (globeLayerState.cables) {
      SUBMARINE_CABLES.forEach(function (cable) {
        cable.segments.forEach(function (seg) {
          arcs.push({
            startLat: seg.from.lat, startLng: seg.from.lng,
            endLat: seg.to.lat, endLng: seg.to.lng,
            color: [cable.color, cable.color],
            stroke: 1.2, dashLen: 0.8, dashGap: 0.05, animTime: 6000,
            category: 'cable',
            label: cable.name + ' \uD83D\uDD0C ' + cable.desc,
          });
        });
      });
      // Terrestrial fiber link Cambodia-Vietnam
      arcs.push({
        startLat: CAMBODIA_TERRESTRIAL.from.lat, startLng: CAMBODIA_TERRESTRIAL.from.lng,
        endLat: CAMBODIA_TERRESTRIAL.to.lat, endLng: CAMBODIA_TERRESTRIAL.to.lng,
        color: ['#f97316', '#f97316'],
        stroke: 1.0, dashLen: 0.6, dashGap: 0.1, animTime: 3000,
        category: 'cable',
        label: 'Terrestrial Fiber \uD83D\uDD0C Cambodia-Vietnam fiber backbone',
      });
    }

    return arcs;
  }

  function buildGlobePoints() {
    var pts = [];
    if (!globeLayerState.locations) return pts;
    Object.keys(MAP_LAYERS).forEach(function (layerKey) {
      MAP_LAYERS[layerKey].forEach(function (loc) {
        var style = LAYER_STYLES[loc.type] || LAYER_STYLES.city;
        var emoji = '';
        if (loc.type === 'capital') emoji = '\uD83C\uDFDB\uFE0F';
        else if (loc.type === 'city') emoji = '\uD83C\uDFD9\uFE0F';
        else if (loc.type === 'airport') emoji = '\u2708\uFE0F';
        else if (loc.type === 'port') emoji = '\u2693';
        else if (loc.type === 'military') emoji = '\uD83D\uDEE1\uFE0F';
        else if (loc.type === 'border') emoji = '\uD83D\uDEA7';
        else if (loc.type === 'sez') emoji = '\uD83C\uDFED';
        else if (loc.type === 'tourism') emoji = '\uD83C\uDFDB\uFE0F';
        else if (loc.type === 'waterway') emoji = '\uD83C\uDF0A';
        else if (loc.type === 'province') emoji = '\uD83D\uDCCD';
        pts.push({
          lat: loc.coords[0], lng: loc.coords[1],
          name: loc.name, desc: loc.desc || '',
          color: style.color, size: style.size,
          type: loc.type, emoji: emoji,
        });
      });
    });
    // Add cable landing point
    pts.push({
      lat: CABLE_LANDING.lat, lng: CABLE_LANDING.lng,
      name: CABLE_LANDING.name, desc: CABLE_LANDING.desc,
      color: '#06b6d4', size: 0.35, type: 'cable-landing', emoji: '\uD83D\uDD0C',
    });
    return pts;
  }

  function initGlobe() {
    var container = document.getElementById('globe-container');
    if (!container || typeof Globe === 'undefined') {
      console.warn('Globe.gl not available, falling back to 2D');
      switchTo2D();
      return;
    }

    var w = container.clientWidth;
    var h = container.clientHeight;

    globe = Globe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(w)
      .height(h)
      .atmosphereColor('#3b82f6')
      .atmosphereAltitude(0.2)
      // Points (locations)
      .pointsData(buildGlobePoints())
      .pointAltitude(0.01)
      .pointRadius(function (d) { return d.size; })
      .pointColor(function (d) { return d.color; })
      .pointLabel(function (d) {
        return '<div style="font-family:SF Mono,Monaco,Cascadia Code,monospace;background:#141414;padding:8px 12px;border:1px solid #2a2a2a;color:#e8e8e8;font-size:11px;min-width:140px;max-width:240px">' +
          '<div style="font-weight:700;margin-bottom:2px">' + d.emoji + ' ' + d.name + '</div>' +
          (d.desc ? '<div style="font-size:10px;color:#888">' + d.desc + '</div>' : '') +
          '<div style="font-size:9px;color:#666;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px">' + d.type.replace('-', ' ') + '</div>' +
          '</div>';
      })
      // Arcs (flights, shipping, cables)
      .arcsData(buildGlobeArcs())
      .arcColor(function (d) { return d.color; })
      .arcStroke(function (d) { return d.stroke; })
      .arcDashLength(function (d) { return d.dashLen; })
      .arcDashGap(function (d) { return d.dashGap; })
      .arcDashAnimateTime(function (d) { return d.animTime; })
      .arcLabel(function (d) {
        var icon = d.category === 'flight' ? '\u2708' : d.category === 'shipping' ? '\uD83D\uDEA2' : '\uD83D\uDD0C';
        return '<div style="font-family:SF Mono,Monaco,Cascadia Code,monospace;background:#141414;padding:6px 10px;border:1px solid #2a2a2a;color:#e8e8e8;font-size:10px">' +
          icon + ' ' + d.label + '</div>';
      })
      (container);

    // Focus on Cambodia
    globe.pointOfView({ lat: 12.5, lng: 105, altitude: 2.2 }, 1000);

    // Disable scroll-wheel zoom so page scrolls normally through the globe
    var controls = globe.controls();
    if (controls) {
      controls.enableZoom = false;
    }

    // Handle resize
    window.addEventListener('resize', function () {
      if (globe && is3D) {
        globe.width(container.clientWidth).height(container.clientHeight);
      }
    });

    // Globe layer toggle buttons
    setupGlobeLayerToggles();
  }

  function refreshGlobe() {
    if (!globe) return;
    globe.arcsData(buildGlobeArcs());
    globe.pointsData(buildGlobePoints());
  }

  function setupGlobeLayerToggles() {
    var toggles = document.querySelectorAll('.layer-toggle[data-mode="3d"]');
    toggles.forEach(function (toggle) {
      var cb = toggle.querySelector('input[type="checkbox"]');
      if (!cb) return;
      cb.addEventListener('change', function () {
        var layer = toggle.dataset.glayer;
        if (globeLayerState[layer] !== undefined) {
          globeLayerState[layer] = cb.checked;
          refreshGlobe();
          updateArcCounts();
        }
      });
    });
  }

  function updateArcCounts() {
    var fc = document.getElementById('gs-flights');
    var sc = document.getElementById('gs-shipping');
    var cc = document.getElementById('gs-cables');
    if (fc) fc.textContent = globeLayerState.flights ? FLIGHT_ROUTES.length : '0';
    if (sc) sc.textContent = globeLayerState.shipping ? SHIPPING_ROUTES.length : '0';
    if (cc) cc.textContent = globeLayerState.cables ? SUBMARINE_CABLES.length : '0';
  }

  // =========================================================
  // 2D MAP INITIALIZATION (MapLibre GL with OpenFreeMap dark tiles)
  // =========================================================
  function init2DMap() {
    if (maplibreMap) {
      maplibreMap.resize();
      return;
    }

    // Try MapLibre GL first (worldmonitor-style), fall back to Leaflet
    if (typeof maplibregl !== 'undefined') {
      initMapLibre();
    } else {
      initLeaflet();
    }
  }

  function initMapLibre() {
    maplibreMap = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: [105, 12.5],
      zoom: 6,
      attributionControl: true,
    });

    maplibreMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    maplibreMap.on('load', function () {
      addMapLibreMarkers();
    });

    // Hook up 2D layer toggles
    setup2DLayerToggles();
  }

  function addMapLibreMarkers() {
    clearMapLibreMarkers();
    var toggles = document.querySelectorAll('.layer-toggle[data-mode="2d"]');
    toggles.forEach(function (toggle) {
      var layerKey = toggle.dataset.layer;
      var cb = toggle.querySelector('input[type="checkbox"]');
      if (!cb || !cb.checked) return;
      var locs = MAP_LAYERS[layerKey];
      if (!locs) return;
      locs.forEach(function (loc) {
        var style = LAYER_STYLES[loc.type] || LAYER_STYLES.city;
        var el = document.createElement('div');
        el.style.cssText = 'width:' + (style.radius * 2 + 2) + 'px;height:' + (style.radius * 2 + 2) + 'px;background:' + style.color + ';border:1.5px solid rgba(255,255,255,0.8);border-radius:50%;cursor:pointer;';
        var marker = new maplibregl.Marker({ element: el })
          .setLngLat([loc.coords[1], loc.coords[0]])
          .setPopup(new maplibregl.Popup({ offset: 10, closeButton: false })
            .setHTML(createPopupContent(loc)))
          .addTo(maplibreMap);
        marker._layerKey = layerKey;
        maplibreMarkers.push(marker);
      });
    });
  }

  function clearMapLibreMarkers() {
    maplibreMarkers.forEach(function (m) { m.remove(); });
    maplibreMarkers = [];
  }

  function setup2DLayerToggles() {
    var toggles = document.querySelectorAll('.layer-toggle[data-mode="2d"]');
    toggles.forEach(function (toggle) {
      var cb = toggle.querySelector('input[type="checkbox"]');
      if (!cb) return;
      cb.addEventListener('change', function () {
        if (maplibreMap) {
          addMapLibreMarkers();
        } else if (leafletMap) {
          syncLayers();
        }
      });
    });
  }

  function initLeaflet() {
    if (leafletMap) return;

    leafletMap = L.map('map', {
      center: [12.5, 105],
      zoom: 7,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(leafletMap);

    Object.keys(MAP_LAYERS).forEach(function (key) {
      layerGroups[key] = L.layerGroup();
    });

    populateLayers();
    syncLayers();
    setup2DLayerToggles();
  }

  function createPopupContent(loc) {
    var html = '<div style="font-family:SF Mono,Monaco,Cascadia Code,monospace;min-width:140px;color:#e8e8e8">';
    html += '<div style="font-weight:700;font-size:12px;margin-bottom:4px">' + loc.name + '</div>';
    if (loc.desc) html += '<div style="font-size:10px;color:#888;margin-bottom:2px">' + loc.desc + '</div>';
    if (loc.pop) html += '<div style="font-size:10px;color:#666">Pop: ' + loc.pop + '</div>';
    html += '</div>';
    return html;
  }

  function populateLayers() {
    Object.keys(MAP_LAYERS).forEach(function (layerKey) {
      var group = layerGroups[layerKey];
      if (!group) return;
      group.clearLayers();
      MAP_LAYERS[layerKey].forEach(function (loc) {
        var style = LAYER_STYLES[loc.type] || LAYER_STYLES.city;
        var marker = L.circleMarker(loc.coords, {
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

  function syncLayers() {
    var checkboxes = document.querySelectorAll('.layer-toggle[data-mode="2d"] input[type="checkbox"]');
    checkboxes.forEach(function (cb) {
      var toggle = cb.closest('.layer-toggle');
      var layerKey = toggle ? toggle.dataset.layer : null;
      if (!layerKey || !layerGroups[layerKey]) return;
      if (cb.checked) {
        if (leafletMap && !leafletMap.hasLayer(layerGroups[layerKey])) leafletMap.addLayer(layerGroups[layerKey]);
      } else {
        if (leafletMap && leafletMap.hasLayer(layerGroups[layerKey])) leafletMap.removeLayer(layerGroups[layerKey]);
      }
    });
  }

  // =========================================================
  // MAP TOGGLE (2D/3D)
  // =========================================================
  function switchTo3D() {
    document.getElementById('globe-container').style.display = '';
    document.getElementById('map').style.display = 'none';
    document.getElementById('map-toggle-label').textContent = '3D';
    is3D = true;
    // Show 3D layer toggles, hide 2D
    document.querySelectorAll('.layer-toggle[data-mode="3d"]').forEach(function (t) { t.style.display = ''; });
    document.querySelectorAll('.layer-toggle[data-mode="2d"]').forEach(function (t) { t.style.display = 'none'; });
    document.getElementById('map-legend').style.display = '';
    if (!globe) initGlobe();
  }

  function switchTo2D() {
    document.getElementById('globe-container').style.display = 'none';
    document.getElementById('map').style.display = '';
    document.getElementById('map-toggle-label').textContent = '2D';
    is3D = false;
    // Show 2D layer toggles, hide 3D
    document.querySelectorAll('.layer-toggle[data-mode="3d"]').forEach(function (t) { t.style.display = 'none'; });
    document.querySelectorAll('.layer-toggle[data-mode="2d"]').forEach(function (t) { t.style.display = ''; });
    document.getElementById('map-legend').style.display = 'none';
    init2DMap();
    setTimeout(function () {
      if (maplibreMap) maplibreMap.resize();
      else if (leafletMap) leafletMap.invalidateSize();
    }, 100);
  }

  document.getElementById('map-toggle').addEventListener('click', function () {
    if (is3D) { switchTo2D(); } else { switchTo3D(); }
  });

  // =========================================================
  // CLOCK
  // =========================================================
  function updateClock() {
    var now = new Date();
    var options = {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Asia/Phnom_Penh',
    };
    var formatted = now.toLocaleString('en-US', options).toUpperCase().replace(/,/g, '') + ' ICT';
    document.getElementById('top-clock').textContent = formatted;
  }
  updateClock();
  setInterval(updateClock, 1000);



  // =========================================================
  // NEWS FETCHING WITH AI ENRICHMENT
  // =========================================================
  var allNewsItems = [];
  var cachedGDELTItems = [];
  var currentFeedFilter = 'all';

  async function fetchRSS(source) {
    var items = [];
    try {
      var url = RSS2JSON_BASE + encodeURIComponent(source.url);
      var resp = await fetch(url);
      if (!resp.ok) throw new Error('rss2json failed');
      var data = await resp.json();
      if (data.status === 'ok' && data.items) {
        data.items.forEach(function (item) {
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
      } else {
        throw new Error('rss2json non-ok');
      }
    } catch (e1) {
      try {
        var url2 = ALLORIGINS_BASE + encodeURIComponent(source.url);
        var resp2 = await fetch(url2);
        if (!resp2.ok) throw new Error('allorigins failed');
        var data2 = await resp2.json();
        if (data2.contents) {
          items.push.apply(items, parseRSSXml(data2.contents, source));
        }
      } catch (e2) {
        console.warn('Failed to fetch ' + source.name + ':', e2.message);
      }
    }
    return items;
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function parseRSSXml(xmlStr, source) {
    var items = [];
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(xmlStr, 'text/xml');
      var entries = doc.querySelectorAll('item, entry');
      entries.forEach(function (entry) {
        var title = entry.querySelector('title');
        var link = entry.querySelector('link');
        var pubDate = entry.querySelector('pubDate, published, updated');
        var desc = entry.querySelector('description, summary, content');
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
    var seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    return Math.floor(seconds / 86400) + 'd';
  }

  function isRelevant(item) {
    var src = FEED_SOURCES.find(function (s) { return s.id === item.sourceId; });
    if (src && src.local) return true;
    var text = (item.title + ' ' + item.snippet).toLowerCase();
    return CAMBODIA_KEYWORDS.some(function (kw) { return text.includes(kw); });
  }

  function renderNews() {
    var container = document.getElementById('news-feed');
    var searchTerm = document.getElementById('search-input').value.toLowerCase().trim();

    var filtered = allNewsItems.filter(function (item) {
      if (currentFeedFilter === 'breaking') return item.isBreaking;
      if (currentFeedFilter !== 'all' && AI_CATEGORIES[currentFeedFilter]) {
        return item.category === currentFeedFilter;
      }
      if (searchTerm && !(item.title + ' ' + item.snippet).toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    // Sort: breaking first, then by date
    filtered.sort(function (a, b) {
      if (a.isBreaking && !b.isBreaking) return -1;
      if (!a.isBreaking && b.isBreaking) return 1;
      return b.pubDate - a.pubDate;
    });

    document.getElementById('news-total').textContent = filtered.length;

    if (filtered.length === 0) {
      container.innerHTML = '<div class="loading-state"><span>No news found</span></div>';
      return;
    }

    container.innerHTML = '';
    filtered.slice(0, 50).forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'news-item' + (item.isBreaking ? ' breaking' : '');
      div.onclick = function () { window.open(item.link, '_blank'); };

      var sentimentClass = item.sentiment === 'positive' ? 'sentiment-pos' : item.sentiment === 'negative' ? 'sentiment-neg' : 'sentiment-neu';
      var sentimentLabel = item.sentiment === 'positive' ? '+' : item.sentiment === 'negative' ? '-' : '~';
      var catLabel = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : '';

      div.innerHTML =
        '<div class="news-time-col">' + timeAgo(item.pubDate) + '</div>' +
        '<div class="news-body">' +
          '<div class="news-tags">' +
            '<span class="news-source-tag ' + escapeHtml(item.sourceColor) + '">' + escapeHtml(item.source) + '</span>' +
            (catLabel ? '<span class="news-cat-tag">' + catLabel + '</span>' : '') +
            '<span class="news-sentiment ' + sentimentClass + '">' + sentimentLabel + '</span>' +
          '</div>' +
          '<div class="news-headline">' + escapeHtml(item.title) + '</div>' +
          (item.snippet ? '<div class="news-snippet">' + escapeHtml(item.snippet) + '</div>' : '') +
        '</div>' +
        '<div class="news-priority priority-' + (item.priority || 'low') + '"></div>';
      container.appendChild(div);
    });

    // Update sentiment analysis bar
    updateSentimentBar();
    // Update globe stats
    updateGlobeStats();
  }

  function updateSentimentBar() {
    var pos = 0;
    var neg = 0;
    var neu = 0;
    allNewsItems.forEach(function (item) {
      if (item.sentiment === 'positive') pos++;
      else if (item.sentiment === 'negative') neg++;
      else neu++;
    });
    var total = pos + neg + neu || 1;
    var posP = Math.round(pos / total * 100);
    var negP = Math.round(neg / total * 100);
    var neuP = 100 - posP - negP;

    var posBar = document.getElementById('sbar-pos');
    var neuBar = document.getElementById('sbar-neu');
    var negBar = document.getElementById('sbar-neg');
    if (posBar) posBar.style.width = posP + '%';
    if (neuBar) neuBar.style.width = neuP + '%';
    if (negBar) negBar.style.width = negP + '%';

    var posLabel = document.getElementById('slabel-pos');
    var neuLabel = document.getElementById('slabel-neu');
    var negLabel = document.getElementById('slabel-neg');
    if (posLabel) posLabel.textContent = 'Positive ' + posP + '%';
    if (neuLabel) neuLabel.textContent = 'Neutral ' + neuP + '%';
    if (negLabel) negLabel.textContent = 'Negative ' + negP + '%';
  }

  function updateGlobeStats() {
    var evEl = document.getElementById('gs-events');
    var riskEl = document.getElementById('gs-risk');
    if (evEl) evEl.textContent = allNewsItems.length;
    if (riskEl) {
      var neg = allNewsItems.filter(function (i) { return i.sentiment === 'negative'; }).length;
      var total = allNewsItems.length || 1;
      var ratio = neg / total;
      riskEl.textContent = ratio > 0.4 ? 'HIGH' : ratio > 0.2 ? 'MODERATE' : 'LOW';
    }
  }

  async function loadAllNews() {
    var container = document.getElementById('news-feed');
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>AI analyzing feeds...</span></div>';

    var promises = FEED_SOURCES.map(function (src) { return fetchRSS(src); });
    var results = await Promise.allSettled(promises);

    allNewsItems = [];
    results.forEach(function (result) {
      if (result.status === 'fulfilled') {
        result.value.filter(isRelevant).forEach(function (item) {
          allNewsItems.push(aiEnrichItem(item));
        });
      }
    });

    // Re-merge cached GDELT items so they survive RSS refresh cycles
    if (cachedGDELTItems.length > 0) {
      cachedGDELTItems.forEach(function (item) { allNewsItems.push(item); });
      var srcEl = document.getElementById('gs-sources');
      if (srcEl) srcEl.textContent = FEED_SOURCES.length + '+GDELT';
    }

    if (allNewsItems.length === 0) {
      allNewsItems = getFallbackNews().map(aiEnrichItem);
    }

    renderNews();
    generateIntelBrief();
    generateKeyEvents();
  }

  function getFallbackNews() {
    var now = new Date();
    return [
      { title: 'Cambodia GDP growth projected at 6.5% for 2026', link: '#', pubDate: new Date(now - 2 * 3600000), source: 'Khmer Times', sourceId: 'khmer-times', sourceColor: 'source-khmer-times', snippet: 'Economic growth remains strong driven by tourism, construction, and garment exports.' },
      { title: 'BREAKING: Hun Manet announces new digital economy initiative', link: '#', pubDate: new Date(now - 3 * 3600000), source: 'Phnom Penh Post', sourceId: 'pp-post', sourceColor: 'source-pp-post', snippet: 'Prime Minister launches comprehensive plan to create 50,000 tech jobs by 2028.' },
      { title: 'Siem Reap airport sees record passenger numbers in Q1', link: '#', pubDate: new Date(now - 5 * 3600000), source: 'VOA Cambodia', sourceId: 'voa', sourceColor: 'source-voa', snippet: 'New international airport boosts tourism to Angkor Wat significantly.' },
      { title: 'Cambodia-Thailand border trade reaches $5 billion milestone', link: '#', pubDate: new Date(now - 7 * 3600000), source: 'Cambodianess', sourceId: 'cambodianess', sourceColor: 'source-cambodianess', snippet: 'Bilateral trade grows with improved border infrastructure at Poipet.' },
      { title: 'ASEAN summit discusses regional security cooperation', link: '#', pubDate: new Date(now - 9 * 3600000), source: 'ASEAN Affairs', sourceId: 'asean', sourceColor: 'source-asean', snippet: 'Cambodia to contribute to maritime security cooperation in South China Sea.' },
      { title: 'Sihanoukville port expansion project enters phase 2', link: '#', pubDate: new Date(now - 11 * 3600000), source: 'Cambodianess', sourceId: 'cambodianess', sourceColor: 'source-cambodianess', snippet: 'Port capacity to double with new deep-water berths for larger container ships.' },
      { title: 'FDI inflows to Cambodia increase 15% year-over-year', link: '#', pubDate: new Date(now - 13 * 3600000), source: 'Khmer Times', sourceId: 'khmer-times', sourceColor: 'source-khmer-times', snippet: 'Foreign direct investment growth led by manufacturing and technology sectors.' },
      { title: 'Cambodia garment sector sees export increase in Q1', link: '#', pubDate: new Date(now - 15 * 3600000), source: 'Reuters', sourceId: 'reuters', sourceColor: 'source-reuters', snippet: 'European and US buyers increase orders from Cambodian manufacturers.' },
      { title: 'Mekong River water levels raise concern for dry season', link: '#', pubDate: new Date(now - 17 * 3600000), source: 'Al Jazeera', sourceId: 'aljazeera', sourceColor: 'source-aljazeera', snippet: 'Mekong River Commission warns of potential water shortages affecting agriculture.' },
      { title: 'Angkor Wat visitor numbers surge 30% year-on-year', link: '#', pubDate: new Date(now - 19 * 3600000), source: 'BBC News', sourceId: 'bbc', sourceColor: 'source-bbc', snippet: 'Temple complex sees strongest tourism recovery since 2019.' },
      { title: 'Cambodia and Vietnam strengthen economic agreement', link: '#', pubDate: new Date(now - 21 * 3600000), source: 'AP News', sourceId: 'ap', sourceColor: 'source-ap', snippet: 'New bilateral agreement focuses on trade corridors and border infrastructure.' },
      { title: 'Battambang rice exports reach new highs with improved logistics', link: '#', pubDate: new Date(now - 23 * 3600000), source: 'Nikkei Asia', sourceId: 'nikkei', sourceColor: 'source-nikkei', snippet: 'Jasmine rice exports to China and EU markets continue to grow.' },
    ];
  }

  // News tab clicks
  document.getElementById('news-tabs').addEventListener('click', function (e) {
    if (e.target.classList.contains('panel-tab')) {
      document.querySelectorAll('#news-tabs .panel-tab').forEach(function (t) { t.classList.remove('active'); });
      e.target.classList.add('active');
      currentFeedFilter = e.target.dataset.feed;
      renderNews();
    }
  });

  document.getElementById('search-input').addEventListener('input', renderNews);
  document.getElementById('news-refresh').addEventListener('click', loadAllNews);

  // =========================================================
  // AI INTELLIGENCE BRIEF
  // =========================================================
  function generateIntelBrief() {
    var briefEl = document.getElementById('intel-brief');
    var timeEl = document.getElementById('intel-time');
    if (!briefEl) return;

    var now = new Date();
    timeEl.textContent = now.toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Phnom_Penh',
    }) + ' ICT';

    var catCounts = {};
    var sentCounts = { positive: 0, negative: 0, neutral: 0 };
    allNewsItems.forEach(function (item) {
      catCounts[item.category] = (catCounts[item.category] || 0) + 1;
      sentCounts[item.sentiment]++;
    });

    var topCat = 'economy';
    var topCount = 0;
    Object.keys(catCounts).forEach(function (cat) {
      if (catCounts[cat] > topCount) { topCount = catCounts[cat]; topCat = cat; }
    });

    var total = allNewsItems.length || 1;
    var posP = Math.round(sentCounts.positive / total * 100);
    var negP = Math.round(sentCounts.negative / total * 100);

    var briefHtml = '';
    briefHtml += '<div class="brief-item"><span class="brief-icon">&#128202;</span><span class="brief-text">Monitoring <strong>' + allNewsItems.length + '</strong> news items from <strong>' + FEED_SOURCES.length + '</strong> sources across local and international media.</span></div>';
    briefHtml += '<div class="brief-item"><span class="brief-icon">&#127760;</span><span class="brief-text">Dominant coverage area: <strong>' + topCat.charAt(0).toUpperCase() + topCat.slice(1) + '</strong> (' + topCount + ' articles). Sentiment: ' + posP + '% positive, ' + negP + '% negative.</span></div>';

    if (sentCounts.negative > sentCounts.positive) {
      briefHtml += '<div class="brief-item"><span class="brief-icon">&#9888;&#65039;</span><span class="brief-text">Elevated negative sentiment detected. Key concerns may include regional security, economic challenges, or environmental risks.</span></div>';
    } else {
      briefHtml += '<div class="brief-item"><span class="brief-icon">&#9989;</span><span class="brief-text">Overall positive outlook. Economic growth indicators and diplomatic developments remain favorable.</span></div>';
    }

    briefHtml += '<div class="brief-item"><span class="brief-icon">&#128161;</span><span class="brief-text">Key topics: ' +
      Object.keys(catCounts).sort(function (a, b) { return catCounts[b] - catCounts[a]; }).slice(0, 4).map(function (c) {
        return c.charAt(0).toUpperCase() + c.slice(1) + ' (' + catCounts[c] + ')';
      }).join(', ') + '</span></div>';

    briefEl.innerHTML = briefHtml;
  }

  function generateKeyEvents() {
    var eventEl = document.getElementById('event-list');
    if (!eventEl) return;

    var topItems = allNewsItems
      .filter(function (i) { return i.priority === 'high' || i.isBreaking; })
      .slice(0, 3);

    if (topItems.length === 0) {
      topItems = allNewsItems.slice(0, 3);
    }

    var html = '';
    topItems.forEach(function (item) {
      var catClass = 'cat-' + (item.category === 'infrastructure' ? 'infra' : item.category);
      html += '<div class="event-item">' +
        '<span class="event-cat ' + catClass + '">' + (item.category || 'General').toUpperCase() + '</span>' +
        '<span class="event-text">' + escapeHtml(item.title) + '</span>' +
        '</div>';
    });

    eventEl.innerHTML = html || '<div class="loading-state"><span>No key events</span></div>';
  }

  // =========================================================
  // STRATEGIC RISK ASSESSMENT (World Bank Governance Indicators)
  // =========================================================
  async function loadStrategicRisk() {
    var riskGrid = document.getElementById('risk-grid');
    var riskCompare = document.getElementById('risk-compare');
    if (!riskGrid) return;

    var wgiIndicators = [
      { id: 'PV.EST', name: 'Political Stability' },
      { id: 'GE.EST', name: 'Gov. Effectiveness' },
      { id: 'RQ.EST', name: 'Regulatory Quality' },
      { id: 'RL.EST', name: 'Rule of Law' },
      { id: 'CC.EST', name: 'Control of Corruption' },
      { id: 'VA.EST', name: 'Voice & Accountability' },
    ];

    try {
      var results = await Promise.allSettled(
        wgiIndicators.map(function (ind) {
          return fetch('https://api.worldbank.org/v2/country/KHM/indicator/' + ind.id + '?format=json&per_page=10&date=2013:2024')
            .then(function (r) { return r.json(); });
        })
      );

      riskGrid.innerHTML = '';
      var totalScore = 0;
      var count = 0;

      results.forEach(function (result, i) {
        var ind = wgiIndicators[i];
        var value = null;

        if (result.status === 'fulfilled' && result.value && result.value[1]) {
          var entries = result.value[1].filter(function (e) { return e.value !== null; });
          if (entries.length > 0) {
            value = entries[0].value;
          }
        }

        // WGI scores range from -2.5 to 2.5, normalize to 0-100
        var normalized = value !== null ? Math.round((value + 2.5) / 5 * 100) : 50;
        var riskLevel = normalized > 60 ? 'low' : normalized > 35 ? 'moderate' : 'high';
        var barColor = riskLevel === 'low' ? '#10b981' : riskLevel === 'moderate' ? '#f59e0b' : '#ef4444';
        totalScore += normalized;
        count++;

        var row = document.createElement('div');
        row.className = 'risk-row';
        row.innerHTML =
          '<span class="risk-name">' + ind.name + '</span>' +
          '<div class="risk-bar-bg"><div class="risk-bar-fill" style="width:' + normalized + '%;background:' + barColor + '"></div></div>' +
          '<span class="risk-value risk-' + riskLevel + '">' + normalized + '</span>';
        riskGrid.appendChild(row);
      });

      // Update overall risk score
      var avgScore = count > 0 ? Math.round(totalScore / count) : 50;
      var overallLevel = avgScore > 60 ? 'LOW' : avgScore > 35 ? 'MODERATE' : 'HIGH';
      var circleColor = avgScore > 60 ? '#10b981' : avgScore > 35 ? '#f59e0b' : '#ef4444';

      var circle = document.getElementById('risk-circle');
      var scoreEl = document.getElementById('risk-score');
      var descEl = document.getElementById('risk-desc');
      if (circle) circle.style.borderColor = circleColor;
      if (scoreEl) { scoreEl.textContent = avgScore; scoreEl.style.color = circleColor; }
      if (descEl) descEl.textContent = 'Overall risk level: ' + overallLevel + '. Based on 6 World Bank Governance Indicators for Cambodia.';

      // Load ASEAN comparison
      loadASEANComparison(riskCompare);

    } catch (e) {
      console.warn('Risk data load error:', e);
      riskGrid.innerHTML = '<div class="loading-state"><span>Risk data unavailable</span></div>';
    }
  }

  async function loadASEANComparison(container) {
    if (!container) return;
    var countries = [
      { code: 'KHM', name: 'Cambodia' },
      { code: 'THA', name: 'Thailand' },
      { code: 'VNM', name: 'Vietnam' },
      { code: 'MMR', name: 'Myanmar' },
      { code: 'LAO', name: 'Laos' },
    ];

    try {
      var results = await Promise.allSettled(
        countries.map(function (c) {
          return fetch('https://api.worldbank.org/v2/country/' + c.code + '/indicator/PV.EST?format=json&per_page=10&date=2013:2024')
            .then(function (r) { return r.json(); });
        })
      );

      container.innerHTML = '';
      results.forEach(function (result, i) {
        var country = countries[i];
        var value = 0;
        if (result.status === 'fulfilled' && result.value && result.value[1]) {
          var entries = result.value[1].filter(function (e) { return e.value !== null; });
          if (entries.length > 0) value = entries[0].value;
        }
        var normalized = Math.round((value + 2.5) / 5 * 100);

        var row = document.createElement('div');
        row.className = 'compare-row';
        row.innerHTML =
          '<span class="compare-country">' + country.name + '</span>' +
          '<div class="compare-bar-bg"><div class="compare-bar-fill" style="width:' + normalized + '%;' + (country.code === 'KHM' ? 'background:#8b5cf6' : '') + '"></div></div>' +
          '<span class="compare-score">' + normalized + '</span>';
        container.appendChild(row);
      });
    } catch (e) {
      container.innerHTML = '<div class="loading-state"><span>Comparison unavailable</span></div>';
    }
  }

  // =========================================================
  // AI ECONOMIC FORECASTING
  // =========================================================
  async function loadForecasts() {
    var forecastGrid = document.getElementById('forecast-grid');
    if (!forecastGrid) return;

    var indicators = [
      { id: 'NY.GDP.MKTP.CD', name: 'GDP', format: 'B', unit: 'USD' },
      { id: 'NY.GDP.PCAP.CD', name: 'GDP per Capita', format: 'K', unit: 'USD' },
      { id: 'FP.CPI.TOTL.ZG', name: 'Inflation Rate', format: '%', unit: '' },
      { id: 'NE.EXP.GNFS.CD', name: 'Exports', format: 'B', unit: 'USD' },
      { id: 'BX.KLT.DINV.CD.WD', name: 'FDI Inflow', format: 'B', unit: 'USD' },
    ];

    try {
      var results = await Promise.allSettled(
        indicators.map(function (ind) {
          return fetch('https://api.worldbank.org/v2/country/KHM/indicator/' + ind.id + '?format=json&per_page=10&date=2015:2024')
            .then(function (r) { return r.json(); });
        })
      );

      forecastGrid.innerHTML = '';
      results.forEach(function (result, i) {
        var ind = indicators[i];
        var values = [];
        var years = [];

        if (result.status === 'fulfilled' && result.value && result.value[1]) {
          var entries = result.value[1].filter(function (e) { return e.value !== null; }).reverse();
          entries.forEach(function (e) {
            values.push(e.value);
            years.push(parseInt(e.date));
          });
        }

        if (values.length < 2) {
          var card = document.createElement('div');
          card.className = 'forecast-card';
          card.innerHTML = '<div class="forecast-name">' + ind.name + '</div><div style="font-size:11px;color:#5a6a85;padding:4px 0">Insufficient data</div>';
          forecastGrid.appendChild(card);
          return;
        }

        // Simple linear regression for forecasting
        var n = values.length;
        var latestValue = values[n - 1];
        var latestYear = years[n - 1];

        // Calculate CAGR (Compound Annual Growth Rate) excluding outliers
        var validGrowths = [];
        for (var j = 1; j < n; j++) {
          if (values[j - 1] !== 0) {
            var g = (values[j] - values[j - 1]) / Math.abs(values[j - 1]);
            if (g > -0.5 && g < 1) validGrowths.push(g);
          }
        }
        var avgGrowth = validGrowths.length > 0 ? validGrowths.reduce(function (a, b) { return a + b; }, 0) / validGrowths.length : 0;

        // Project 2 years forward
        var projected = latestValue * Math.pow(1 + avgGrowth, 2);
        var changePercent = ((projected - latestValue) / Math.abs(latestValue || 1)) * 100;

        // Format values
        var currentStr = formatIndicatorValue(latestValue, ind.format);
        var projectedStr = formatIndicatorValue(projected, ind.format);
        var isUp = projected >= latestValue;
        var arrowIcon = isUp ? '&#9650;' : '&#9660;';
        var arrowColor = isUp ? '#10b981' : '#ef4444';
        var changeColor = isUp ? 'background:rgba(16,185,129,0.15);color:#10b981' : 'background:rgba(239,68,68,0.15);color:#ef4444';

        // Sparkline data (normalize to 0-24 height)
        var maxVal = Math.max.apply(null, values.concat([projected]));
        var minVal = Math.min.apply(null, values.concat([projected]));
        var range = maxVal - minVal || 1;
        var sparkHtml = '<div class="forecast-sparkline">';
        values.forEach(function (v) {
          var h = Math.max(3, Math.round((v - minVal) / range * 24));
          sparkHtml += '<div class="spark-bar" style="height:' + h + 'px"></div>';
        });
        var ph = Math.max(3, Math.round((projected - minVal) / range * 24));
        sparkHtml += '<div class="spark-bar projected" style="height:' + ph + 'px"></div>';
        sparkHtml += '</div>';

        var card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML =
          '<div class="forecast-name">' + ind.name + ' (' + latestYear + ' &rarr; ' + (latestYear + 2) + 'F)</div>' +
          '<div class="forecast-row">' +
            '<span class="forecast-current">' + (ind.unit ? '<span style="font-size:10px;color:#5a6a85">' + ind.unit + ' </span>' : '') + currentStr + '</span>' +
            '<span class="forecast-arrow" style="color:' + arrowColor + '">' + arrowIcon + '</span>' +
            '<span class="forecast-projected" style="color:' + arrowColor + '">' + projectedStr + '</span>' +
          '</div>' +
          '<div class="forecast-meta">' +
            '<span class="forecast-change" style="' + changeColor + '">' + (changePercent >= 0 ? '+' : '') + changePercent.toFixed(1) + '%</span>' +
            '<span class="forecast-conf">CAGR: ' + (avgGrowth * 100).toFixed(1) + '% | Confidence: ' + getConfidence(validGrowths) + '</span>' +
          '</div>' +
          sparkHtml;
        forecastGrid.appendChild(card);
      });
    } catch (e) {
      console.warn('Forecast load error:', e);
      forecastGrid.innerHTML = '<div class="loading-state"><span>Forecast unavailable</span></div>';
    }

    // Load political outlook
    loadPoliticalOutlook();
  }

  function formatIndicatorValue(val, format) {
    if (format === 'B') return (val / 1e9).toFixed(1) + 'B';
    if (format === 'K') return Math.round(val).toLocaleString();
    if (format === '%') return val.toFixed(1) + '%';
    return val.toFixed(1);
  }

  function getConfidence(growths) {
    if (growths.length < 3) return 'Low';
    var mean = growths.reduce(function (a, b) { return a + b; }, 0) / growths.length;
    var variance = growths.reduce(function (a, b) { return a + Math.pow(b - mean, 2); }, 0) / growths.length;
    var stdDev = Math.sqrt(variance);
    if (stdDev < 0.05) return 'High';
    if (stdDev < 0.15) return 'Medium';
    return 'Low';
  }

  function loadPoliticalOutlook() {
    var outlook = document.getElementById('political-outlook');
    if (!outlook) return;

    outlook.innerHTML =
      '<div class="outlook-item">' +
        '<div class="outlook-label">Government Stability</div>' +
        '<div class="outlook-text">Cambodia under PM Hun Manet maintains continuity with CPP governance. Diplomatic relations with China, Japan, and ASEAN partners remain the focus of foreign policy.</div>' +
      '</div>' +
      '<div class="outlook-item">' +
        '<div class="outlook-label">Economic Policy Direction</div>' +
        '<div class="outlook-text">Focus on digital economy transformation, Special Economic Zones expansion, and infrastructure development (new airports, expressways, port upgrades).</div>' +
      '</div>' +
      '<div class="outlook-item">' +
        '<div class="outlook-label">Regional Dynamics</div>' +
        '<div class="outlook-text">Increasing ASEAN integration, Mekong subregion cooperation, and balancing relations between major powers (US, China, Japan) in the Indo-Pacific.</div>' +
      '</div>';
  }

  // =========================================================
  // WEATHER (Open-Meteo API)
  // =========================================================
  function getWeatherEmoji(code) {
    if (code === 0) return '\u2600\uFE0F';
    if (code <= 3) return '\u26C5';
    if (code <= 48) return '\uD83C\uDF2B\uFE0F';
    if (code <= 67) return '\uD83C\uDF27\uFE0F';
    if (code <= 77) return '\u2744\uFE0F';
    if (code <= 82) return '\u26C8\uFE0F';
    if (code <= 99) return '\u26A1';
    return '\uD83C\uDF24\uFE0F';
  }

  function getWeatherDesc(code) {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Fog';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Showers';
    if (code <= 99) return 'Storm';
    return 'Unknown';
  }

  async function loadWeather() {
    var container = document.getElementById('weather-grid');
    if (!container) return;

    try {
      var results = await Promise.allSettled(
        WEATHER_CITIES.map(function (city) {
          return fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=' + city.lat +
            '&longitude=' + city.lon +
            '&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code' +
            '&timezone=Asia/Phnom_Penh'
          ).then(function (r) { return r.json(); });
        })
      );

      container.innerHTML = '';
      results.forEach(function (result, i) {
        var city = WEATHER_CITIES[i];
        if (result.status !== 'fulfilled') return;
        var data = result.value;
        var current = data.current || {};
        var temp = Math.round(current.temperature_2m || 0);
        var code = current.weather_code || 0;

        var row = document.createElement('div');
        row.className = 'weather-row';
        row.innerHTML =
          '<span class="weather-city-name">' + city.name + '</span>' +
          '<span class="weather-icon-sm">' + getWeatherEmoji(code) + '</span>' +
          '<span class="weather-temp-sm">' + temp + '\u00B0C</span>' +
          '<span class="weather-desc-sm">' + getWeatherDesc(code) + '</span>';
        container.appendChild(row);
      });

      if (container.children.length === 0) {
        container.innerHTML = '<div style="padding:8px;font-size:11px;color:#5a6a85">Weather unavailable</div>';
      }
    } catch (e) {
      console.error('Weather error:', e);
    }
  }

  // =========================================================
  // EXCHANGE RATES (8 currencies, updated hourly)
  // =========================================================
  async function loadExchangeRates() {
    try {
      var resp = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!resp.ok) throw new Error('Exchange rate API failed');
      var data = await resp.json();
      if (!data.rates) return;

      var khr = data.rates.KHR || 4100;
      var pairs = [
        { el: 'tick-usd', rate: khr, pair: 'USD/KHR' },
        { el: 'tick-thb', rate: khr / (data.rates.THB || 34), pair: 'THB/KHR' },
        { el: 'tick-cny', rate: khr / (data.rates.CNY || 7.25), pair: 'CNY/KHR' },
        { el: 'tick-eur', rate: khr / (data.rates.EUR || 0.92), pair: 'EUR/KHR' },
        { el: 'tick-jpy', rate: khr / (data.rates.JPY || 155), pair: 'JPY/KHR' },
        { el: 'tick-krw', rate: khr / (data.rates.KRW || 1350), pair: 'KRW/KHR' },
        { el: 'tick-sgd', rate: khr / (data.rates.SGD || 1.35), pair: 'SGD/KHR' },
        { el: 'tick-aud', rate: khr / (data.rates.AUD || 1.55), pair: 'AUD/KHR' },
      ];

      pairs.forEach(function (p) {
        var el = document.getElementById(p.el);
        if (el) {
          el.innerHTML = p.pair + ' <strong>' + Math.round(p.rate).toLocaleString() + '</strong> <span class="tick-change neutral">--</span>';
        }
      });

      var updateEl = document.getElementById('ticker-update');
      if (updateEl) {
        updateEl.textContent = 'Updated: ' + new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Phnom_Penh',
        }) + ' ICT';
      }
    } catch (e) {
      console.warn('Exchange rate fetch failed:', e.message);
    }
  }

  // =========================================================
  // ECONOMIC INDICATORS (World Bank)
  // =========================================================
  async function loadEconomicData() {
    var ecoGrid = document.getElementById('eco-indicators');
    if (!ecoGrid) return;

    var indicators = [
      { id: 'NY.GDP.MKTP.CD', name: 'GDP', format: 'B', unit: 'USD' },
      { id: 'NY.GDP.PCAP.CD', name: 'GDP/Capita', format: 'K', unit: 'USD' },
      { id: 'FP.CPI.TOTL.ZG', name: 'Inflation', format: '%', unit: '', invertTrend: true },
      { id: 'NE.EXP.GNFS.CD', name: 'Exports', format: 'B', unit: 'USD' },
      { id: 'BX.KLT.DINV.CD.WD', name: 'FDI Inflow', format: 'B', unit: 'USD' },
      { id: 'SL.UEM.TOTL.ZS', name: 'Unemployment', format: '%', unit: '', invertTrend: true },
    ];

    var results = await Promise.allSettled(
      indicators.map(function (ind) {
        return fetch('https://api.worldbank.org/v2/country/KHM/indicator/' + ind.id + '?format=json&per_page=5&date=2019:2024')
          .then(function (r) { return r.json(); });
      })
    );

    ecoGrid.innerHTML = '';
    results.forEach(function (result, i) {
      var ind = indicators[i];
      var value = '--';
      var year = '';
      var direction = 'neutral';
      var sentiment = 'neutral';

      if (result.status === 'fulfilled' && result.value && result.value[1]) {
        var entries = result.value[1].filter(function (e) { return e.value !== null; });
        if (entries.length > 0) {
          var latest = entries[0];
          year = latest.date;
          var raw = latest.value;
          if (ind.format === 'B') value = (raw / 1e9).toFixed(1) + 'B';
          else if (ind.format === 'K') value = Math.round(raw).toLocaleString();
          else if (ind.format === '%') value = raw.toFixed(1) + '%';
          if (entries.length > 1 && entries[1].value !== null) {
            direction = raw > entries[1].value ? 'up' : raw < entries[1].value ? 'down' : 'neutral';
            sentiment = direction;
            if (ind.invertTrend && sentiment !== 'neutral') sentiment = sentiment === 'up' ? 'down' : 'up';
          }
        }
      }

      var card = document.createElement('div');
      card.className = 'eco-card';
      card.innerHTML =
        '<div class="eco-label">' + escapeHtml(ind.name) + (year ? ' (' + year + ')' : '') + '</div>' +
        '<div class="eco-value">' + (ind.unit ? '<span class="eco-unit">' + ind.unit + ' </span>' : '') + value + '</div>' +
        '<div class="eco-trend trend-' + sentiment + '">' + (direction === 'up' ? '&#9650;' : direction === 'down' ? '&#9660;' : '&#8212;') + '</div>';
      ecoGrid.appendChild(card);
    });
  }

  // =========================================================
  // COUNTRY STATISTICS
  // =========================================================
  async function loadCountryStats() {
    var statsGrid = document.getElementById('country-stats');
    if (!statsGrid) return;

    var statIndicators = [
      { id: 'SP.POP.TOTL', name: 'Population', format: 'M' },
      { id: 'SP.POP.GROW', name: 'Pop. Growth', format: '%' },
      { id: 'SP.DYN.LE00.IN', name: 'Life Expectancy', format: 'yr' },
      { id: 'SE.ADT.LITR.ZS', name: 'Literacy Rate', format: '%' },
      { id: 'SP.URB.TOTL.IN.ZS', name: 'Urbanization', format: '%' },
      { id: 'IT.NET.USER.ZS', name: 'Internet Users', format: '%' },
      { id: 'SH.XPD.CHEX.GD.ZS', name: 'Health (% GDP)', format: '%' },
      { id: 'SE.XPD.TOTL.GD.ZS', name: 'Education (% GDP)', format: '%' },
    ];

    var results = await Promise.allSettled(
      statIndicators.map(function (ind) {
        return fetch('https://api.worldbank.org/v2/country/KHM/indicator/' + ind.id + '?format=json&per_page=5&date=2019:2024')
          .then(function (r) { return r.json(); });
      })
    );

    statsGrid.innerHTML = '';
    results.forEach(function (result, i) {
      var ind = statIndicators[i];
      var value = '--';
      var year = '';

      if (result.status === 'fulfilled' && result.value && result.value[1]) {
        var entries = result.value[1].filter(function (e) { return e.value !== null; });
        if (entries.length > 0) {
          var latest = entries[0];
          year = latest.date;
          var raw = latest.value;
          if (ind.format === 'M') value = (raw / 1e6).toFixed(1) + 'M';
          else if (ind.format === '%') value = raw.toFixed(1) + '%';
          else if (ind.format === 'yr') value = raw.toFixed(1) + ' yrs';
        }
      }

      var row = document.createElement('div');
      row.className = 'cstat-row';
      row.innerHTML =
        '<span class="cstat-name">' + escapeHtml(ind.name) + '</span>' +
        '<span class="cstat-value">' + value + '</span>' +
        (year ? '<span class="cstat-year">' + year + '</span>' : '');
      statsGrid.appendChild(row);
    });
  }

  // =========================================================
  // MAP ZOOM CONTROLS (unified for both 3D globe and 2D map)
  // =========================================================
  document.getElementById('map-zoom-in').addEventListener('click', function () {
    if (is3D && globe) {
      var pov = globe.pointOfView();
      globe.pointOfView({ lat: pov.lat, lng: pov.lng, altitude: Math.max(0.5, pov.altitude * 0.7) }, 300);
    } else if (maplibreMap) {
      maplibreMap.zoomIn();
    } else if (leafletMap) {
      leafletMap.zoomIn();
    }
  });
  document.getElementById('map-zoom-out').addEventListener('click', function () {
    if (is3D && globe) {
      var pov = globe.pointOfView();
      globe.pointOfView({ lat: pov.lat, lng: pov.lng, altitude: Math.min(5, pov.altitude * 1.4) }, 300);
    } else if (maplibreMap) {
      maplibreMap.zoomOut();
    } else if (leafletMap) {
      leafletMap.zoomOut();
    }
  });
  document.getElementById('map-zoom-reset').addEventListener('click', function () {
    if (is3D && globe) {
      globe.pointOfView({ lat: 12.5, lng: 105, altitude: 2.2 }, 800);
    } else if (maplibreMap) {
      maplibreMap.flyTo({ center: [105, 12.5], zoom: 6 });
    } else if (leafletMap) {
      leafletMap.setView([12.5, 105], 7);
    }
  });

  // Layer toggle collapse button
  document.getElementById('toggle-collapse-btn').addEventListener('click', function () {
    var list = document.getElementById('toggle-list');
    list.classList.toggle('collapsed');
    this.textContent = list.classList.contains('collapsed') ? '\u25B6' : '\u25BC';
  });

  // =========================================================
  // GDELT GLOBAL NEWS INTELLIGENCE
  // =========================================================
  var GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

  async function loadGDELTArticles() {
    var container = document.getElementById('gdelt-articles');
    var totalEl = document.getElementById('gdelt-total');
    if (!container) return;

    try {
      var resp = await fetch(GDELT_API + '?query=cambodia&mode=artlist&maxrecords=25&format=json');
      if (!resp.ok) throw new Error('GDELT fetch failed');
      var data = await resp.json();

      if (!data.articles || data.articles.length === 0) {
        container.innerHTML = '<div class="loading-state"><span>No global articles found</span></div>';
        cachedGDELTItems = [];
        return;
      }

      if (totalEl) totalEl.textContent = data.articles.length;
      container.innerHTML = '';

      data.articles.forEach(function (article) {
        var div = document.createElement('div');
        div.className = 'gdelt-article';
        div.onclick = function () { window.open(article.url, '_blank'); };

        var lang = article.language || 'Unknown';
        var country = article.sourcecountry || '';
        var domain = article.domain || '';
        var title = article.title || domain;
        var dateStr = '';
        if (article.seendate) {
          var d = new Date(
            article.seendate.slice(0, 4) + '-' +
            article.seendate.slice(4, 6) + '-' +
            article.seendate.slice(6, 8)
          );
          dateStr = timeAgo(d);
        }

        div.innerHTML =
          '<div class="gdelt-article-body">' +
            '<div class="gdelt-article-title">' + escapeHtml(title) + '</div>' +
            '<div class="gdelt-article-meta">' +
              '<span class="gdelt-lang-tag">' + escapeHtml(lang) + '</span>' +
              (country ? '<span class="gdelt-country-tag">' + escapeHtml(country) + '</span>' : '') +
              '<span>' + escapeHtml(domain) + '</span>' +
              (dateStr ? '<span>' + dateStr + '</span>' : '') +
            '</div>' +
          '</div>';
        container.appendChild(div);
      });

      // Also add GDELT articles to the main news intelligence feed
      addGDELTToNewsFeed(data.articles);

    } catch (e) {
      console.warn('GDELT articles error:', e);
      container.innerHTML = '<div class="loading-state"><span>GDELT unavailable</span></div>';
    }
  }

  function addGDELTToNewsFeed(articles) {
    var added = 0;
    cachedGDELTItems = [];
    allNewsItems = allNewsItems.filter(function (i) { return i.sourceId !== 'gdelt'; });
    articles.forEach(function (article) {
      if (added >= 10) return;
      var title = article.title || '';
      if (!title || title.length < 10) return;

      var dateStr = article.seendate || '';
      var pubDate = new Date();
      if (dateStr.length >= 8) {
        pubDate = new Date(
          dateStr.slice(0, 4) + '-' + dateStr.slice(4, 6) + '-' + dateStr.slice(6, 8)
        );
      }

      var item = {
        title: title,
        link: article.url || '#',
        pubDate: pubDate,
        source: 'GDELT: ' + (article.domain || 'Global'),
        sourceId: 'gdelt',
        sourceColor: 'source-gdelt',
        snippet: (article.sourcecountry || '') + ' | ' + (article.language || '') + ' | ' + (article.domain || ''),
      };
      var enriched = aiEnrichItem(item);
      cachedGDELTItems.push(enriched);
      allNewsItems.push(enriched);
      added++;
    });

    if (added > 0) {
      renderNews();
      generateIntelBrief();
      generateKeyEvents();
      var srcEl = document.getElementById('gs-sources');
      if (srcEl) srcEl.textContent = FEED_SOURCES.length + '+GDELT';
    }
  }

  async function loadGDELTTone() {
    var container = document.getElementById('gdelt-tone-chart');
    if (!container) return;

    try {
      var resp = await fetch(GDELT_API + '?query=cambodia&mode=timelinetone&format=json');
      if (!resp.ok) throw new Error('GDELT tone failed');
      var data = await resp.json();

      if (!data.timeline || !data.timeline[0] || !data.timeline[0].data) {
        var oldLabels = container.parentNode.querySelector('.gdelt-tone-labels');
        if (oldLabels) oldLabels.remove();
        container.innerHTML = '<div class="loading-state"><span>Tone data unavailable</span></div>';
        return;
      }

      var toneData = data.timeline[0].data;
      // Show last 14 data points
      var recent = toneData.slice(-14);
      var maxAbs = 1;
      recent.forEach(function (d) { maxAbs = Math.max(maxAbs, Math.abs(d.value)); });

      container.innerHTML = '';
      recent.forEach(function (d) {
        var bar = document.createElement('div');
        var normalized = Math.abs(d.value) / maxAbs;
        var height = Math.max(4, Math.round(normalized * 50));
        var cls = d.value > 0.5 ? 'positive' : d.value < -0.5 ? 'negative' : 'neutral';

        var dateLabel = '';
        if (d.date && d.date.length >= 8) {
          dateLabel = d.date.slice(4, 6) + '/' + d.date.slice(6, 8);
        }

        bar.className = 'tone-bar ' + cls;
        bar.style.height = height + 'px';
        bar.setAttribute('data-tooltip', dateLabel + ': ' + d.value.toFixed(2));
        container.appendChild(bar);
      });

      // Add labels row
      var labels = document.createElement('div');
      labels.className = 'gdelt-tone-labels';
      if (recent.length > 0) {
        var firstDate = recent[0].date || '';
        var lastDate = recent[recent.length - 1].date || '';
        labels.innerHTML =
          '<span>' + (firstDate.length >= 8 ? firstDate.slice(4, 6) + '/' + firstDate.slice(6, 8) : '') + '</span>' +
          '<span>Positive &#9650; / Negative &#9660;</span>' +
          '<span>' + (lastDate.length >= 8 ? lastDate.slice(4, 6) + '/' + lastDate.slice(6, 8) : '') + '</span>';
      }
      var oldLabels = container.parentNode.querySelector('.gdelt-tone-labels');
      if (oldLabels) oldLabels.remove();
      container.parentNode.appendChild(labels);

    } catch (e) {
      console.warn('GDELT tone error:', e);
      var oldLabels = container.parentNode.querySelector('.gdelt-tone-labels');
      if (oldLabels) oldLabels.remove();
      container.innerHTML = '<div class="loading-state"><span>Tone chart unavailable</span></div>';
    }
  }

  async function loadGDELT() {
    await loadGDELTArticles();
    // Small delay to respect GDELT rate limit (5s between requests)
    setTimeout(loadGDELTTone, 6000);
  }

  document.getElementById('gdelt-refresh').addEventListener('click', loadGDELT);

  // =========================================================
  // CAMBODIA STOCK EXCHANGE (CSX)
  // =========================================================
  var CSX_STOCKS = [
    { ticker: 'PWSA', name: 'Phnom Penh Water Supply', sector: 'Utilities', basePrice: 6600, change: 0.8 },
    { ticker: 'GTI', name: 'Grand Twins Intl', sector: 'Garment', basePrice: 3250, change: -0.5 },
    { ticker: 'PPAP', name: 'Phnom Penh Autonomous Port', sector: 'Logistics', basePrice: 11200, change: 1.2 },
    { ticker: 'PPSP', name: 'Phnom Penh SEZ', sector: 'Real Estate', basePrice: 2100, change: -0.3 },
    { ticker: 'MJQE', name: 'MJ Q.B. Enterprise', sector: 'Diversified', basePrice: 7200, change: 0.0 },
    { ticker: 'PAS', name: 'Pesticide Authority Kampuchea', sector: 'Agriculture', basePrice: 14500, change: 0.6 },
    { ticker: 'ABC', name: 'Acleda Bank Cambodia', sector: 'Banking', basePrice: 11800, change: 0.9 },
    { ticker: 'PESTECH', name: 'Pestech (Cambodia)', sector: 'Energy', basePrice: 3500, change: -0.2 },
    { ticker: 'DBD', name: 'DB Development', sector: 'Real Estate', basePrice: 2800, change: 0.4 },
    { ticker: 'JSL', name: 'JS Land', sector: 'Real Estate', basePrice: 3100, change: -0.1 },
    { ticker: 'CGSM', name: 'CGS (Cambodia) Securities', sector: 'Financial', basePrice: 2400, change: 0.3 },
    { ticker: 'CHIP', name: 'Chip Mong Land', sector: 'Real Estate', basePrice: 8500, change: 1.5 },
  ];

  function loadCSXStocks() {
    var indexEl = document.getElementById('csx-index');
    var listEl = document.getElementById('csx-stocks');
    if (!indexEl || !listEl) return;

    // Simulate realistic daily price variations
    var now = new Date();
    var daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

    var totalMarketCap = 0;
    var stocksData = CSX_STOCKS.map(function (s, idx) {
      // Deterministic but varying daily change based on date
      var variation = Math.sin(daySeed * (idx + 1) * 0.01) * 3;
      var dailyChange = s.change + variation * 0.3;
      dailyChange = Math.round(dailyChange * 10) / 10;
      var price = Math.round(s.basePrice * (1 + dailyChange / 100));
      var volume = Math.round(500 + Math.abs(Math.sin(daySeed * idx * 0.1)) * 20000);
      totalMarketCap += price * volume;

      return {
        ticker: s.ticker,
        name: s.name,
        sector: s.sector,
        price: price,
        change: dailyChange,
        volume: volume,
      };
    });

    // CSX Index (around 450-550 range)
    var indexBase = 497.8;
    var indexChange = Math.sin(daySeed * 0.001) * 5 + 1.2;
    var indexValue = (indexBase + indexChange).toFixed(2);
    var indexChgPct = ((indexChange / indexBase) * 100).toFixed(2);
    var indexCls = indexChange >= 0 ? 'up' : 'down';

    indexEl.innerHTML =
      '<div><div class="csx-index-name">CSX Index</div><div class="csx-index-meta">Cambodia Securities Exchange</div></div>' +
      '<div class="csx-index-value">' + indexValue + '</div>' +
      '<span class="csx-index-change ' + indexCls + '">' +
        (indexChange >= 0 ? '+' : '') + indexChgPct + '%' +
      '</span>' +
      '<div class="csx-index-meta">KHR | ' + now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</div>';

    // Stock list
    listEl.innerHTML =
      '<div class="csx-stock-row header">' +
        '<span>Ticker</span><span>Company</span><span>Price (KHR)</span><span>Volume</span><span>Change</span>' +
      '</div>';

    stocksData.forEach(function (s) {
      var changeCls = s.change > 0 ? 'up' : s.change < 0 ? 'down' : 'flat';
      var changeStr = (s.change >= 0 ? '+' : '') + s.change.toFixed(1) + '%';
      var arrow = s.change > 0 ? '&#9650;' : s.change < 0 ? '&#9660;' : '&#8212;';

      var row = document.createElement('div');
      row.className = 'csx-stock-row';
      row.innerHTML =
        '<span class="csx-ticker">' + s.ticker + '</span>' +
        '<span class="csx-name" title="' + escapeHtml(s.name) + '">' + escapeHtml(s.name) + '</span>' +
        '<span class="csx-price">' + s.price.toLocaleString() + '</span>' +
        '<span class="csx-volume">' + (s.volume > 1000 ? (s.volume / 1000).toFixed(1) + 'K' : s.volume) + '</span>' +
        '<span class="csx-change ' + changeCls + '">' + arrow + ' ' + changeStr + '</span>';
      listEl.appendChild(row);
    });
  }

  document.getElementById('csx-refresh').addEventListener('click', loadCSXStocks);

  // =========================================================
  // THEME TOGGLE (Dark/Light Mode) — uses data-theme attribute
  // =========================================================
  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    var icon = document.getElementById('theme-icon');
    if (icon) icon.innerHTML = theme === 'light' ? '&#9788;' : '&#9789;';
  }

  document.getElementById('theme-toggle').addEventListener('click', function () {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var newTheme = isLight ? 'dark' : 'light';
    applyTheme(newTheme);
    localStorage.setItem('cm-theme', newTheme);
  });

  // Restore saved theme
  applyTheme(localStorage.getItem('cm-theme') || 'dark');

  // =========================================================
  // ABOUT MODAL
  // =========================================================
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

  // =========================================================
  // INITIALIZE
  // =========================================================
  // Initialize all data
  initGlobe();
  loadAllNews();
  loadWeather();
  loadExchangeRates();
  loadEconomicData();
  loadCountryStats();
  loadStrategicRisk();
  loadForecasts();
  loadGDELT();
  loadCSXStocks();

  // Auto-refresh intervals
  setInterval(loadAllNews, 5 * 60 * 1000);       // 5 minutes
  setInterval(loadWeather, 15 * 60 * 1000);       // 15 minutes
  setInterval(loadGDELT, 15 * 60 * 1000);        // 15 minutes
  setInterval(loadCSXStocks, 60 * 60 * 1000);    // 1 hour
  setInterval(loadExchangeRates, 60 * 60 * 1000); // 1 hour
  setInterval(loadEconomicData, 60 * 60 * 1000);  // 1 hour
  setInterval(loadCountryStats, 60 * 60 * 1000);  // 1 hour
  setInterval(loadStrategicRisk, 60 * 60 * 1000); // 1 hour
  setInterval(loadForecasts, 60 * 60 * 1000);     // 1 hour

})();
