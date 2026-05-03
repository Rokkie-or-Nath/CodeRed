import { MapPin, Wifi, Navigation, Crosshair, Smartphone, Heart } from 'lucide-react';

const features = [
  {
    icon: Navigation,
    title: 'Live Location Detection',
    description: 'Uses the Geolocation API to instantly detect the user\'s current coordinates with high precision.',
    tag: 'Geolocation API',
  },
  {
    icon: MapPin,
    title: 'Interactive Map',
    description: 'Full-screen Mapbox-powered map with smooth zoom, pan, and real-time marker rendering.',
    tag: 'Mapbox GL JS',
  },
  {
    icon: Crosshair,
    title: 'Nearby Hospitals Finder',
    description: 'Queries the Overpass API or Mapbox to locate all hospitals within a configurable radius.',
    tag: 'Overpass API',
  },
  {
    icon: Heart,
    title: 'Emergency Mode',
    description: 'One-tap emergency mode highlights the nearest hospital and calculates the fastest route.',
    tag: 'Auto-Route',
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Fully responsive design optimized for mobile devices where emergencies often happen.',
    tag: 'Responsive',
  },
  {
    icon: Wifi,
    title: 'Offline Fallback',
    description: 'Caches last known location and hospital data for areas with poor connectivity.',
    tag: 'Service Worker',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Core Features</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Everything You Need in an{' '}
            <span className="text-red-400">Emergency</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Built with cutting-edge web technologies to deliver fast, reliable hospital location services.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-dark-800 border border-white/5 hover:border-red-500/30 transition-all duration-500 card-glow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/20 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:from-red-600/30 group-hover:to-red-800/30 transition-all duration-300">
                <feature.icon className="w-6 h-6 text-red-400" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold mb-2 group-hover:text-red-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Tag */}
              <div className="inline-flex px-2.5 py-1 rounded-md bg-dark-700 border border-white/5 text-xs font-mono text-gray-500">
                {feature.tag}
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/0 to-red-500/0 group-hover:from-red-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
