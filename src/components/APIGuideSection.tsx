import { Key, Code, Database, MapIcon, ExternalLink, ArrowRight, CheckCircle } from 'lucide-react';

const apiSteps = [
  {
    step: 1,
    icon: Key,
    title: 'Get a Geoapify API Key',
    description: 'Geoapify powers the map tiles, dark-matter style, and the hospital places search.',
    details: [
      'Visit geoapify.com and create a free account',
      'Go to Dashboard → Projects → Create a new project',
      'Copy your API key',
      'Free tier: 3,000 requests/day — enough for development',
    ],
    link: { label: 'Geoapify Dashboard', url: 'https://myprojects.geoapify.com/' },
  },
  {
    step: 2,
    icon: MapIcon,
    title: 'Get an OpenRouteService Key',
    description: 'ORS handles turn-by-turn routing from your location to the nearest hospital.',
    details: [
      'Visit openrouteservice.org and sign up for free',
      'Go to Dashboard → Tokens → Request a token',
      'Free tier: 2,000 directions requests/day',
      'Supports driving, walking, and cycling profiles',
    ],
    link: { label: 'ORS Dashboard', url: 'https://openrouteservice.org/dev/#/login' },
  },
  {
    step: 3,
    icon: Code,
    title: 'Add Keys to Your .env File',
    description: 'Store both keys securely in a .env file at the root of your project.',
    codeSnippet: `# .env (never commit this file to Git)
VITE_GEOAPIFY_KEY=your_geoapify_key_here
VITE_ORS_KEY=your_ors_key_here`,
  },
  {
    step: 4,
    icon: Database,
    title: 'Fetch Hospitals via Geoapify Places',
    description: 'Query hospitals within 50km of the user, sorted by nearest distance.',
    codeSnippet: `const res = await fetch(
  \`https://api.geoapify.com/v2/places\` +
  \`?categories=healthcare.hospital\` +
  \`&filter=circle:\${lon},\${lat},50000\` +
  \`&limit=100&apiKey=\${GEOAPIFY_KEY}\`
);
const { features } = await res.json();
const hospitals = features
  .map(f => ({ ...f.properties,
    dist: Math.sqrt((f.properties.lat - lat) ** 2 +
                    (f.properties.lon - lon) ** 2) * 111 }))
  .sort((a, b) => a.dist - b.dist);`,
  },
  {
    step: 5,
    icon: MapIcon,
    title: 'Route to Hospital via ORS',
    description: 'Get a driving route GeoJSON from the user to the selected hospital.',
    codeSnippet: `const res = await fetch(
  'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
  {
    method: 'POST',
    headers: {
      'Authorization': ORS_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [[userLon, userLat], [hospital.lon, hospital.lat]],
      preference: 'fastest',
    }),
  }
);
const route = (await res.json()).features[0];
map.addSource('route', { type: 'geojson', data: route });`,
  },
];

export default function APIGuideSection() {
  return (
    <section id="api" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">API Integration</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Connect Your <span className="text-red-400">APIs</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            CodeRed uses Geoapify for maps & hospital data, and OpenRouteService for navigation.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {apiSteps.map((step, index) => (
            <div key={step.step} className="group">
              <div className="flex gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/20 flex items-center justify-center group-hover:border-red-500/40 transition-all">
                    <step.icon className="w-5 h-5 text-red-400" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-red-500">STEP {step.step}</span>
                    {index < apiSteps.length - 1 && <ArrowRight className="w-3 h-3 text-gray-600" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{step.description}</p>

                  {step.details && (
                    <div className="space-y-2 mb-4">
                      {step.details.map((detail) => (
                        <div key={detail} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {step.link && (
                    <a
                      href={step.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors mb-4"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {step.link.label}
                    </a>
                  )}

                  {step.codeSnippet && (
                    <div className="code-block mt-4">
                      <pre><code className="text-xs text-gray-300">{step.codeSnippet}</code></pre>
                    </div>
                  )}
                </div>
              </div>

              {index < apiSteps.length - 1 && (
                <div className="mt-8 ml-6 sm:ml-8 h-px bg-gradient-to-r from-red-500/20 to-transparent" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { label: 'Geoapify', sub: 'Map tiles + hospital places', url: 'https://geoapify.com' },
            { label: 'OpenRouteService', sub: 'Driving directions & routing', url: 'https://openrouteservice.org' },
            { label: 'Overpass API', sub: 'Hospital building footprints', url: 'https://overpass-api.de' },
          ].map((api) => (
            <a
              key={api.label}
              href={api.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-white/5 hover:border-red-500/30 transition-all group"
            >
              <div>
                <div className="text-sm font-semibold group-hover:text-red-300 transition-colors">{api.label}</div>
                <div className="text-xs text-gray-500">{api.sub}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
