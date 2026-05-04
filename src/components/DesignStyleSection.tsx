import { Palette, Type, Box, Sparkles, Monitor, Layers } from 'lucide-react';

const colors = [
  { name: 'Background', hex: '#0A0A0F', text: 'text-white' },
  { name: 'Surface',    hex: '#111118', text: 'text-white' },
  { name: 'Card',       hex: '#1A1A27', text: 'text-white' },
  { name: 'Border',     hex: '#2A2A3A', text: 'text-white' },
  { name: 'Emergency',  hex: '#DC2626', text: 'text-white' },
  { name: 'Hover',      hex: '#EF4444', text: 'text-white' },
  { name: 'Glow',       hex: '#F87171', text: 'text-dark-900' },
  { name: 'Text',       hex: '#FFFFFF', text: 'text-dark-900' },
];

const principles = [
  {
    icon: Box,
    title: 'Minimalist Layout',
    description: 'Clean, distraction-free interface. Every element serves a purpose in an emergency.',
  },
  {
    icon: Type,
    title: 'Clear Typography',
    description: 'Inter font family. Bold headings for quick scanning, readable body for details.',
  },
  {
    icon: Sparkles,
    title: 'Smooth Animations',
    description: '300–500ms transitions with ease-in-out. Map fly-to uses 1000–1500ms for orientation.',
  },
  {
    icon: Layers,
    title: 'Depth & Hierarchy',
    description: 'MapLibre 3D pitch at 45° with fill-extrusion buildings creates real spatial depth.',
  },
  {
    icon: Monitor,
    title: 'Responsive First',
    description: 'Desktop: sidebar + map. Mobile: full-screen map + bottom sheet panel.',
  },
  {
    icon: Palette,
    title: 'Consistent Palette',
    description: 'Dark neutrals with red emergency accents. Red always signals urgency or action.',
  },
];

export default function DesignStyleSection() {
  return (
    <section id="design" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Design System</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold mb-4">
            Design <span className="text-red-400">Style</span> Guide
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A modern dark UI with red emergency accents — built for clarity under pressure.
          </p>
        </div>

        {/* Color Palette */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-red-400" />
            Color Palette
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {colors.map((color) => (
              <div
                key={color.name}
                className="rounded-xl overflow-hidden border border-white/5 hover:border-red-500/20 transition-all group"
              >
                <div className="h-20 flex items-end p-3" style={{ backgroundColor: color.hex }}>
                  <span className={`text-xs font-bold ${color.text} drop-shadow-lg`}>{color.hex}</span>
                </div>
                <div className="px-3 py-2 bg-dark-800">
                  <span className="text-xs font-medium text-gray-400">{color.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Type className="w-5 h-5 text-red-400" />
            Typography Scale
          </h3>
          <div className="space-y-4 p-6 rounded-2xl bg-dark-800 border border-white/5">
            {[
              { label: 'Display',    size: 'text-5xl sm:text-6xl', weight: 'font-black',    example: 'CodeRed' },
              { label: 'Heading',    size: 'text-3xl',             weight: 'font-bold',     example: 'Find Hospitals' },
              { label: 'Subheading', size: 'text-xl',              weight: 'font-semibold', example: 'Nearby Results' },
              { label: 'Body',       size: 'text-base',            weight: 'font-normal',   example: 'Hospital details and distance info' },
              { label: 'Caption',    size: 'text-sm',              weight: 'font-normal',   example: '1.2 km away · Open now' },
              { label: 'Code',       size: 'text-xs',              weight: 'font-mono',     example: 'new maplibregl.Map({ pitch: 45 })' },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{item.label}</span>
                <span className={`${item.size} ${item.weight} text-white truncate`}>{item.example}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Design Principles */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-400" />
            Design Principles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="p-5 rounded-2xl bg-dark-800 border border-white/5 hover:border-red-500/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <principle.icon className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="text-sm font-bold mb-1 group-hover:text-red-300 transition-colors">
                  {principle.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spacing & Radius */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Box className="w-5 h-5 text-red-400" />
            Spacing & Border Radius
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-dark-800 border border-white/5">
              <h4 className="text-sm font-bold mb-4 text-gray-300">Border Radius</h4>
              <div className="flex items-end gap-4">
                {[
                  { label: 'sm',   value: '6px',    radius: 'rounded' },
                  { label: 'md',   value: '8px',    radius: 'rounded-lg' },
                  { label: 'lg',   value: '12px',   radius: 'rounded-xl' },
                  { label: 'xl',   value: '16px',   radius: 'rounded-2xl' },
                  { label: 'full', value: '9999px', radius: 'rounded-full' },
                ].map((r) => (
                  <div key={r.label} className="text-center">
                    <div className={`w-12 h-12 bg-red-500/20 border border-red-500/30 ${r.radius} mb-2`} />
                    <div className="text-[10px] text-gray-500">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-dark-800 border border-white/5">
              <h4 className="text-sm font-bold mb-4 text-gray-300">Shadows & Glow</h4>
              <div className="flex items-center gap-6">
                {[
                  { label: 'Subtle', shadow: 'shadow-lg shadow-black/20' },
                  { label: 'Medium', shadow: 'shadow-xl shadow-black/30' },
                  { label: 'Red Glow', shadow: 'shadow-2xl shadow-red-500/30' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`w-16 h-16 rounded-xl bg-dark-700 ${s.shadow} mb-2`} />
                    <div className="text-[10px] text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
