import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import AppInterfaceSection from './components/AppInterfaceSection';
import UserFlowSection from './components/UserFlowSection';
import CodeSection from './components/CodeSection';
import APIGuideSection from './components/APIGuideSection';
import ExtraFeaturesSection from './components/ExtraFeaturesSection';
import DesignStyleSection from './components/DesignStyleSection';
import Footer from './components/Footer';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Once auth is done loading and we know if user is logged in, mark ready
  useEffect(() => {
    if (!authLoading) setReady(true);
  }, [authLoading]);

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

  // Show nothing while checking auth session
  if (!ready) return null;

  if (!user) return <LoginPage onLogin={() => {}} />;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white lg:pl-64">
      <Navbar activeSection={activeSection} onLogout={handleLogout} />
      <HeroSection />
      <div className="section-divider" />
      <FeaturesSection />
      <div className="section-divider" />
      <AppInterfaceSection />
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

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AuthProvider>
  );
}
