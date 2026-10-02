import { useState } from 'react';
import { Menu, X, MapPin, Shield, Home, Zap, GitBranch, BookOpen, Sparkles, Palette } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', href: '#hero' },
  { icon: Zap, label: 'Features', href: '#features' },
  { icon: MapPin, label: 'Interface', href: '#interface' },
  { icon: GitBranch, label: 'User Flow', href: '#userflow' },
  { icon: BookOpen, label: 'API', href: '#api' },
  { icon: Sparkles, label: 'Extras', href: '#extras' },
  { icon: Palette, label: 'Design', href: '#design' },
];

export default function Navbar({
  activeSection,
}: {
  activeSection: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile app bar keeps navigation visible without covering the content. */}
      <header className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between border-b border-white/10 bg-dark-900/85 px-4 py-3 backdrop-blur-xl lg:hidden" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <a href="#hero" className="flex items-center gap-2" aria-label="CodeRed home">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">Code<span className="text-red-500">Red</span></span>
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden min-[380px]:inline text-[10px] font-semibold tracking-wider text-red-300">24/7 ACTIVE</span>
          <button
            className="p-2.5 -mr-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-dark-800 border-r border-white/5 z-50 overflow-hidden">
        {/* Background glow */}
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="p-5 border-b border-white/5 relative z-10">
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-800 animate-pulse" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Code<span className="text-red-500">Red</span>
            </span>
          </a>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto relative z-10">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">Navigation</p>
          {navItems.map(({ icon: Icon, label, href }) => {
            const id = href.replace('#', '');
            const isActive = activeSection === id;
            return (
              <a
                key={label}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-5 ${isActive ? 'text-red-400' : 'text-red-500/70 group-hover:text-red-400'} transition-colors`} />
                {label}
              </a>
            );
          })}
        </nav>

        {/* Bottom: 24/7 badge */}
        <div className="p-4 border-t border-white/5 space-y-3 relative z-10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-semibold text-red-400">24/7 ACTIVE</span>
            <span className="ml-auto relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[55] lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          {/* Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-[min(19rem,86vw)] bg-dark-800 border-r border-white/10 shadow-2xl overflow-y-auto" role="dialog" aria-modal="true" aria-label="Site navigation">
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/30">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-dark-800 animate-pulse" />
                </div>
                <span className="text-lg font-bold tracking-tight">
                  Code<span className="text-red-500">Red</span>
                </span>
              </div>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map(({ icon: Icon, label, href }) => {
                const id = href.replace('#', '');
                const isActive = activeSection === id;
                return (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-red-400 bg-red-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-red-500/70'}`} />
                    {label}
                  </a>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs font-semibold text-red-400">24/7 ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
