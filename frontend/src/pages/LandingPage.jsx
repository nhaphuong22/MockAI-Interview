import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero3D from '../components/landing/Hero3D';
import Features from '../components/landing/Features';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero3D />
        <Features />
      </main>
      
      {/* Simple Footer */}
      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>© 2026 MockAI-Interview - AI Job Support Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
