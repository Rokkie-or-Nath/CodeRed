import { useState } from 'react';
import { Moon, Loader, Volume2, Route, Phone, ToggleLeft, ToggleRight } from 'lucide-react';

const extras = [
  {
    icon: Moon,
    title: 'Dark Mode Toggle',
    description: 'Switch between light and dark themes. Default dark for reduced eye strain during nighttime emergencies.',
    implemented: true,
  },
  {
    icon: Loader,
    title: 'Loading Spinner',
    description: 'Animated spinner shown while fetching location and hospital data. Keeps users informed during wait.',
    implemented: true,
  },
  {
    icon: Volume2,
    title: 'Sound Alert',
    description: 'Audio notification when emergency mode activates. Critical for accessibility and drawing attention.',
    implemented: false,
  },
  {
    icon: Route,
    title: 'Distance Calculator',
    description: 'Calculate and display distance to each hospital in kilometers using the Haversine formula.',
    implemented: true,
  },
  {
    icon: Phone,
    title: '"Call Hospital" Button',
    description: 'One-tap simulation button that displays the hospital\'s phone number and initiates a call on mobile.',
    implemented: false,
  },
];

export default function ExtraFeaturesSection() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <section id="extras" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Enhancements</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Extra <span className="text-red-400">Features</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Suggested enhancements to take your Emergency Locator to the next level.
          </p>
        </div>

        {/* Dark Mode Demo */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className={`p-6 rounded-2xl border transition-all duration-500 ${
            darkMode
              ? 'bg-dark-800 border-white/5'
              : 'bg-gray-100 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-lg font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dark Mode Demo
                </h3>
                <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Toggle between light and dark themes
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2"
              >
                {darkMode ? (
                  <ToggleRight className="w-8 h-8 text-red-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
                <span className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-gray-600'}`}>
                  {darkMode ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Background', dark: '#0a0a0a', light: '#f3f4f6' },
                { label: 'Cards', dark: '#111111', light: '#ffffff' },
                { label: 'Accent', dark: '#dc2626', light: '#dc2626' },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {extras.map((extra) => (
            <div
              key={extra.title}
              className="group p-5 rounded-2xl bg-dark-800 border border-white/5 hover:border-red-500/20 transition-all duration-300 card-glow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <extra.icon className="w-5 h-5 text-red-400" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  extra.implemented
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                }`}>
                  {extra.implemented ? 'Included' : 'Planned'}
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

        {/* Distance Calculator Demo */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-dark-800 border border-white/5">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Route className="w-5 h-5 text-red-400" />
              Haversine Distance Formula
            </h3>
            <div className="code-block">
              <pre>
                <code className="text-xs text-gray-300">{`function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1); // Distance in km
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
