import { useState } from 'react';
import { MapPin, Phone, Star, Clock, Navigation, ChevronRight, X, AlertTriangle, Layers } from 'lucide-react';

const mockHospitals = [
  { name: 'City General Hospital', distance: '0.8 km', rating: 4.5, open: true, phone: '+1 555-0101' },
  { name: 'St. Mary\'s Medical Center', distance: '1.2 km', rating: 4.7, open: true, phone: '+1 555-0102' },
  { name: 'Emergency Care Unit', distance: '2.1 km', rating: 4.3, open: true, phone: '+1 555-0103' },
];

export default function AppInterfaceSection() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);

  return (
    <section id="interface" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">App Interface</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Intuitive <span className="text-red-400">Design</span> Layout
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A clean, focused interface designed for high-stress situations where clarity matters most.
          </p>
        </div>

        {/* App Mockup */}
        <div className="relative max-w-5xl mx-auto">
          {/* Browser chrome */}
          <div className="bg-dark-700 rounded-t-2xl border border-white/10 border-b-0 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md bg-dark-800 text-xs text-gray-500 font-mono flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                emergency-locator.app
              </div>
            </div>
          </div>

          {/* App Content */}
          <div className="bg-dark-800 rounded-b-2xl border border-white/10 border-t-0 overflow-hidden">
            {/* Top Nav */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-dark-900/50 border-b border-white/5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span className="text-sm font-semibold">Emergency Locator</span>
              </div>
              <div className="flex items-center gap-4">
                {['Home', 'Map', 'Profile'].map((item, i) => (
                  <span key={item} className={`text-xs font-medium ${i === 1 ? 'text-red-400' : 'text-gray-500'}`}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Map Area */}
            <div className="relative h-[400px] sm:h-[500px] map-grid bg-dark-900">
              {/* Map decorative elements */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Roads */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-700/50" />
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-700/50" />
                <div className="absolute top-1/3 left-0 right-0 h-px bg-gray-700/30" />
                <div className="absolute top-2/3 left-0 right-0 h-px bg-gray-700/30" />
                <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-700/30" />
                <div className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-700/30" />

                {/* Diagonal road */}
                <div className="absolute top-0 left-0 w-[141%] h-px bg-gray-700/20 origin-top-left rotate-45" />

                {/* Block fills */}
                <div className="absolute top-[10%] left-[5%] w-[20%] h-[15%] rounded bg-dark-700/30 border border-dark-600/20" />
                <div className="absolute top-[55%] left-[60%] w-[25%] h-[20%] rounded bg-dark-700/30 border border-dark-600/20" />
                <div className="absolute top-[15%] left-[55%] w-[15%] h-[25%] rounded bg-dark-700/30 border border-dark-600/20" />
              </div>

              {/* User Location */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="relative">
                  <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 ping-slow" style={{ left: '50%', top: '50%' }} />
                  <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50" />
                </div>
              </div>

              {/* Hospital Markers */}
              <div className="absolute top-[30%] left-[35%] marker-bounce" style={{ animationDelay: '0s' }}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30">
                    <span className="text-white text-xs font-bold">H</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-red-600" />
                </div>
              </div>

              <div className="absolute top-[60%] left-[65%] marker-bounce" style={{ animationDelay: '0.3s' }}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40 border border-red-400/30">
                    <span className="text-white text-xs font-bold">H</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-red-600" />
                </div>
              </div>

              <div className="absolute top-[25%] left-[70%] marker-bounce" style={{ animationDelay: '0.6s' }}>
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-red-600/70 flex items-center justify-center shadow-lg border border-red-400/20">
                    <span className="text-white text-xs font-bold">H</span>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-red-600/70" />
                </div>
              </div>

              {/* Floating Emergency Button */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                <button className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-full shadow-2xl shadow-red-600/40 text-sm font-bold transition-all emergency-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  EMERGENCY
                </button>
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button className="w-9 h-9 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Layers className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                  <Navigation className="w-4 h-4" />
                </button>
              </div>

              {/* Toggle Sidebar Button */}
              <div className="absolute top-4 left-4 z-20">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {showSidebar ? <X className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  {showSidebar ? 'Hide' : 'Show'} Hospitals
                </button>
              </div>

              {/* Hospital Sidebar */}
              {showSidebar && (
                <div className="absolute top-0 left-0 bottom-0 w-72 bg-dark-900/95 backdrop-blur-xl border-r border-white/5 z-10 overflow-y-auto">
                  <div className="p-4">
                    <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      Nearby Hospitals
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">3 hospitals found within 5km</p>

                    <div className="space-y-3">
                      {mockHospitals.map((hospital, index) => (
                        <div
                          key={hospital.name}
                          onClick={() => setSelectedHospital(selectedHospital === index ? null : index)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                            selectedHospital === index
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-dark-800/50 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-xs font-semibold leading-tight">{hospital.name}</h4>
                            <div className="flex items-center gap-0.5 text-yellow-400">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-[10px] font-medium">{hospital.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Navigation className="w-2.5 h-2.5" />
                              {hospital.distance}
                            </span>
                            <span className={`flex items-center gap-1 ${hospital.open ? 'text-green-400' : 'text-red-400'}`}>
                              <Clock className="w-2.5 h-2.5" />
                              {hospital.open ? 'Open' : 'Closed'}
                            </span>
                          </div>

                          {selectedHospital === index && (
                            <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-[11px] font-semibold transition-colors">
                                <Navigation className="w-3 h-3" />
                                Navigate
                              </button>
                              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 border border-white/5 text-[11px] font-semibold transition-colors">
                                <Phone className="w-3 h-3" />
                                Call Hospital
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { label: 'Rounded Corners', value: '12-16px radius' },
            { label: 'Box Shadows', value: 'Soft glow effects' },
            { label: 'Transitions', value: '300-500ms ease' },
          ].map((note) => (
            <div key={note.label} className="text-center p-4 rounded-xl bg-dark-800 border border-white/5">
              <div className="text-sm font-semibold text-red-400">{note.label}</div>
              <div className="text-xs text-gray-500 mt-1">{note.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
