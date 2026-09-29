import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import InformationStrip from './components/InformationStrip';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import Explore from './sections/Explore';
import Testimonials from './sections/Testimonials';
import FinalCTA from './sections/FinalCTA';
import Footer from './sections/Footer';
import './landing.css';

export default function LandingPage() {
  return (
    <div className="landing-root">
      <Navbar />
      <Hero />
      <InformationStrip />
      <Features />
      <HowItWorks />
      <Explore />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}
