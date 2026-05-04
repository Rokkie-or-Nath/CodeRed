import { useState } from 'react';
import { Search, Route, Building2, TrafficCone, Navigation, Phone, Layers, Crosshair, ToggleLeft, ToggleRight } from 'lucide-react';

const extras = [
  {
    icon: Search,
    title: 'Hospital Search Bar',
    description: 'Real-time search filter on the sidebar and mobile sheet. Type to instantly narrow down hospitals by name.',
    implemented: true,
  },
  {
    icon: Route,
    title: 'Turn-by-Turn Routing',
    description: 'Driving route drawn on the map via OpenRouteService. Glowing red line with glow effect guides you to the hospital.',
    implemented: true,
  },
  {
    icon: Building2,
    title: 'Hospital Building Glow',
    description: 'Actual hospital building footprints fetched from Overpass API and rendered as glowing red 3D extrusions on the map.',
    implemented: true,
  },
  {
    icon: TrafficCone,
    title: 'Traffic Stripe Overlay',
    description: 'Black and gray dashed line layers over major roads simulate traffic visibility at zoom level 10+.',
    implemented: true,
  },
  {
    icon: Navigation,
    title: 'Sorted by Nearest',
    description: 'Hospitals are ranked and displayed from closest to farthest. Each marker shows its rank number on the map.',
    implemented: true,
  },
  {
    icon: Layers,
    title: 'Satellite Toggle',
    description: 'Switch between dark-matter and satellite map styles. Custom layers (building glow, traffic, route) are re-applied automatically.',
    implemented: true,
  },
  {
    icon: Crosshair,
    title: 'Recenter Button',
    description: 'One-tap button to fly the map back to your current location with a smooth animated transition.',
    implemented: true,
  },
  {
    icon: Phone,
    title: 'Call Hospital',
    description: 'Tap-to-call button appears when a hospital is selected. Directly dials the hospital phone number on mobile.',
    implemented: true,
  },
];

export default function ExtraFeaturesSection() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <section id="extras" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Enhancements</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Extra <span className="text-red-400">Features</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Every feature built into CodeRed to make emergency response faster and smarter.
          </p>
        </div>

        {/* Dark Mode Demo */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${
            darkMode ? 'bg-dark-800 border-white/5' : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dark Mode Demo
                </h3>
                <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Default dark theme — optimized for emergency use at night
                </p>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className="flex items-center gap-2">
                {darkMode
                  ? <ToggleRight className="w-8 h-8 text-red-400" />
                  : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                <span className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-gray-600'}`}>
                  {darkMode ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Background', dark: '#0a0a0f', light: '#f3f4f6' },
                { label: 'Surface',    dark: '#111118', light: '#ffffff' },
                { label: 'Emergency',  dark: '#dc2626', light: '#dc2626' },
              ].map((color) => (
                <div key={color.label} className="text-center">
                  <div
                    className="h-12 rounded-lg mb-2 border border-white/10 transition-colors duration-500"
                    style={{ backgroundColor: darkMode ? color.dark : color.light }}
                  />
                  <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {color.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {extras.map((extra) => (
            <div
              key={extra.title}
              className="group p-5 rounded-2xl bg-dark-800 border border-white/5 hover:border-red-500/20 transition-all duration-300 card-glow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <extra.icon className="w-5 h-5 text-red-400" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                  Built
                </span>
              </div>
              <h3 className="text-sm font-bold mb-1 group-hover:text-red-300 transition-colors">
                {extra.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {extra.description}
              </p>
            </div>
          ))}
        </div>

        {/* Haversine Demo */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-dark-800 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Route className="w-5 h-5 text-red-400" />
              Distance Calculation Used in CodeRed
            </h3>
            <div className="code-block">
              <pre>
                <code className="text-xs text-gray-300">{`// Euclidean approximation used for fast sorting (accurate within 50km)
const dist = Math.sqrt((p.lat - userLat) ** 2 + (p.lon - userLon) ** 2) * 111;

// For precise distance, use the Haversine formula:
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
