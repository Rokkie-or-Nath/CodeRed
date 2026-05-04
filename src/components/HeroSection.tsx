import { useState } from 'react';
import { ChevronDown, AlertTriangle, Zap } from 'lucide-react';

export default function HeroSection() {
  const [emergencyActive, setEmergencyActive] = useState(false);

  const handleEmergency = () => {
    setEmergencyActive(true);
    setTimeout(() => setEmergencyActive(false), 3000);
    const section = document.getElementById('interface');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        if ((window as any).__pulsePointEmergency) (window as any).__pulsePointEmergency();
      }, 800);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 map-grid" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl" />

      {/* Floating particles */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-red-500/30 rounded-full animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-red-400/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-red-500/40 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 bg-red-600/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="text-sm font-medium text-red-300">Emergency Services Active</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="text-white">Code</span><span className="text-red-400">Red</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Find nearby hospitals instantly when you need help.
          <br className="hidden sm:block" />
          Every second counts — we help you save them.
        </p>

        {/* Emergency Button */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={handleEmergency}
            className={`group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-500 ${
              emergencyActive
                ? 'bg-red-500 text-white scale-105 shadow-2xl shadow-red-500/50'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-900/40 hover:shadow-red-500/30 hover:scale-105 emergency-pulse'
            }`}
          >
            {emergencyActive ? (
              <>
                <Zap className="w-6 h-6 animate-spin" />
                LOCATING NEAREST HOSPITAL...
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6 group-hover:animate-bounce" />
                EMERGENCY
              </>
            )}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {[
            { value: '< 2s', label: 'Detection Time' },
            { value: '500m', label: 'Accuracy' },
            { value: '24/7', label: 'Availability' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-400">{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <a href="#features" className="inline-flex flex-col items-center gap-1 text-gray-500 hover:text-red-400 transition-colors">
            <span className="text-xs font-medium">Explore</span>
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Emergency overlay */}
      {emergencyActive && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
        </div>
      )}
    </section>
  );
}
