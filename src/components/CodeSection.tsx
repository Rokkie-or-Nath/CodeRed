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
  <title>Emergency Locator</title>
  <link
    href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css"
    rel="stylesheet"
    integrity="sha384-placeholder-replace-with-actual-sri-hash"
    crossorigin="anonymous"
  />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- Navigation Bar -->
  <nav class="navbar">
    <div class="logo">🏥 Emergency Locator</div>
    <div class="nav-links">
      <a href="#" class="active">Home</a>
      <a href="#map">Map</a>
      <a href="#profile">Profile</a>
    </div>
  </nav>

  <!-- Map Container -->
  <div id="map" class="map-container"></div>

  <!-- Floating Emergency Button -->
  <button id="emergency-btn" class="emergency-btn">
    🚨 EMERGENCY
  </button>

  <!-- Hospital Info Sidebar -->
  <aside id="hospital-panel" class="hospital-panel">
    <h3>Nearby Hospitals</h3>
    <div id="hospital-list"></div>
  </aside>

  <!-- Install via npm instead: npm install mapbox-gl -->
  <!-- Then import in app.js: import mapboxgl from 'mapbox-gl'; -->
  <!-- Or use CDN with SRI for integrity verification: -->
  <script
    src="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js"
    integrity="sha384-placeholder-replace-with-actual-sri-hash"
    crossorigin="anonymous"
  ></script>
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
  background: #0a0a0a;
  color: #ffffff;
}

/* === Navbar === */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* === Map Container === */
.map-container {
  position: absolute;
  top: 60px;
  bottom: 0;
  width: 100%;
}

/* === Emergency Button === */
.emergency-btn {
  position: fixed;
  bottom: 2rem;
  left: 50%;
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
  box-shadow: 0 0 30px rgba(220, 38, 38, 0.4);
  animation: pulse 2s infinite;
  transition: all 0.3s ease;
}

.emergency-btn:hover {
  background: #ef4444;
  transform: translateX(-50%) scale(1.05);
}

/* === Hospital Panel === */
.hospital-panel {
  position: fixed;
  top: 60px;
  left: 0;
  width: 320px;
  height: calc(100vh - 60px);
  background: rgba(17, 17, 17, 0.95);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  overflow-y: auto;
  z-index: 40;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  50% { box-shadow: 0 0 0 20px rgba(220, 38, 38, 0); }
}`,
  },
  {
    id: 'js',
    label: 'JavaScript',
    icon: Braces,
    language: 'javascript',
    code: `// === Configuration ===
// Install mapbox-gl via npm: npm install mapbox-gl
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';
const SEARCH_RADIUS = 5000; // 5km in meters

// === Initialize Mapbox ===
// mapboxgl is now imported via npm, not loaded from CDN
mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [0, 0],
  zoom: 14,
});

// === Get User Location ===
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lng: longitude });
      },
      (error) => reject(error),
      { enableHighAccuracy: true }
    );
  });
}

// === Fetch Nearby Hospitals ===
async function fetchNearbyHospitals(lng, lat) {
  const query = \`
    [out:json][timeout:25];
    (
      node["amenity"="hospital"]
        (around:\${SEARCH_RADIUS},\${lat},\${lng});
    );
    out body;
  \`;
  const url = \`https://overpass-api.de/api/interpreter?data=\${encodeURIComponent(query)}\`;
  const response = await fetch(url);
  const data = await response.json();
  return data.elements;
}

// === Add Hospital Markers ===
function addHospitalMarkers(hospitals) {
  hospitals.forEach((hospital) => {
    const el = document.createElement('div');
    el.className = 'hospital-marker';
    el.innerHTML = '🏥';
    el.style.fontSize = '24px';
    el.style.cursor = 'pointer';

    new mapboxgl.Marker(el)
      .setLngLat([hospital.lon, hospital.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(\`
            <h3>\${hospital.tags.name || 'Hospital'}</h3>
            <p>\${hospital.tags.address || 'No address'}</p>
            <p>📞 \${hospital.tags.phone || 'N/A'}</p>
          \`)
      )
      .addTo(map);
  });
}

// === Emergency Button Handler ===
document.getElementById('emergency-btn').addEventListener('click', async () => {
  const btn = document.getElementById('emergency-btn');
  btn.textContent = '🔄 Locating...';
  btn.style.background = '#b91c1c';

  try {
    const location = await getUserLocation();
    map.flyTo({ center: [location.lng, location.lat], zoom: 16 });

    const hospitals = await fetchNearbyHospitals(location.lng, location.lat);
    if (hospitals.length > 0) {
      // Fly to nearest hospital
      const nearest = hospitals[0];
      map.flyTo({ center: [nearest.lon, nearest.lat], zoom: 17 });
      btn.textContent = '✅ Hospital Found!';
    }
  } catch (err) {
    btn.textContent = '❌ Error';
    console.error(err);
  }
});

// === Initialize App ===
async function init() {
  try {
    const location = await getUserLocation();
    map.setCenter([location.lng, location.lat]);

    // Add user marker
    new mapboxgl.Marker({ color: '#3b82f6' })
      .setLngLat([location.lng, location.lat])
      .addTo(map);

    // Fetch and display hospitals
    const hospitals = await fetchNearbyHospitals(location.lng, location.lat);
    addHospitalMarkers(hospitals);
  } catch (err) {
    console.error('Failed to initialize:', err);
  }
}

map.on('load', init);`,
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
        // Fallback for file:// protocol or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = activeSnippet.code;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
    } catch {
      // If all else fails, still show feedback
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Implementation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Starter <span className="text-red-400">Code</span> Snippets
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Copy-paste ready code to get your Emergency Locator up and running in minutes.
          </p>
        </div>

        {/* Code Block */}
        <div className="max-w-4xl mx-auto">
          <div className="code-block">
            {/* Tabs */}
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
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Code Content */}
            <pre className="overflow-x-auto">
              <code className="text-sm leading-relaxed text-gray-300">
                {activeSnippet.code}
              </code>
            </pre>
          </div>

          {/* Info note */}
          <div className="mt-6 p-4 rounded-xl bg-dark-800 border border-red-500/10">
            <p className="text-sm text-gray-400">
              <span className="text-red-400 font-semibold">💡 Tip:</span> Replace{' '}
              <code className="px-1.5 py-0.5 rounded bg-dark-700 text-red-300 text-xs font-mono">YOUR_MAPBOX_TOKEN_HERE</code>{' '}
              with your actual Mapbox API key. See the API Integration section below for instructions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
