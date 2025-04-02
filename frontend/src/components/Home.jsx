/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import Navbar from "./NavBar";
import HeroSection from "./HeroSection";
import Purpose from "./Purpose";
import ServicesSection from "./ServicesSection";
const Home = () => {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    about: false,
    features: false,
    contact: false,
  });

  // Animation trigger on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "features", "contact"];
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          const windowHeight = window.innerHeight;
          if (rect.top <= windowHeight * 0.75) {
            setIsVisible((prev) => ({ ...prev, [section]: true }));
          }
        }
      });
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="absolute -top-28 -left-28 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-full blur-[80px] -z-10"></div>
      <div className="bg-cover bg-center bg-no-repeat h-svh">
        <Navbar />
        {/* Hero Section */}

        <HeroSection />
        <Purpose />
        <ServicesSection />
        <footer className="bg-gray-900 text-white text-center py-6 mt-10">
          <p>&copy; 2024 AI Financial Advisor. All Rights Reserved.</p>
        </footer>
      </div>
    </main>
  );
};

export default Home;
