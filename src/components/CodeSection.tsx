import { useState } from 'react';
import { Copy, Check, FileCode, Palette, Braces } from 'lucide-react';

const codeSnippets = [
  {
    id: 'html',
    label: 'HTML Structure',
    icon: FileCode,
    language: 'html',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodeRed — Emergency Locator</title>
  <link href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- Navigation Bar -->
  <nav class="navbar">
    <div class="logo">🚨 CodeRed</div>
    <div class="nav-links">
      <a href="#" class="active">Home</a>
      <a href="#map">Map</a>
      <a href="#profile">Profile</a>
    </div>
  </nav>

  <!-- Search Bar -->
  <div class="search-bar">
    <input type="text" id="hospital-search" placeholder="Search hospitals..." />
  </div>

  <!-- Map Container -->
  <div id="map" class="map-container"></div>

  <!-- Floating Emergency Button -->
  <button id="emergency-btn" class="emergency-btn">
    🚨 EMERGENCY
  </button>

  <!-- Hospital Info Sidebar -->
  <aside id="hospital-panel" class="hospital-panel">
    <h3>Nearby Hospitals</h3>
    <p class="subtitle">Sorted by nearest distance</p>
    <div id="hospital-list"></div>
  </aside>

  <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
  <script src="app.js"></script>
</body>
</html>`,
  },
  {
    id: 'css',
    label: 'CSS Styling',
    icon: Palette,
    language: 'css',
    code: `/* === Base Styles === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #0a0a0f;
  color: #ffffff;
}

/* === Navbar === */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(10, 10, 15, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

/* === Search Bar === */
.search-bar {
  position: fixed;
  top: 70px; left: 50%;
  transform: translateX(-50%);
  z-index: 90;
  width: 320px;
}

.search-bar input {
  width: 100%;
  padding: 0.6rem 1rem;
  border-radius: 9999px;
  background: rgba(17,17,27,0.95);
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  font-size: 0.85rem;
  outline: none;
  transition: border 0.2s;
}

.search-bar input:focus {
  border-color: rgba(239,68,68,0.5);
}

/* === Map Container === */
.map-container {
  position: absolute;
  top: 60px; bottom: 0;
  width: 100%;
}

/* === Emergency Button === */
.emergency-btn {
  position: fixed;
  bottom: 2rem; left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  padding: 1rem 2.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 30px rgba(220,38,38,0.5);
  animation: emergencyPulse 2s infinite;
  transition: all 0.3s ease;
}

.emergency-btn:hover {
  background: #ef4444;
  transform: translateX(-50%) scale(1.05);
}

/* === Hospital Panel === */
.hospital-panel {
  position: fixed;
  top: 60px; left: 0;
  width: 300px;
  height: calc(100vh - 60px);
  background: rgba(13,13,20,0.97);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255,255,255,0.05);
  padding: 1.5rem;
  overflow-y: auto;
  z-index: 40;
}

/* === Hospital Building Glow === */
/* Handled via MapLibre fill-extrusion layers in JS */

/* === Traffic Stripes === */
/* Handled via MapLibre line layers with dasharray in JS */

@keyframes emergencyPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.7); }
  50%       { box-shadow: 0 0 0 20px rgba(220,38,38,0); }
}`,
  },
  {
    id: 'js',
    label: 'JavaScript',
    icon: Braces,
    language: 'javascript',
    code: `// === Dependencies ===
// npm install maplibre-gl
// .env → VITE_GEOAPIFY_KEY, VITE_ORS_KEY

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const ORS_KEY      = import.meta.env.VITE_ORS_KEY;

