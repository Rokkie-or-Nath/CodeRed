import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Phone, Star, Clock, Navigation, AlertTriangle, Layers } from 'lucide-react';

const GEOAPIFY_KEY = '1769eb6c5ae547278c3438ceff0d4636';

const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 8px rgba(59,130,246,0.8)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

const hospitalIcon = L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;border-radius:8px;background:#dc2626;border:1px solid rgba(248,113,113,0.4);box-shadow:0 0 10px rgba(220,38,38,0.5);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:white;font-family:sans-serif">H</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

interface Hospital {
  name: string;
  distance: string;
  phone: string;
  open: boolean | null;
  lat: number;
  lon: number;
}

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lon], 14); }, [lat, lon, map]);
  return null;
}

export default function AppInterfaceSection() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSatellite, setShowSatellite] = useState(false);

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });

        const res = await fetch(
          `https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:${lon},${lat},50000&limit=100&apiKey=${GEOAPIFY_KEY}`
        );
        const data = await res.json();

        const results: Hospital[] = data.features.map((f: any) => {
          const p = f.properties;
          const dLat = p.lat - lat;
          const dLon = p.lon - lon;
          const dist = Math.sqrt(dLat * dLat + dLon * dLon) * 111;
          return {
            name: p.name || 'Unknown Hospital',
            distance: `${dist.toFixed(1)} km`,
            phone: p.contact?.phone || 'N/A',
            open: p.opening_hours ? true : null,
            lat: p.lat,
            lon: p.lon,
          };
        });

        setHospitals(results);
        setLoading(false);
      },
      () => {
        setError('Location access denied. Please allow location access.');
        setLoading(false);
      }
    );
  }, []);

  const tileUrl = showSatellite
    ? `https://maps.geoapify.com/v1/tile/satellite/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`
    : `https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

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

            {/* Map + Sidebar */}
            <div className="relative h-[500px] flex">
              {/* Hospital Sidebar */}
              <div className="w-72 bg-dark-900/95 border-r border-white/5 overflow-y-auto z-10 flex-shrink-0">
                <div className="p-4">
                  <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Nearby Hospitals
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    {loading ? 'Searching...' : error ? error : `${hospitals.length} hospitals found within 50km`}
                  </p>

                  <div className="space-y-3">
                    {hospitals.map((hospital, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedHospital(selectedHospital === index ? null : index)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                          selectedHospital === index
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-dark-800/50 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-xs font-semibold leading-tight">{hospital.name}</h4>
                          {hospital.open !== null && (
                            <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Navigation className="w-2.5 h-2.5" />
                            {hospital.distance}
                          </span>
                          {hospital.open !== null && (
                            <span className="flex items-center gap-1 text-green-400">
                              <Clock className="w-2.5 h-2.5" />
                              Open
                            </span>
                          )}
                        </div>

                        {selectedHospital === index && (
                          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-[11px] font-semibold transition-colors"
                            >
                              <Navigation className="w-3 h-3" />
                              Navigate
                            </a>
                            {hospital.phone !== 'N/A' && (
                              <a
                                href={`tel:${hospital.phone}`}
                                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 border border-white/5 text-[11px] font-semibold transition-colors"
                              >
                                <Phone className="w-3 h-3" />
                                {hospital.phone}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="relative flex-1">
                {location ? (
                  <MapContainer
                    center={[location.lat, location.lon]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={false}
                  >
                    <TileLayer url={tileUrl} attribution="&copy; Geoapify" />
                    <RecenterMap lat={location.lat} lon={location.lon} />
                    <Marker position={[location.lat, location.lon]} icon={userIcon}>
                      <Popup>You are here</Popup>
                    </Marker>
                    {hospitals.map((h, i) => (
                      <Marker key={i} position={[h.lat, h.lon]} icon={hospitalIcon}>
                        <Popup>{h.name}<br />{h.distance}</Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    {loading ? 'Getting your location...' : error}
                  </div>
                )}

                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                  <button
                    onClick={() => setShowSatellite(!showSatellite)}
                    className="w-9 h-9 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>

                {/* Emergency Button */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
                  <button className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 rounded-full shadow-2xl shadow-red-600/40 text-sm font-bold transition-all emergency-pulse">
                    <AlertTriangle className="w-4 h-4" />
                    EMERGENCY
                  </button>
                </div>
              </div>
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
