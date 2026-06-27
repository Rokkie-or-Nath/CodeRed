import { Globe, ShieldCheck, Map, MapPin, AlertTriangle } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: Globe,
    title: 'Open the App',
    description: 'User navigates to the Emergency Locator web app on any device.',
    detail: 'Instant load with optimized bundle',
  },
  {
    step: 2,
    icon: ShieldCheck,
    title: 'Grant Location Permission',
    description: 'Browser prompts for geolocation access. User grants permission.',
    detail: 'Secure HTTPS context required',
  },
  {
    step: 3,
    icon: Map,
    title: 'Map Loads',
    description: 'Interactive map initializes and centers on the user\'s current location.',
    detail: 'Mapbox GL JS renders the map',
  },
  {
    step: 4,
    icon: MapPin,
    title: 'Hospitals Appear',
    description: 'Nearby hospitals are fetched and displayed as interactive markers.',
    detail: 'Overpass API queries within 5km radius',
  },
  {
    step: 5,
    icon: AlertTriangle,
    title: 'Emergency Mode',
    description: 'User taps EMERGENCY — nearest hospital is highlighted with route.',
    detail: 'Auto-calculates shortest path',
  },
];

export default function UserFlowSection() {
  return (
    <section id="userflow" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">User Flow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            From Open to <span className="text-red-400">Rescue</span> in 5 Steps
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A streamlined flow designed for speed and clarity during critical moments.
          </p>
        </div>

        {/* Flow Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-red-500/50 via-red-500/20 to-transparent" />

          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative flex gap-4 sm:gap-8 group">
                {/* Step Number */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-dark-800 border border-red-500/20 flex items-center justify-center group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-all duration-500">
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-red-600/40">
                    {step.step}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="p-5 sm:p-6 rounded-2xl bg-dark-800 border border-white/5 group-hover:border-red-500/20 transition-all duration-500">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-red-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">{step.description}</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-dark-700 border border-white/5 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {step.detail}
                    </div>
                  </div>

                  {/* Arrow (except last) */}
                  {index < steps.length - 1 && (
                    <div className="mt-4 ml-2 text-gray-600">
                      <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                        <path d="M6 0v14M1 10l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow the Trail Button */}
        <div className="text-center mt-12">
          <a
            href="#interface"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border border-red-400/20 hover:border-red-400/40 shadow-xl shadow-red-600/20 hover:shadow-red-600/40 text-white font-bold text-base transition-all duration-500 hover:scale-105 group"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            Follow the Trail to the Map
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <p className="text-gray-500 text-sm mt-4">
            See the live map with nearby hospitals in action
          </p>
        </div>
      </div>
    </section>
  );
}
