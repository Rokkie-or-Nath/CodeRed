import { Key, Code, Database, ExternalLink, ArrowRight, CheckCircle } from 'lucide-react';

const apiSteps = [
  {
    step: 1,
    icon: Key,
    title: 'Get a Mapbox API Key',
    description: 'Sign up at mapbox.com and navigate to your Account Dashboard → Tokens section.',
    details: [
      'Visit mapbox.com and create a free account',
      'Go to Account → Tokens',
      'Copy your "Default public token"',
      'Free tier includes 50,000 map loads/month',
    ],
  },
  {
    step: 2,
    icon: Code,
    title: 'Insert the API Key',
    description: 'Add your token to the JavaScript initialization code.',
    codeSnippet: `// Replace this line in app.js:
const MAPBOX_TOKEN = 'pk.eyJ1IjoieW91cn...'; // Your token
mapboxgl.accessToken = MAPBOX_TOKEN;`,
  },
  {
    step: 3,
    icon: Database,
    title: 'Fetch Hospital Data',
    description: 'Use the Overpass API (OpenStreetMap) to query nearby hospitals.',
    codeSnippet: `// Overpass API query for hospitals within 5km
const query = \`[out:json];(node["amenity"="hospital"](around:5000,\${lat},\${lng}););out body;\`;
const url = \`https://overpass-api.de/api/interpreter?data=\${encodeURIComponent(query)}\`;
const response = await fetch(url);
const hospitals = (await response.json()).elements;`,
  },
];

export default function APIGuideSection() {
  return (
    <section id="api" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">API Integration</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Connect Your <span className="text-red-400">APIs</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Step-by-step guide to integrate Mapbox and OpenStreetMap data into your app.
          </p>
        </div>

        {/* API Steps */}
        <div className="max-w-4xl mx-auto space-y-8">
          {apiSteps.map((step, index) => (
            <div key={step.step} className="group">
              <div className="flex gap-4 sm:gap-6">
                {/* Step indicator */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/20 flex items-center justify-center group-hover:border-red-500/40 transition-all">
                    <step.icon className="w-5 h-5 text-red-400" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-red-500">STEP {step.step}</span>
                    {index < apiSteps.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-gray-600" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{step.description}</p>

                  {/* Details list */}
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

                  {/* Code snippet */}
                  {step.codeSnippet && (
                    <div className="code-block mt-4">
                      <pre>
                        <code className="text-xs text-gray-300">{step.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              {index < apiSteps.length - 1 && (
                <div className="mt-8 ml-6 sm:ml-8 h-px bg-gradient-to-r from-red-500/20 to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* API Links */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <a
            href="https://account.mapbox.com/auth/signup/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-white/5 hover:border-red-500/30 transition-all group"
          >
            <div>
              <div className="text-sm font-semibold group-hover:text-red-300 transition-colors">Mapbox Sign Up</div>
              <div className="text-xs text-gray-500">Get your free API token</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
          </a>
          <a
            href="https://overpass-api.de/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl bg-dark-800 border border-white/5 hover:border-red-500/30 transition-all group"
          >
            <div>
              <div className="text-sm font-semibold group-hover:text-red-300 transition-colors">Overpass API Docs</div>
              <div className="text-xs text-gray-500">OpenStreetMap query engine</div>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
}