// === Initialize MapLibre with Geoapify dark style ===
const map = new maplibregl.Map({
  container: 'map',
  style: \`https://maps.geoapify.com/v1/styles/dark-matter/style.json?apiKey=\${GEOAPIFY_KEY}\`,
  center: [0, 0],
  zoom: 2,
  pitch: 45,
  antialias: true,
});

// === Get User Location ===
navigator.geolocation.getCurrentPosition(async ({ coords }) => {
  const { latitude: lat, longitude: lon } = coords;

  map.flyTo({ center: [lon, lat], zoom: 14, pitch: 45, duration: 1500 });

  // Blue user marker with pulse
  const el = document.createElement('div');
  el.style.cssText = \`
    width:20px;height:20px;border-radius:50%;
    background:#3b82f6;border:3px solid white;
    box-shadow:0 0 12px rgba(59,130,246,0.9);
  \`;
  new maplibregl.Marker({ element: el })
    .setLngLat([lon, lat])
    .setPopup(new maplibregl.Popup().setText('You are here'))
    .addTo(map);

  // === Fetch Nearby Hospitals via Geoapify ===
  const res = await fetch(
    \`https://api.geoapify.com/v2/places?categories=healthcare.hospital\` +
    \`&filter=circle:\${lon},\${lat},50000&limit=100&apiKey=\${GEOAPIFY_KEY}\`
  );
  const data = await res.json();

  // Sort by nearest distance
  const hospitals = data.features
    .map(f => {
      const p = f.properties;
      const dist = Math.sqrt((p.lat-lat)**2 + (p.lon-lon)**2) * 111;
      return { name: p.name || 'Unknown', lat: p.lat, lon: p.lon,
               phone: p.contact?.phone || 'N/A', dist };
    })
    .sort((a, b) => a.dist - b.dist);

  // === Add Ranked Hospital Markers ===
  hospitals.forEach((h, i) => {
    const hEl = document.createElement('div');
    hEl.style.cssText = \`
      width:32px;height:32px;border-radius:8px;background:#dc2626;
      border:1px solid rgba(248,113,113,0.5);
      box-shadow:0 0 12px rgba(220,38,38,0.6);
      display:flex;align-items:center;justify-content:center;
      font-weight:700;font-size:13px;color:white;cursor:pointer;
    \`;
    hEl.textContent = \`\${i + 1}\`;
    new maplibregl.Marker({ element: hEl })
      .setLngLat([h.lon, h.lat])
      .setPopup(new maplibregl.Popup().setHTML(
        \`<strong>#\${i+1} \${h.name}</strong><br/>\${h.dist.toFixed(1)} km\`
      ))
      .addTo(map);
  });

  // === Hospital Building Glow (Overpass API) ===
  const parts = hospitals.slice(0, 20).map(h =>
    \`way(around:80,\${h.lat},\${h.lon})[amenity=hospital];\`
  ).join('');
  const osmRes = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: \`[out:json][timeout:25];(\${parts});out body;>;out skel qt;\`,
  });
  const osm = await osmRes.json();

  const nodeMap = {};
  osm.elements.forEach(el => {
    if (el.type === 'node') nodeMap[el.id] = [el.lon, el.lat];
  });

  const features = osm.elements
    .filter(el => el.type === 'way' && el.nodes)
    .map(el => {
      const coords = el.nodes.map(id => nodeMap[id]).filter(Boolean);
      if (coords.length < 3) return null;
      if (coords[0][0] !== coords.at(-1)[0]) coords.push(coords[0]);
      return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} };
    })
    .filter(Boolean);

  map.addSource('hospital-buildings', { type: 'geojson', data: { type: 'FeatureCollection', features } });
  // Glow layer
  map.addLayer({ id: 'hospital-buildings-glow', type: 'fill-extrusion', source: 'hospital-buildings',
    paint: { 'fill-extrusion-color': '#ff2020', 'fill-extrusion-height': 60,
             'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.25 } });
  // Core layer
  map.addLayer({ id: 'hospital-buildings', type: 'fill-extrusion', source: 'hospital-buildings',
    paint: { 'fill-extrusion-color': '#ef4444', 'fill-extrusion-height': 40,
             'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.9 } });

  // === Traffic Stripes (black & gray dashed) ===
  const style = map.getStyle();
  const roadSrc = Object.keys(style.sources).find(k =>
    k.includes('geoapify') || k.includes('openmaptiles')
  );
  if (roadSrc) {
    map.addLayer({ id: 'traffic-dark', type: 'line', source: roadSrc,
      'source-layer': 'transportation',
      filter: ['in', ['get','class'], ['literal',['primary','secondary','trunk','motorway']]],
      paint: { 'line-color': 'rgba(50,50,50,0.6)', 'line-width': 4, 'line-dasharray': [2,2] } });
    map.addLayer({ id: 'traffic-light', type: 'line', source: roadSrc,
      'source-layer': 'transportation',
      filter: ['in', ['get','class'], ['literal',['primary','secondary','trunk','motorway']]],
      paint: { 'line-color': 'rgba(140,140,140,0.35)', 'line-width': 2,
               'line-dasharray': [2,2], 'line-offset': 2 } });
  }

  // === Navigate to Hospital (ORS) ===
  async function navigateTo(hospital, userLat, userLon) {
    const r = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      { method: 'POST',
        headers: { 'Authorization': ORS_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: [[userLon,userLat],[hospital.lon,hospital.lat]] }) }
    );
    const route = (await r.json()).features[0];
    map.addSource('route', { type: 'geojson', data: route });
    map.addLayer({ id: 'route-glow', type: 'line', source: 'route',
      paint: { 'line-color': '#f87171', 'line-width': 10, 'line-opacity': 0.3 } });
    map.addLayer({ id: 'route', type: 'line', source: 'route',
      paint: { 'line-color': '#ef4444', 'line-width': 4, 'line-opacity': 0.95 } });
  }

  // === Emergency Button ===
  document.getElementById('emergency-btn').addEventListener('click', () => {
    const nearest = hospitals[0]; // already sorted
    map.flyTo({ center: [nearest.lon, nearest.lat], zoom: 16, pitch: 60 });
    navigateTo(nearest, lat, lon);
  });

  // === Search Filter ===
  document.getElementById('hospital-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('.hospital-item').forEach(el => {
      el.style.display = el.dataset.name.includes(q) ? '' : 'none';
    });
  });

}, console.error, { enableHighAccuracy: true });`,
  },
];

