import React from 'react';
import Navbar from './NavBar';

const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-black/40 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-800 hover:border-indigo-500/30 group">
    <div className="text-indigo-400 mb-4 text-3xl group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors duration-300">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const Features = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      {/* Animated Dots */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] -z-10"></div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Main Theory Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Modern Portfolio Theory
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Our AI-powered financial advisor leverages the Nobel Prize-winning Modern Portfolio Theory (MPT) 
            developed by Harry Markowitz to create optimized investment portfolios.
          </p>
        </div>

        {/* Key Concepts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            title="Risk vs Return Optimization"
            description="MPT helps find the optimal balance between risk and return by analyzing how different assets move in relation to each other."
            icon="📈"
          />
          <FeatureCard
            title="Diversification"
            description="Reduce portfolio risk by spreading investments across various assets that aren't perfectly correlated."
            icon="🔄"
          />
          <FeatureCard
            title="Efficient Frontier"
            description="Identify portfolios that offer the highest expected return for a defined level of risk."
            icon="🎯"
          />
        </div>

        {/* How It Works Section */}
        <div className="bg-black/40 rounded-2xl p-8 mb-16 border border-gray-800">
          <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            How Our System Works
          </h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">1</div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Risk Assessment</h3>
                <p className="text-gray-400 leading-relaxed">
                  We analyze your risk tolerance through a comprehensive questionnaire to understand your investment goals and constraints.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">2</div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Portfolio Optimization</h3>
                <p className="text-gray-400 leading-relaxed">
                  Our AI algorithms calculate optimal asset allocations using historical data, covariance matrices, and expected returns.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-400 font-bold border border-pink-500/30">3</div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Real-time Monitoring</h3>
                <p className="text-gray-400 leading-relaxed">
                  Track your portfolio's performance with real-time market data and get suggestions for rebalancing when needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Classes */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Supported Asset Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/40 rounded-xl p-6 border border-gray-800 hover:border-purple-500/30 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300">Stocks</h3>
              <p className="text-gray-400">NSE-listed equities including blue-chip and growth stocks</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-gray-800 hover:border-purple-500/30 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300">Cryptocurrencies</h3>
              <p className="text-gray-400">Major cryptocurrencies like Bitcoin, Ethereum, and Solana</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-gray-800 hover:border-purple-500/30 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300">Mutual Funds</h3>
              <p className="text-gray-400">Carefully selected mutual funds with proven track records</p>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-gray-800 hover:border-purple-500/30 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300">Commodities</h3>
              <p className="text-gray-400">Gold and other precious metals for portfolio stability</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">
            Key Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-black/40 rounded-xl p-8 border border-gray-800 hover:border-pink-500/30 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors duration-300">Data-Driven Decisions</h3>
              <ul className="text-gray-400 space-y-3">
                <li className="flex items-center space-x-2">
                  <span className="text-pink-400">•</span>
                  <span>Historical performance analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-400">•</span>
                  <span>Risk-adjusted return optimization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-400">•</span>
                  <span>Market trend analysis</span>
                </li>
              </ul>
            </div>
            <div className="bg-black/40 rounded-xl p-8 border border-gray-800 hover:border-pink-500/30 transition-all duration-300 group">
              <h3 className="text-xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors duration-300">Personalized Strategy</h3>
              <ul className="text-gray-400 space-y-3">
                <li className="flex items-center space-x-2">
                  <span className="text-pink-400">•</span>
                  <span>Custom risk profiles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-400">•</span>
                  <span>Goal-based portfolio allocation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-pink-400">•</span>
                  <span>Regular rebalancing suggestions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 