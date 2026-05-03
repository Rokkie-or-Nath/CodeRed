import { MapPin, Heart, Globe, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Emergency<span className="text-red-500">Locator</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              An open-source concept for a web application that helps users find nearby hospitals during emergencies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-gray-300">Sections</h4>
            <div className="grid grid-cols-2 gap-2">
              {['Features', 'Interface', 'User Flow', 'Code', 'API Guide', 'Extras', 'Design'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase().replace(' ', '')}`}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-gray-300">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {['Mapbox GL', 'Geolocation API', 'Overpass API', 'React', 'Tailwind CSS', 'TypeScript'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg bg-dark-800 border border-white/5 text-xs font-medium text-gray-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for emergencies
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-red-400 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-500 hover:text-red-400 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
