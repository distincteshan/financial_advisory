import { useState, useEffect } from "react";
import Navbar from "./NavBar";
import HeroSection from "./HeroSection";
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

  // Features data with your specified financial models
  const features = [
    {
      title: "Black-Litterman Model",
      desc: "Combining market equilibrium with your views to create optimized asset allocation strategies tailored to your risk tolerance.",
      icon: "📊",
    },
    {
      title: "Markowitz Portfolio Theory",
      desc: "Scientifically balancing risk and return through efficient frontier analysis to build your optimal investment portfolio.",
      icon: "📈",
    },
    {
      title: "Risk Mitigation Strategies",
      desc: "Advanced Value-at-Risk (VaR) and stress testing models to protect your investments against market volatility and downturns.",
      icon: "🛡️",
    },
    {
      title: "AI-Powered Asset Selection",
      desc: "Machine learning algorithms that analyze thousands of assets to identify the most promising investment opportunities for your goals.",
      icon: "🤖",
    },
    {
      title: "Personalized Recommendations",
      desc: "Tailored investment suggestions based on your financial profile, goals, risk tolerance, and market conditions.",
      icon: "🎯",
    },
    {
      title: "Real-time Portfolio Rebalancing",
      desc: "Automatic suggestions for portfolio adjustments as market conditions change to maintain your optimal asset allocation.",
      icon: "⚖️",
    },
  ];

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="absolute -top-28 -left-28 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-full blur-[80px] -z-10"></div>
      <div className="bg-cover bg-center bg-no-repeat h-svh">
        <Navbar />
        {/* Hero Section */}

        <HeroSection />
      </div>
      {/* About Section with slide-in animation */}
      <section
        id="about"
        className={`py-16 px-6 text-center transition-all duration-1000 transform ${
          isVisible.about
            ? "translate-x-0 opacity-100"
            : "translate-x-20 opacity-0"
        }`}
      >
        <h2 className="text-3xl font-bold text-blue-600">About Our Service</h2>
        <p className="mt-6 text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
          In todays complex financial landscape, making informed investment
          decisions can be overwhelming. Our AI-driven system leverages advanced
          portfolio theories like Markowitz and Black-Litterman to provide
          scientifically-backed, personalized financial strategies tailored to
          your unique goals and risk profile.
        </p>
      </section>

      {/* Features Section with staggered fade-in animation */}
      <section
        id="features"
        className={`py-16 bg-gray-50 px-6 text-center transition-opacity duration-1000 ${
          isVisible.features ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-3xl font-bold text-blue-600">
          Advanced Portfolio Technologies
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white shadow-md rounded-lg transition-all duration-500 hover:shadow-xl hover:transform hover:scale-105"
              style={{
                transitionDelay: `${index * 150}ms`,
                opacity: isVisible.features ? 1 : 0,
                transform: isVisible.features
                  ? "translateY(0)"
                  : "translateY(20px)",
              }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-blue-600">
                {feature.title}
              </h3>
              <p className="mt-3 text-gray-700">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section with bounce-in animation */}
      <section
        id="contact"
        className={`py-16 px-6 text-center transition-all duration-1000 ${
          isVisible.contact ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h2 className="text-3xl font-bold text-blue-600">Contact Us</h2>
        <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">
          Ready to transform your investment strategy with advanced portfolio
          optimization? Our financial experts are here to guide you.
        </p>
        <button className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-lg text-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-lg animate-pulse">
          Get Expert Advice
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-8 mt-10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="mb-4">
            &copy; 2025 AI Financial Advisor. All Rights Reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300"
            >
              FAQ
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
