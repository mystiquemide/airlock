import Hero from "./components/Hero";
import Nav from "./components/Nav";
import PolicyBlock from "./components/PolicyBlock";
import HowItWorks from "./components/HowItWorks";
import ThreatModel from "./components/ThreatModel";
import CTABlock from "./components/CTABlock";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main style={{ background: "#0A0A0A" }}>
        <Hero />
        <PolicyBlock />
        <HowItWorks />
        <ThreatModel />
        <CTABlock />
        <Footer />
      </main>
    </>
  );
}
