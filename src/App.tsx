import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import UserFlowSection from './components/UserFlowSection';
import CodeSection from './components/CodeSection';
import APIGuideSection from './components/APIGuideSection';
import ExtraFeaturesSection from './components/ExtraFeaturesSection';
import DesignStyleSection from './components/DesignStyleSection';
import Footer from './components/Footer';

function AppContent() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = [
        'hero', 'features', 'interface', 'userflow',
        'code', 'api', 'extras', 'design'
      ];
      const reversed = [...sectionIds].reverse();
      for (const id of reversed) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white lg:pl-64">
      <Navbar activeSection={activeSection} />
      <HeroSection />
      <div className="section-divider" />
      <FeaturesSection />
      <div className="section-divider" />
      <LazyAppInterfaceSection />
      <div className="section-divider" />
      <UserFlowSection />
      <div className="section-divider" />
      <CodeSection />
      <div className="section-divider" />
      <APIGuideSection />
      <div className="section-divider" />
      <ExtraFeaturesSection />
      <div className="section-divider" />
      <DesignStyleSection />
      <Footer />
    </div>
  );
}

// AppInterfaceSection imports maplibre-gl (~250 kB gzipped), which is by far
// the heaviest dependency in this app. It is loaded lazily AND only fetched
// once the user scrolls close to the interactive demo section, so the map
// engine stays out of the initial page load entirely.
const AppInterfaceSection = lazy(() => import('./components/AppInterfaceSection'));

function InterfaceSkeleton() {
  return (
    <section id="interface" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="shimmer rounded-2xl h-[26rem] md:h-[32rem] flex items-center justify-center">
          <p className="text-sm text-gray-500 font-mono">Loading interactive map…</p>
        </div>
      </div>
    </section>
  );
}

function LazyAppInterfaceSection() {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = placeholderRef.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      // Fetch a little before the section scrolls into view so there is no
      // visible delay when the user reaches it.
      { rootMargin: '1000px 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!shouldLoad) {
    return (
      <div ref={placeholderRef}>
        <InterfaceSkeleton />
      </div>
    );
  }

  return (
    <Suspense fallback={<InterfaceSkeleton />}>
      <AppInterfaceSection />
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AuthProvider>
  );
}
