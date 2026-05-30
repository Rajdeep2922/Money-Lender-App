import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import Security from './sections/Security';
import Testimonials from './sections/Testimonials';
import FinalCTA from './sections/FinalCTA';
import Footer from './sections/Footer';
import './landing.css';

export default function LandingPage() {
  return (
    <div className="landing-root">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Security />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