export default function CodeSection() {
  const [activeTab, setActiveTab] = useState('html');
  const [copied, setCopied] = useState(false);

  const activeSnippet = codeSnippets.find((s) => s.id === activeTab)!;

  const handleCopy = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(activeSnippet.code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = activeSnippet.code;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch { /* silent */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Implementation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Actual <span className="text-red-400">Code</span> Used
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            The real HTML, CSS, and JavaScript powering CodeRed — MapLibre GL, Geoapify, and OpenRouteService.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="code-block">
            <div className="flex items-center justify-between border-b border-white/5 px-4">
              <div className="flex gap-1">
                {codeSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={() => setActiveTab(snippet.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === snippet.id
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <snippet.icon className="w-4 h-4" />
                    {snippet.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                ) : (
                  <><Copy className="w-3.5 h-3.5" />Copy</>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto">
              <code className="text-sm leading-relaxed text-gray-300">{activeSnippet.code}</code>
            </pre>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-dark-800 border border-red-500/10">
            <p className="text-sm text-gray-400">
              <span className="text-red-400 font-semibold">💡 Tip:</span> Store your keys in a{' '}
              <code className="px-1.5 py-0.5 rounded bg-dark-700 text-red-300 text-xs font-mono">.env</code> file as{' '}
              <code className="px-1.5 py-0.5 rounded bg-dark-700 text-red-300 text-xs font-mono">VITE_GEOAPIFY_KEY</code> and{' '}
              <code className="px-1.5 py-0.5 rounded bg-dark-700 text-red-300 text-xs font-mono">VITE_ORS_KEY</code>. Never commit them to Git.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
