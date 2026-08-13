import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import IntelligenceSources from './IntelligenceSources';
import Footer from './Footer';

export default function Landing({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden bg-sentinel-bg">
      <Navbar onLaunch={onLaunch} />
      <main>
        <Hero onLaunch={onLaunch} />
        <Features />
        <HowItWorks />
        <IntelligenceSources onLaunch={onLaunch} />
      </main>
      <Footer />
    </div>
  );
}
