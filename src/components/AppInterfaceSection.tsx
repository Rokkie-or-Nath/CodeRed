import { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Phone, Star, Clock, Navigation, AlertTriangle, Layers, Crosshair, X, ChevronUp, ChevronDown } from 'lucide-react';

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const ORS_KEY = import.meta.env.VITE_ORS_KEY;

interface Hospital {
  name: string;
  distance: string;
  distanceRaw: number;
  phone: string;
  open: boolean | null;
  lat: number;
  lon: number;
}

export default function AppInterfaceSection() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);
  const hospitalMarkers = useRef<maplibregl.Marker[]>([]);
  const locationFetched = useRef(false);

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSatellite, setShowSatellite] = useState(false);
  const [activeRoute, setActiveRoute] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const clearRoute = useCallback(() => {
    if (!map.current) return;
    if (map.current.getLayer('route-glow')) map.current.removeLayer('route-glow');
    if (map.current.getLayer('route')) map.current.removeLayer('route');
    if (map.current.getSource('route')) map.current.removeSource('route');
    setActiveRoute(null);
  }, []);

  const navigateTo = useCallback(async (hospital: Hospital, index: number, userLoc: { lat: number; lon: number }) => {
    if (!map.current) return;
    setRouteLoading(true);
    setSheetOpen(false);
    clearRoute();

    try {
      const res = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
        method: 'POST',
        headers: { 'Authorization': ORS_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinates: [[userLoc.lon, userLoc.lat], [hospital.lon, hospital.lat]],
          preference: 'fastest',
          options: { avoid_features: ['tollways'] },
        }),
      });

      const data = await res.json();
      const routeGeoJSON = data.features[0];

      if (map.current.getSource('route')) {
        (map.current.getSource('route') as maplibregl.GeoJSONSource).setData(routeGeoJSON);
      } else {
        map.current.addSource('route', { type: 'geojson', data: routeGeoJSON });
        map.current.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#f87171', 'line-width': 10, 'line-opacity': 0.3 },
        });
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ef4444', 'line-width': 4, 'line-opacity': 0.95 },
        });
      }

      const coords = routeGeoJSON.geometry.coordinates;
      const bounds = coords.reduce(
        (b: maplibregl.LngLatBounds, c: [number, number]) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.current.fitBounds(bounds, { padding: 60, duration: 1200 });
      setActiveRoute(index);
    } catch {
      setError('Failed to fetch route. Try again.');
    } finally {
      setRouteLoading(false);
    }
  }, [clearRoute]);

  const recenter = useCallback(() => {
    if (!map.current || !location) return;
    map.current.flyTo({ center: [location.lon, location.lat], zoom: 14, pitch: 45, bearing: 0, duration: 1000 });
  }, [location]);

  // Init map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geoapify.com/v1/styles/dark-matter/style.json?apiKey=${GEOAPIFY_KEY}`,
      center: [0, 0],
      zoom: 2,
      pitch: 45,
      bearing: 0,
      antialias: true,
    });

    map.current.on('load', () => {
      map.current!.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#1a1a2e',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.7,
        },
      });
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // Get location + hospitals
  useEffect(() => {
    if (locationFetched.current) return;
    locationFetched.current = true;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });

        map.current?.flyTo({ center: [lon, lat], zoom: 14, pitch: 45, duration: 1500 });

        if (userMarker.current) { userMarker.current.remove(); userMarker.current = null; }

        const el = document.createElement('div');
        el.style.cssText = 'position:relative;width:20px;height:20px;';
        el.innerHTML = `
          <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(59,130,246,0.25);animation:userPulse 2s ease-out infinite;"></div>
          <div style="position:absolute;inset:-4px;border-radius:50%;background:rgba(59,130,246,0.15);animation:userPulse 2s ease-out infinite 0.5s;"></div>
          <div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 12px rgba(59,130,246,0.9);position:relative;z-index:1;"></div>
        `;

        if (!document.getElementById('pulse-style')) {
          const style = document.createElement('style');
          style.id = 'pulse-style';
          style.textContent = `@keyframes userPulse { 0% { transform:scale(1);opacity:0.8; } 100% { transform:scale(2.5);opacity:0; } }`;
          document.head.appendChild(style);
        }

        userMarker.current = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lon, lat])
          .setPopup(new maplibregl.Popup({ offset: 20 }).setText('You are here'))
          .addTo(map.current!);

        const res = await fetch(
          `https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:${lon},${lat},50000&limit=100&apiKey=${GEOAPIFY_KEY}`
        );
        const data = await res.json();

        const results: Hospital[] = data.features.map((f: any) => {
          const p = f.properties;
          const dist = Math.sqrt((p.lat - lat) ** 2 + (p.lon - lon) ** 2) * 111;
          return {
            name: p.name || 'Unknown Hospital',
            distance: `${dist.toFixed(1)} km`,
            distanceRaw: dist,
            phone: p.contact?.phone || 'N/A',
            open: p.opening_hours ? true : null,
            lat: p.lat,
            lon: p.lon,
          };
        });

        setHospitals(results);

        hospitalMarkers.current.forEach(m => m.remove());
        hospitalMarkers.current = results.map((h) => {
          const hEl = document.createElement('div');
          hEl.style.cssText = 'width:32px;height:32px;border-radius:8px;background:#dc2626;border:1px solid rgba(248,113,113,0.5);box-shadow:0 0 12px rgba(220,38,38,0.6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:white;font-family:sans-serif;cursor:pointer;';
          hEl.textContent = 'H';
          return new maplibregl.Marker({ element: hEl, anchor: 'bottom' })
            .setLngLat([h.lon, h.lat])
            .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(`<strong>${h.name}</strong><br/>${h.distance}`))
            .addTo(map.current!);
        });

        setLoading(false);
      },
      () => { setError('Location access denied.'); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Satellite toggle
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(
      showSatellite
        ? `https://maps.geoapify.com/v1/styles/satellite/style.json?apiKey=${GEOAPIFY_KEY}`
        : `https://maps.geoapify.com/v1/styles/dark-matter/style.json?apiKey=${GEOAPIFY_KEY}`
    );
  }, [showSatellite]);

  const handleEmergency = useCallback(() => {
    if (!location || hospitals.length === 0) return;
    const nearest = hospitals.reduce((a, b) => a.distanceRaw < b.distanceRaw ? a : b);
    const nearestIndex = hospitals.indexOf(nearest);
    setSelectedHospital(nearestIndex);
    setSheetOpen(true);
    map.current?.flyTo({ center: [nearest.lon, nearest.lat], zoom: 15, pitch: 60, duration: 1200 });
    navigateTo(nearest, nearestIndex, location);
  }, [location, hospitals, navigateTo]);

  useEffect(() => {
    (window as any).__pulsePointEmergency = handleEmergency;
    return () => { delete (window as any).__pulsePointEmergency; };
  }, [handleEmergency]);

  const HospitalList = () => (
    <div className="space-y-3">
      {loading && <p className="text-xs text-gray-500">Searching...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
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
            <h4 className="text-xs font-semibold leading-tight pr-2">{hospital.name}</h4>
            {hospital.open !== null && <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><Navigation className="w-2.5 h-2.5" />{hospital.distance}</span>
            {hospital.open !== null && (
              <span className="flex items-center gap-1 text-green-400"><Clock className="w-2.5 h-2.5" />Open</span>
            )}
          </div>
          {selectedHospital === index && (
            <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
              <button
                onClick={(e) => { e.stopPropagation(); location && navigateTo(hospital, index, location); }}
                disabled={routeLoading}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[11px] font-semibold transition-colors"
              >
                <Navigation className="w-3 h-3" />
                {routeLoading && activeRoute === index ? 'Routing...' : 'Navigate'}
              </button>
              {activeRoute === index && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearRoute(); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 border border-white/5 text-[11px] font-semibold transition-colors"
                >
                  <X className="w-3 h-3" />Clear Route
                </button>
              )}
              {hospital.phone !== 'N/A' && (
                <a
                  href={`tel:${hospital.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 border border-white/5 text-[11px] font-semibold transition-colors"
                >
                  <Phone className="w-3 h-3" />{hospital.phone}
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

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
                <span className="text-sm font-semibold">Code<span className="text-red-400">Red</span></span>
              </div>
              <div className="flex items-center gap-4">
                {['Home', 'Map', 'Profile'].map((item, i) => (
                  <span key={item} className={`text-xs font-medium ${i === 1 ? 'text-red-400' : 'text-gray-500'}`}>{item}</span>
                ))}
              </div>
            </div>

            {/* Desktop: side-by-side | Mobile: map full + bottom sheet */}
            <div className="relative flex flex-col sm:flex-row h-[600px] sm:h-[500px]">

              {/* Desktop Sidebar — hidden on mobile */}
              <div className="hidden sm:flex w-72 bg-dark-900/95 border-r border-white/5 overflow-y-auto z-10 flex-shrink-0 flex-col">
                <div className="p-4">
                  <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Nearby Hospitals
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    {loading ? 'Searching...' : error ? error : `${hospitals.length} hospitals found within 50km`}
                  </p>
                  <HospitalList />
                </div>
              </div>

              {/* Map — full width on mobile */}
              <div className="relative flex-1">
                <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />

                {!location && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm bg-dark-900/80">
                    {loading ? 'Getting your location...' : error}
                  </div>
                )}

                {/* Map Controls */}
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                  <button
                    onClick={() => setShowSatellite(!showSatellite)}
                    className="w-10 h-10 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    title="Toggle satellite"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    onClick={recenter}
                    className="w-10 h-10 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    title="Recenter"
                  >
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile: Hospitals toggle button */}
                <div className="absolute top-4 left-4 z-[1000] sm:hidden">
                  <button
                    onClick={() => setSheetOpen(!sheetOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 text-xs font-semibold text-white"
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Hospitals
                    {sheetOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Emergency Button */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
                  <button
                    onClick={handleEmergency}
                    disabled={!location || hospitals.length === 0}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-full shadow-2xl shadow-red-600/40 text-sm font-bold transition-all emergency-pulse"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    EMERGENCY
                  </button>
                </div>

                {/* Mobile Bottom Sheet */}
                <div
                  className={`absolute bottom-0 left-0 right-0 z-[2000] sm:hidden bg-dark-900/98 backdrop-blur-xl border-t border-white/10 rounded-t-2xl transition-transform duration-300 ${
                    sheetOpen ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  style={{ maxHeight: '60%', overflowY: 'auto' }}
                >
                  {/* Sheet handle */}
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                  </div>
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-400" />
                        Nearby Hospitals
                        <span className="text-xs text-gray-500 font-normal">({hospitals.length})</span>
                      </h3>
                      <button onClick={() => setSheetOpen(false)}>
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <HospitalList />
                  </div>
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
