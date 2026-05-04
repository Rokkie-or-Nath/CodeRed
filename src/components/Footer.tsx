import { MapPin, Heart, GitFork, ExternalLink } from 'lucide-react';

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
                Code<span className="text-red-500">Red</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              An open-source emergency hospital locator. Real-time geolocation, interactive 3D maps,
              and turn-by-turn routing — built for when every second counts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-gray-300">Sections</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Features',  href: '#features' },
                { label: 'Interface', href: '#interface' },
                { label: 'User Flow', href: '#userflow' },
                { label: 'Code',      href: '#code' },
                { label: 'API Guide', href: '#api' },
                { label: 'Extras',    href: '#extras' },
                { label: 'Design',    href: '#design' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-gray-300">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'React', 'TypeScript', 'Vite', 'Tailwind CSS',
                'MapLibre GL', 'Geoapify', 'OpenRouteService', 'Overpass API',
              ].map((tech) => (
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
          <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-gray-600">
            <p className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-0.5" /> for emergencies
            </p>
            <span className="hidden sm:inline text-gray-700">·</span>
            <p>
              Designed & developed by{' '}
              <span className="text-red-400 font-semibold">Rokkie</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Rokkie-or-Nath/CodeRed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="GitHub"
            >
              <GitFork className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/Rokkie-or-Nath/CodeRed"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="View Project"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
