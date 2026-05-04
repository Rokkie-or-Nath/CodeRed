import { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Phone, Star, Clock, Navigation, AlertTriangle, Layers, Crosshair, X, ChevronUp, ChevronDown, Search, User, GitFork, ExternalLink, Code2, Globe, Maximize, Minimize } from 'lucide-react';

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const ORS_KEY = import.meta.env.VITE_ORS_KEY;

interface Hospital {
  name: string;
  distance: string;
  distanceRaw: number;
  phone: string;
  open: boolean | null;
  website: string | null;
  address: string | null;
  emergency: boolean | null;
  wheelchair: string | null;
  beds: string | null;
  speciality: string | null;
  operator: string | null;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showFsPanel, setShowFsPanel] = useState(true);
  const fullscreenMapContainer = useRef<HTMLDivElement>(null);
  const fullscreenMap = useRef<maplibregl.Map | null>(null);

  const routeAnimRef = useRef<number | null>(null);

  const activeRouteCoords = useRef<[number, number][] | null>(null);

  const removeRouteLayers = (m: maplibregl.Map) => {
    ['route-dash', 'route', 'route-glow'].forEach(id => { if (m.getLayer(id)) m.removeLayer(id); });
    if (m.getSource('route')) m.removeSource('route');
  };

  const addRouteLayers = (m: maplibregl.Map, firstCoord: [number, number]) => {
    if (m.getSource('route')) return;
    m.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [firstCoord] }, properties: {} } });
    m.addLayer({ id: 'route-glow', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#f87171', 'line-width': 12, 'line-opacity': 0.25, 'line-blur': 4 } });
    m.addLayer({ id: 'route', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#ef4444', 'line-width': 4, 'line-opacity': 0.95 } });
    m.addLayer({ id: 'route-dash', type: 'line', source: 'route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 1.5, 'line-opacity': 0.45, 'line-dasharray': [4, 6] } });
  };

  const clearRoute = useCallback(() => {
    if (routeAnimRef.current) { cancelAnimationFrame(routeAnimRef.current); routeAnimRef.current = null; }
    activeRouteCoords.current = null;
    if (map.current) removeRouteLayers(map.current);
    if (fullscreenMap.current) removeRouteLayers(fullscreenMap.current);
    setActiveRoute(null);
  }, []);

  const animateRoute = useCallback((allCoords: [number, number][]) => {
    if (routeAnimRef.current) cancelAnimationFrame(routeAnimRef.current);
    const total = allCoords.length;
    let drawn = 1;
    const step = Math.max(1, Math.floor(total / 90));
    const tick = () => {
      drawn = Math.min(drawn + step, total);
      const partial = allCoords.slice(0, drawn);
      const geom = { type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: partial }, properties: {} };
      (map.current?.getSource('route') as maplibregl.GeoJSONSource | undefined)?.setData(geom);
      (fullscreenMap.current?.getSource('route') as maplibregl.GeoJSONSource | undefined)?.setData(geom);
      if (drawn < total) routeAnimRef.current = requestAnimationFrame(tick);
    };
    routeAnimRef.current = requestAnimationFrame(tick);
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
      const allCoords: [number, number][] = data.features[0].geometry.coordinates;

      activeRouteCoords.current = allCoords;
      addRouteLayers(map.current, allCoords[0]);
      if (fullscreenMap.current) addRouteLayers(fullscreenMap.current, allCoords[0]);

      const bounds = allCoords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(allCoords[0], allCoords[0])
      );
      map.current.fitBounds(bounds, { padding: 60, duration: 1200 });
      if (fullscreenMap.current) fullscreenMap.current.fitBounds(bounds, { padding: 60, duration: 1200 });
      setActiveRoute(index);
      setTimeout(() => animateRoute(allCoords), 1300);
    } catch {
      setError('Failed to fetch route. Try again.');
    } finally {
      setRouteLoading(false);
    }
  }, [clearRoute, animateRoute]); // eslint-disable-line

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

    return () => { 
      if (hospitalBuildingInterval.current) clearInterval(hospitalBuildingInterval.current);
      map.current?.remove(); 
      map.current = null; 
    };
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

        // Build initial results from Geoapify
        const geoResults = (data.features ?? []).filter((f: any) => f.properties?.name).map((f: any) => {
          const p = f.properties;
          // coordinates are [lon, lat] in GeoJSON geometry
          const fLon = f.geometry?.coordinates?.[0] ?? p.lon;
          const fLat = f.geometry?.coordinates?.[1] ?? p.lat;
          const dist = Math.sqrt((fLat - lat) ** 2 + (fLon - lon) ** 2) * 111;
          const addr = [p.address_line1, p.address_line2].filter(Boolean).join(', ');
          const raw = p.datasource?.raw ?? {};
          return {
            name: p.name,
            distance: `${dist.toFixed(1)} km`,
            distanceRaw: dist,
            phone: raw['contact:phone'] || raw.phone || 'N/A',
            open: p.opening_hours ? true : null,
            website: raw.website || null,
            address: addr || null,
            emergency: raw.emergency === 'yes' ? true : raw.emergency === 'no' ? false : null,
            wheelchair: raw.wheelchair || null,
            beds: raw.beds || null,
            speciality: raw['healthcare:speciality'] || null,
            operator: raw.operator || null,
            lat: fLat,
            lon: fLon,
          };
        }).sort((a: Hospital, b: Hospital) => a.distanceRaw - b.distanceRaw);

        // Enrich with Overpass: fetch stars + extra tags per hospital
        try {
          const overpassParts = geoResults.slice(0, 30).map((h: Hospital) =>
            `node(around:100,${h.lat},${h.lon})[amenity=hospital];`
          ).join('');
          const overpassQuery = `[out:json][timeout:20];(${overpassParts});out tags;`;
          const ovRes = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST', body: overpassQuery,
          });
          const ovData = await ovRes.json();

          // Build a lookup: match by proximity to each hospital
          const ovNodes: any[] = ovData.elements || [];
          geoResults.forEach((h: Hospital) => {
            const match = ovNodes.find((n: any) => {
              const d = Math.sqrt((n.lat - h.lat) ** 2 + (n.lon - h.lon) ** 2) * 111;
              return d < 0.15;
            });
            if (!match) return;
            const t = match.tags || {};
            if (!h.phone || h.phone === 'N/A') h.phone = t['contact:phone'] || t.phone || 'N/A';
            if (!h.website) h.website = t.website || null;
            if (!h.beds) h.beds = t.beds || null;
            if (!h.speciality) h.speciality = t['healthcare:speciality'] || null;
            if (!h.operator) h.operator = t.operator || null;
            if (h.wheelchair === null) h.wheelchair = t.wheelchair || null;
            if (h.emergency === null && t.emergency) h.emergency = t.emergency === 'yes';
          });
        } catch { /* silently fail */ }

        const results: Hospital[] = geoResults;

        setHospitals(results);

        // Light up actual hospital buildings via Overpass
        if (map.current?.isStyleLoaded()) {
          addHospitalBuildingGlow(map.current, results);
        } else {
          map.current?.once('load', () => addHospitalBuildingGlow(map.current!, results));
        }

        // Add traffic layer
        if (map.current?.isStyleLoaded()) {
          addTrafficLayer(map.current);
        } else {
          map.current?.once('load', () => addTrafficLayer(map.current!));
        }

        hospitalMarkers.current.forEach(m => m.remove());
        hospitalMarkers.current = results.map((h, i) => {
          const hEl = document.createElement('div');
          hEl.style.cssText = 'width:32px;height:32px;border-radius:8px;background:#dc2626;border:1px solid rgba(248,113,113,0.5);box-shadow:0 0 12px rgba(220,38,38,0.6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:white;font-family:sans-serif;cursor:pointer;';
          hEl.textContent = `${i + 1}`;
          hEl.addEventListener('click', () => {
            setSelectedHospital(prev => prev === i ? null : i);
            setSheetOpen(true);
          });
          return new maplibregl.Marker({ element: hEl, anchor: 'bottom' })
            .setLngLat([h.lon, h.lat])
            .addTo(map.current!);
        });

        setLoading(false);
      },
      () => { setError('Location access denied.'); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const hospitalBuildingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const addHospitalBuildingGlow = useCallback(async (mapInstance: maplibregl.Map, hospitalList: Hospital[]) => {
    // Clear previous
    ['hospital-buildings-glow', 'hospital-buildings'].forEach(id => {
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    });
    if (mapInstance.getSource('hospital-buildings')) mapInstance.removeSource('hospital-buildings');
    if (hospitalBuildingInterval.current) clearInterval(hospitalBuildingInterval.current);

    // Build Overpass query to fetch building footprints near each hospital
    const unionParts = hospitalList.slice(0, 20).map(
      h => `node(around:80,${h.lat},${h.lon})[amenity=hospital];way(around:80,${h.lat},${h.lon})[amenity=hospital];way(around:80,${h.lat},${h.lon})[building][name];`
    ).join('');

    const query = `[out:json][timeout:25];(${unionParts});out body;>;out skel qt;`;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
      });
      const osm = await res.json();

      // Build a node lookup
      const nodeMap: Record<number, [number, number]> = {};
      osm.elements.forEach((el: any) => {
        if (el.type === 'node') nodeMap[el.id] = [el.lon, el.lat];
      });

      // Convert OSM ways to GeoJSON polygons
      const features: GeoJSON.Feature[] = [];
      osm.elements.forEach((el: any) => {
        if (el.type === 'way' && el.nodes) {
          const coords = el.nodes.map((nid: number) => nodeMap[nid]).filter(Boolean);
          if (coords.length >= 3) {
            // Close the ring
            if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
              coords.push(coords[0]);
            }
            features.push({
              type: 'Feature',
              geometry: { type: 'Polygon', coordinates: [coords] },
              properties: { name: el.tags?.name || 'Hospital' },
            });
          }
        }
      });

      if (features.length === 0) return;

      mapInstance.addSource('hospital-buildings', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features },
      });

      // Outer glow layer (wider, semi-transparent)
      mapInstance.addLayer({
        id: 'hospital-buildings-glow',
        type: 'fill-extrusion',
        source: 'hospital-buildings',
        paint: {
          'fill-extrusion-color': '#ff2020',
          'fill-extrusion-height': 60,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.25,
        },
      });

      // Core building layer
      mapInstance.addLayer({
        id: 'hospital-buildings',
        type: 'fill-extrusion',
        source: 'hospital-buildings',
        paint: {
          'fill-extrusion-color': '#ef4444',
          'fill-extrusion-height': 40,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.9,
        },
      });

      // Animate pulsing glow by oscillating opacity
      let opacityUp = false;
      let opacity = 0.25;
      hospitalBuildingInterval.current = setInterval(() => {
        if (!mapInstance.getLayer('hospital-buildings-glow')) {
          clearInterval(hospitalBuildingInterval.current!);
          return;
        }
        opacity = opacityUp ? opacity + 0.012 : opacity - 0.012;
        if (opacity >= 0.55) opacityUp = false;
        if (opacity <= 0.15) opacityUp = true;
        mapInstance.setPaintProperty('hospital-buildings-glow', 'fill-extrusion-opacity', opacity);
        mapInstance.setPaintProperty('hospital-buildings-glow', 'fill-extrusion-height', 55 + (opacity - 0.15) * 40);
      }, 40);

    } catch { /* silently fail if Overpass is unavailable */ }
  }, []);

  const addTrafficLayer = useCallback((mapInstance: maplibregl.Map) => {
    ['traffic-flow', 'traffic-flow-glow', 'traffic-stripes', 'traffic-stripes-light'].forEach(id => {
      if (mapInstance.getLayer(id)) mapInstance.removeLayer(id);
    });
    if (mapInstance.getSource('traffic-roads')) mapInstance.removeSource('traffic-roads');

    const style = mapInstance.getStyle();
    const roadSource = style?.sources && Object.keys(style.sources).find(
      k => k.includes('geoapify') || k.includes('openmaptiles') || k.includes('composite') || k.includes('maptiler')
    );

    if (!roadSource) return;

    const roadFilter = ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'trunk', 'motorway']]];

    // Outer amber glow — heavy traffic feel
    mapInstance.addLayer({
      id: 'traffic-flow-glow',
      type: 'line',
      source: roadSource,
      'source-layer': 'transportation',
      filter: roadFilter,
      paint: {
        'line-color': ['step', ['zoom'], 'rgba(0,0,0,0)', 9, '#f97316'],
        'line-width': ['interpolate', ['linear'], ['zoom'], 9, 4, 14, 10, 18, 18],
        'line-opacity': 0.18,
        'line-blur': 3,
      },
      layout: { 'line-join': 'round', 'line-cap': 'round' },
    });

    // Core traffic line — amber/orange solid
    mapInstance.addLayer({
      id: 'traffic-flow',
      type: 'line',
      source: roadSource,
      'source-layer': 'transportation',
      filter: roadFilter,
      paint: {
        'line-color': ['step', ['zoom'], 'rgba(0,0,0,0)', 9, '#fb923c'],
        'line-width': ['interpolate', ['linear'], ['zoom'], 9, 1.5, 14, 3.5, 18, 6],
        'line-opacity': 0.75,
        'line-dasharray': [3, 2],
      },
      layout: { 'line-join': 'round', 'line-cap': 'round' },
    });
  }, []);

  // Satellite toggle — re-add custom layers after style reload
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(
      showSatellite
        ? `https://maps.geoapify.com/v1/styles/satellite/style.json?apiKey=${GEOAPIFY_KEY}`
        : `https://maps.geoapify.com/v1/styles/dark-matter/style.json?apiKey=${GEOAPIFY_KEY}`
    );
    map.current.once('styledata', () => {
      if (hospitals.length > 0) addHospitalBuildingGlow(map.current!, hospitals);
      addTrafficLayer(map.current!);
    });
  }, [showSatellite, hospitals, addHospitalBuildingGlow, addTrafficLayer]);

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

  // Fullscreen map init
  useEffect(() => {
    if (!fullscreen || !fullscreenMapContainer.current) return;
    if (fullscreenMap.current) return;

    const center = map.current?.getCenter();
    const zoom = map.current?.getZoom() ?? 14;
    const pitch = map.current?.getPitch() ?? 45;
    const style = showSatellite
      ? `https://maps.geoapify.com/v1/styles/satellite/style.json?apiKey=${GEOAPIFY_KEY}`
      : `https://maps.geoapify.com/v1/styles/dark-matter/style.json?apiKey=${GEOAPIFY_KEY}`;

    fullscreenMap.current = new maplibregl.Map({
      container: fullscreenMapContainer.current,
      style,
      center: center ?? [0, 0],
      zoom,
      pitch,
      bearing: 0,
    });

    // Re-add hospital markers + existing route
    fullscreenMap.current.on('load', () => {
      if (activeRouteCoords.current) {
        addRouteLayers(fullscreenMap.current!, activeRouteCoords.current[0]);
        const coords = activeRouteCoords.current;
        const geom = { type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: coords }, properties: {} };
        (fullscreenMap.current!.getSource('route') as maplibregl.GeoJSONSource).setData(geom);
      }
      if (hospitals.length > 0) addHospitalBuildingGlow(fullscreenMap.current!, hospitals);
      addTrafficLayer(fullscreenMap.current!);
      hospitals.forEach((h, i) => {
        const hEl = document.createElement('div');
        hEl.style.cssText = 'width:32px;height:32px;border-radius:8px;background:#dc2626;border:1px solid rgba(248,113,113,0.5);box-shadow:0 0 12px rgba(220,38,38,0.6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:white;font-family:sans-serif;cursor:pointer;';
        hEl.textContent = `${i + 1}`;
        hEl.addEventListener('click', () => {
          setSelectedHospital(prev => prev === i ? null : i);
          setShowFsPanel(true);
        });
        new maplibregl.Marker({ element: hEl, anchor: 'bottom' })
          .setLngLat([h.lon, h.lat])
          .addTo(fullscreenMap.current!);
      });
      if (location) {
        const el = document.createElement('div');
        el.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 12px rgba(59,130,246,0.9);';
        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([location.lon, location.lat])
          .addTo(fullscreenMap.current!);
      }
    });

    return () => {};
  }, [fullscreen]);

  // Cleanup fullscreen map on close
  useEffect(() => {
    if (!fullscreen && fullscreenMap.current) {
      fullscreenMap.current.remove();
      fullscreenMap.current = null;
    }
  }, [fullscreen]);

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hospitalItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (selectedHospital === null) return;
    hospitalItemRefs.current[selectedHospital]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedHospital]);

  const HospitalList = () => (
    <div className="space-y-3">
      {loading && <p className="text-xs text-gray-500">Searching...</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
      {filteredHospitals.map((hospital, index) => {
        const realIndex = hospitals.indexOf(hospital);
        return (
        <div
          key={index}
          ref={el => { hospitalItemRefs.current[realIndex] = el; }}
          onClick={() => setSelectedHospital(selectedHospital === realIndex ? null : realIndex)}
          className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
            selectedHospital === realIndex
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-dark-800/50 border-white/5 hover:border-white/10'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 pr-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600/80 text-white text-[9px] font-bold flex items-center justify-center">
                {hospitals.indexOf(hospital) + 1}
              </span>
              <h4 className="text-xs font-semibold leading-tight">{hospital.name}</h4>
            </div>
            {hospital.open !== null && <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-1">
            <span className="flex items-center gap-1"><Navigation className="w-2.5 h-2.5" />{hospital.distance}</span>
            {hospital.open !== null && (
              <span className="flex items-center gap-1 text-green-400"><Clock className="w-2.5 h-2.5" />Open</span>
            )}
            {hospital.emergency === true && (
              <span className="flex items-center gap-1 text-red-400">🚨 ER</span>
            )}
          </div>
          {selectedHospital === realIndex && (
            <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
              {hospital.address && <p className="text-[10px] text-gray-400">📍 {hospital.address}</p>}
              {hospital.operator && <p className="text-[10px] text-gray-400">🏢 {hospital.operator}</p>}
              {hospital.speciality && <p className="text-[10px] text-gray-400">🩺 {hospital.speciality}</p>}
              {hospital.beds && <p className="text-[10px] text-gray-400">🛏 {hospital.beds} beds</p>}
              {hospital.wheelchair && <p className="text-[10px] text-gray-400">♿ Wheelchair: {hospital.wheelchair}</p>}
              {hospital.website && (
                <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 underline block truncate">🌐 {hospital.website}</a>
              )}
              <div className="pt-1 space-y-2">
              <button
                onClick={(e) => { e.stopPropagation(); location && navigateTo(hospital, realIndex, location); }}
                disabled={routeLoading}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[11px] font-semibold transition-colors"
              >
                <Navigation className="w-3 h-3" />
                {routeLoading && activeRoute === realIndex ? 'Routing...' : 'Navigate'}
              </button>
              {activeRoute === realIndex && (
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
            </div>
          )}
        </div>
        );
      })}
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
        <div className="relative max-w-7xl mx-auto">
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
                {['Home', 'Map'].map((item, i) => (
                  <span key={item} className={`text-xs font-medium ${i === 1 ? 'text-red-400' : 'text-gray-500'}`}>{item}</span>
                ))}
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  Profile
                </button>
              </div>
            </div>

            {/* Desktop: side-by-side | Mobile: map full + bottom sheet */}
            <div className="relative flex flex-col sm:flex-row h-[600px] sm:h-[650px]">

              {/* Desktop Sidebar — hidden on mobile */}
              <div className="hidden sm:flex w-64 bg-dark-900/95 border-r border-white/5 overflow-y-auto z-10 flex-shrink-0 flex-col">
                <div className="p-4">
                  <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Nearby Hospitals
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {loading ? 'Searching...' : error ? error : `${hospitals.length} hospitals found within 50km`}
                  </p>
                  {/* Search bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search hospitals..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg bg-dark-700 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        <X className="w-3 h-3 text-gray-500 hover:text-white" />
                      </button>
                    )}
                  </div>
                  <HospitalList />
                </div>
              </div>

              {/* Profile Modal */}
              {showProfile && (
                <div className="absolute inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                  <div className="relative w-[300px] bg-dark-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
                    <button
                      onClick={() => setShowProfile(false)}
                      className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {/* Banner with profile image background */}
                    <div className="h-20 relative overflow-hidden">
                      <img
                        src="/profile.jpg"
                        alt="banner"
                        className="absolute inset-0 w-full h-full object-cover scale-110"
                        style={{ filter: 'blur(6px) brightness(0.35)', objectPosition: 'center top' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/90" />
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg,#dc2626 0,#dc2626 1px,transparent 0,transparent 50%)', backgroundSize: '8px 8px' }} />
                    </div>

                    <div className="px-5 pb-5">
                      <div className="-mt-12 mb-3 flex items-end justify-between">
                        {/* Video avatar — face cropped to center */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                          {/* Animated ring */}
                          <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '3s', background: 'conic-gradient(from 0deg, #ef4444, #dc2626, transparent, transparent)' }} />
                          <div className="absolute inset-[3px] rounded-full border-2 border-dark-900" />
                          {/* Pulse glow */}
                          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                          {/* Profile image clipped to circle */}
                          <div className="absolute inset-[3px] rounded-full overflow-hidden">
                            <img
                              src="/profile.jpg"
                              alt="Rokkie"
                              className="w-full h-full object-cover"
                              style={{ objectPosition: 'center 20%' }}
                            />
                          </div>
                        </div>
                        <a
                          href="https://github.com/Rokkie-or-Nath"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-[11px] font-semibold text-gray-300 hover:text-white transition-all"
                        >
                          <GitFork className="w-3 h-3" />
                          GitHub
                        </a>
                      </div>

                      <h3 className="text-base font-bold text-white">Rokkie</h3>
                      <p className="text-xs text-red-400 font-medium mb-1">@Rokkie-or-Nath</p>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        Developer & designer of CodeRed — an emergency hospital locator built with MapLibre GL, Geoapify, and React.
                      </p>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                          { label: 'Project', value: 'CodeRed' },
                          { label: 'Stack',   value: 'React' },
                          { label: 'Role',    value: 'Full Dev' },
                        ].map((s) => (
                          <div key={s.label} className="text-center p-2 rounded-lg bg-white/5 border border-white/5">
                            <div className="text-[11px] font-bold text-white">{s.value}</div>
                            <div className="text-[9px] text-gray-500">{s.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {['MapLibre GL', 'Geoapify', 'ORS', 'TypeScript', 'Tailwind'].map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-medium text-red-300">{t}</span>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2">
                        <a
                          href="https://github.com/Rokkie-or-Nath/CodeRed"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Code2 className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs font-medium text-gray-300 group-hover:text-white">CodeRed Repository</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-red-400" />
                        </a>
                        <a
                          href="https://github.com/Rokkie-or-Nath"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs font-medium text-gray-300 group-hover:text-white">GitHub Profile</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-red-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Map — full width on mobile */}
              <div className="relative flex-1">
                <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />

                {(loading || (!location && error)) && (
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
                  <button
                    onClick={() => setFullscreen(true)}
                    className="w-10 h-10 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>

                  {/* Fullscreen Overlay */}
                  {fullscreen && (
                    <div className="fixed inset-0 z-[9999] bg-black flex">
                      {/* Collapsible hospital panel */}
                      <div className={`relative z-[10000] flex-shrink-0 bg-dark-900/95 border-r border-white/10 flex flex-col transition-all duration-300 overflow-hidden ${showFsPanel ? 'w-72' : 'w-0'}`}>
                        <div className="p-4 flex flex-col h-full overflow-y-auto">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-red-400" />
                              Nearby Hospitals
                              <span className="text-xs text-gray-500 font-normal">({hospitals.length})</span>
                            </h3>
                            <button onClick={() => setShowFsPanel(false)}>
                              <X className="w-4 h-4 text-gray-400 hover:text-white" />
                            </button>
                          </div>
                          <div className="relative mb-3">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search hospitals..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 rounded-lg bg-dark-700 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                            />
                            {searchQuery && (
                              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                <X className="w-3 h-3 text-gray-500 hover:text-white" />
                              </button>
                            )}
                          </div>
                          <HospitalList />
                        </div>
                      </div>

                      {/* Map fills remaining space */}
                      <div className="relative flex-1">
                        <div ref={fullscreenMapContainer} style={{ width: '100%', height: '100%' }} />

                        {/* Top-left: toggle panel button */}
                        <div className="absolute top-4 left-4 z-[10000]">
                          <button
                            onClick={() => setShowFsPanel(!showFsPanel)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 text-xs font-semibold text-white hover:text-red-400 transition-colors"
                            title={showFsPanel ? 'Hide hospitals' : 'Show hospitals'}
                          >
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
                            {showFsPanel ? 'Hide' : 'Hospitals'}
                          </button>
                        </div>

                        {/* Top-right controls */}
                        <div className="absolute top-4 right-4 z-[10000] flex flex-col gap-2">
                          <button
                            onClick={() => setShowSatellite(!showSatellite)}
                            className="w-10 h-10 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            title="Toggle satellite"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (fullscreenMap.current && location) fullscreenMap.current.flyTo({ center: [location.lon, location.lat], zoom: 14, pitch: 45, duration: 1000 }); }}
                            className="w-10 h-10 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            title="Recenter"
                          >
                            <Crosshair className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setFullscreen(false)}
                            className="w-10 h-10 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            title="Exit fullscreen"
                          >
                            <Minimize className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Emergency button */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[10000]">
                          <button
                            onClick={handleEmergency}
                            disabled={!location || hospitals.length === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-full shadow-2xl shadow-red-600/40 text-sm font-bold transition-all emergency-pulse"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            EMERGENCY
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile: Hospitals toggle button */}
                <div className="absolute top-4 left-4 z-[1000] sm:hidden">
                  <button
                    onClick={() => setSheetOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-dark-700/90 backdrop-blur border border-white/10 text-xs font-semibold text-white"
                  >
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {hospitals.length > 0 ? `Hospitals (${hospitals.length})` : 'Hospitals'}
                    {sheetOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Emergency Button */}
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] ${fullscreen ? 'hidden' : ''}`}>
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
                    <div className="relative mb-3">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search hospitals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-dark-700 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition-colors"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          <X className="w-3 h-3 text-gray-500 hover:text-white" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {loading && <p className="text-xs text-gray-500">Searching...</p>}
                      {error && <p className="text-xs text-red-400">{error}</p>}
                      {filteredHospitals.map((hospital) => {
                        const realIndex = hospitals.indexOf(hospital);
                        return (
                          <div
                            key={realIndex}
                            ref={el => { hospitalItemRefs.current[realIndex] = el; }}
                            onClick={() => setSelectedHospital(selectedHospital === realIndex ? null : realIndex)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                              selectedHospital === realIndex
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-dark-800/50 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 pr-2">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-600/80 text-white text-[9px] font-bold flex items-center justify-center">
                                  {realIndex + 1}
                                </span>
                                <h4 className="text-xs font-semibold leading-tight">{hospital.name}</h4>
                              </div>
                              {hospital.open !== null && <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-gray-500 mb-1">
                              <span className="flex items-center gap-1"><Navigation className="w-2.5 h-2.5" />{hospital.distance}</span>
                              {hospital.open !== null && (
                                <span className="flex items-center gap-1 text-green-400"><Clock className="w-2.5 h-2.5" />Open</span>
                              )}
                              {hospital.emergency === true && (
                                <span className="flex items-center gap-1 text-red-400">🚨 ER</span>
                              )}
                            </div>
                            {selectedHospital === realIndex && (
                              <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                                {hospital.address && <p className="text-[10px] text-gray-400">📍 {hospital.address}</p>}
                                {hospital.operator && <p className="text-[10px] text-gray-400">🏢 {hospital.operator}</p>}
                                {hospital.speciality && <p className="text-[10px] text-gray-400">🩺 {hospital.speciality}</p>}
                                {hospital.beds && <p className="text-[10px] text-gray-400">🛏 {hospital.beds} beds</p>}
                                {hospital.wheelchair && <p className="text-[10px] text-gray-400">♿ Wheelchair: {hospital.wheelchair}</p>}
                                {hospital.website && (
                                  <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 underline block truncate">🌐 {hospital.website}</a>
                                )}
                                <div className="pt-1 space-y-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); location && navigateTo(hospital, realIndex, location); }}
                                  disabled={routeLoading}
                                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[11px] font-semibold transition-colors"
                                >
                                  <Navigation className="w-3 h-3" />
                                  {routeLoading && activeRoute === realIndex ? 'Routing...' : 'Navigate'}
                                </button>
                                {activeRoute === realIndex && (
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
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
