import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioCharts from './PortfolioCharts';
import Navbar from './NavBar';
import StockDetailModal from './StockDetailModal';

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercent = (value) => {
  return `${value.toFixed(2)}%`;
};

const formatQuantity = (value, category) => {
  if (category === 'Stocks') {
    // For stocks, show as integers
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } else if (category === 'Mutual Funds') {
    // For mutual funds, show 4 decimal places
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  } else {
    // For other assets (crypto, commodities), show up to 4 decimal places
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    }).format(value);
  }
};

const AssetRow = ({ asset, onStockClick }) => {
  const [marketData, setMarketData] = useState({
    currentPrice: null,
    expectedPrice: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/market/price/${asset.ticker}`);
        if (response.data.error) {
          setMarketData({
            currentPrice: null,
            expectedPrice: null,
            loading: false,
            error: response.data.error
          });
        } else {
          const currentPrice = response.data.current_price;
          const expectedPrice = currentPrice * (1 + asset.expected_return / 100);
          setMarketData({
            currentPrice,
            expectedPrice,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        setMarketData({
          currentPrice: null,
          expectedPrice: null,
          loading: false,
          error: 'Failed to fetch price'
        });
      }
    };

    fetchMarketData();
  }, [asset.ticker]);

  // Calculate initial investment as quantity * market price
  const calculatedInvestment = marketData.currentPrice ? marketData.currentPrice * asset.quantity : null;
  const isPositive = asset.expected_return >= 0;

  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors duration-200" onClick={() => asset.category === 'Stocks' && onStockClick(asset)} style={{ cursor: asset.category === 'Stocks' ? 'pointer' : 'default' }}>
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-8 rounded-full ${isPositive ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div>
            <div className="text-gray-100 font-medium">{asset.name}</div>
            <div className="text-gray-500 text-sm">{asset.ticker}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="text-gray-200">{formatQuantity(asset.quantity, asset.category)}</div>
        <div className="text-gray-500 text-sm">Units</div>
      </td>
      <td className="py-4 px-4 text-right">
        {marketData.loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : marketData.error ? (
          <div className="text-gray-600 text-sm">{marketData.error}</div>
        ) : (
          <div>
            <div className="text-gray-200">{formatINR(marketData.currentPrice)}</div>
            <div className="text-gray-500 text-sm">Market Price</div>
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        {marketData.loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : marketData.error ? (
          <div className="text-gray-600 text-sm">{marketData.error}</div>
        ) : (
          <div>
            <div className="text-gray-200">{formatINR(calculatedInvestment)}</div>
            <div className="text-gray-500 text-sm">Initial Investment</div>
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        {marketData.loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : marketData.error ? (
          <div className="text-gray-600 text-sm">{marketData.error}</div>
        ) : (
          <div>
            <div className={`font-medium ${isPositive ? 'text-green-400' : 'text-gray-400'}`}>
              {formatINR(marketData.expectedPrice)}
            </div>
            <div className="text-gray-500 text-sm">Expected in 1Y</div>
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        <div className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-gray-400'}`}>
          {isPositive ? '↗' : '↘'} {formatPercent(Math.abs(asset.expected_return))}
        </div>
        <div className="text-gray-500 text-sm">Expected Return</div>
      </td>
    </tr>
  );
};

const CategoryCard = ({ title, allocations, totalAmount, onStockClick }) => {
  const categoryTotal = allocations.reduce((sum, asset) => sum + asset.amount, 0);
  const categoryWeight = (categoryTotal / totalAmount) * 100;
  const weightedReturn = allocations.reduce((sum, asset) => {
    return sum + (asset.expected_return * (asset.amount / categoryTotal));
  }, 0);

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-700/50 hover:border-gray-600/50 group relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-600/5 via-transparent to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-gray-100 mb-1">{title}</h3>
          <span className="text-gray-500 text-sm">{formatPercent(categoryWeight)} of portfolio</span>
        </div>
        <div className="text-right">
          <div className="text-gray-200 font-bold">{formatINR(categoryTotal)}</div>
          <div className={`text-sm font-medium ${weightedReturn >= 0 ? 'text-green-400' : 'text-gray-400'}`}>
            {weightedReturn >= 0 ? '↗' : '↘'} {formatPercent(Math.abs(weightedReturn))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto relative z-10">
        <table className="min-w-full">
          <thead>
            <tr className="text-gray-500 text-sm border-b border-gray-700/30">
              <th className="py-3 px-4 text-left font-medium">Asset</th>
              <th className="py-3 px-4 text-right font-medium">Quantity</th>
              <th className="py-3 px-4 text-right font-medium">Market Price</th>
              <th className="py-3 px-4 text-right font-medium">Initial Investment</th>
              <th className="py-3 px-4 text-right font-medium">Expected Price</th>
              <th className="py-3 px-4 text-right font-medium">Expected Return</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((asset) => (
              <AssetRow key={asset.ticker} asset={asset} onStockClick={onStockClick} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/portfolio/get-portfolio', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPortfolioData(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else if (err.response?.status === 400) {
        setError('Please complete the questionnaire first.');
      } else {
        setError('Failed to fetch portfolio data. ' + err.message);
        console.error('Error fetching portfolio data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStockClick = (asset) => {
    setSelectedStock(asset);
    setStockModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Complex Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
        
        {/* Dynamic Gradient Orbs */}
        <div className="fixed top-20 right-20 w-[450px] h-[450px] bg-gradient-to-r from-blue-500/15 to-indigo-500/15 rounded-full blur-3xl animate-pulse -z-10"></div>
        <div className="fixed top-1/2 left-16 w-96 h-96 bg-gradient-to-r from-purple-500/12 to-pink-500/12 rounded-full blur-3xl animate-pulse delay-1000 -z-10"></div>
        <div className="fixed bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-1500 -z-10"></div>
        <div className="fixed top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-indigo-500/8 to-cyan-500/8 rounded-full blur-3xl animate-pulse delay-700 -z-10"></div>
        
        {/* Enhanced Geometric Patterns */}
        <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px] -z-10"></div>
        <div className="fixed inset-0 bg-[radial-gradient(rgba(99,102,241,0.06)_1px,transparent_1px)] bg-[size:90px_90px] animate-pulse -z-10"></div>

        <Navbar />
        <div className="flex items-center justify-center h-screen relative z-10">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-indigo-400/20 mx-auto"></div>
            </div>
            <p className="text-gray-300 text-lg">Optimizing your portfolio...</p>
            <p className="text-gray-500 text-sm mt-2">Analyzing market data and calculating optimal allocations</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Complex Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
        
        {/* Dynamic Gradient Orbs */}
        <div className="fixed top-20 right-20 w-[450px] h-[450px] bg-gradient-to-r from-red-500/15 to-pink-500/15 rounded-full blur-3xl animate-pulse -z-10"></div>
        <div className="fixed top-1/2 left-16 w-96 h-96 bg-gradient-to-r from-orange-500/12 to-red-500/12 rounded-full blur-3xl animate-pulse delay-1000 -z-10"></div>
        <div className="fixed bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1500 -z-10"></div>
        
        {/* Enhanced Geometric Patterns */}
        <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px] -z-10"></div>
        <div className="fixed inset-0 bg-[radial-gradient(rgba(239,68,68,0.06)_1px,transparent_1px)] bg-[size:90px_90px] animate-pulse -z-10"></div>

        <Navbar />
        <div className="flex items-center justify-center h-screen relative z-10">
          <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/30 p-8 rounded-xl text-red-200 max-w-md text-center">
            <div className="text-2xl font-bold mb-4 text-red-400">⚠️ Error</div>
            <div className="text-gray-300 leading-relaxed">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolioData) return null;

  const groupedAllocations = portfolioData.allocations.reduce((acc, allocation) => {
    if (!acc[allocation.category]) {
      acc[allocation.category] = [];
    }
    acc[allocation.category].push(allocation);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Complex Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      {/* Dynamic Gradient Orbs */}
      <div className="fixed top-20 right-20 w-[450px] h-[450px] bg-gradient-to-r from-gray-600/12 to-gray-500/12 rounded-full blur-3xl animate-pulse -z-10"></div>
      <div className="fixed top-1/2 left-16 w-96 h-96 bg-gradient-to-r from-slate-600/10 to-gray-600/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10"></div>
      <div className="fixed bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-gray-500/8 to-slate-500/8 rounded-full blur-3xl animate-pulse delay-1500 -z-10"></div>
      <div className="fixed top-1/3 right-1/3 w-72 h-72 bg-gradient-to-r from-zinc-600/6 to-gray-600/6 rounded-full blur-3xl animate-pulse delay-700 -z-10"></div>
      
      {/* Animated Gradient Waves */}
      <div className="fixed inset-0 opacity-25 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-gray-600/3 to-transparent animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-transparent via-slate-600/3 to-transparent animate-pulse delay-2000"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-zinc-600/2 to-transparent animate-pulse delay-1200"></div>
      </div>
      
      {/* Enhanced Geometric Patterns */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:60px_60px] -z-10"></div>
      <div className="fixed inset-0 bg-[radial-gradient(rgba(156,163,175,0.04)_1px,transparent_1px)] bg-[size:90px_90px] animate-pulse -z-10"></div>
      <div className="fixed inset-0 bg-[conic-gradient(from_180deg,transparent,rgba(107,114,128,0.03),transparent)] animate-pulse delay-800 -z-10"></div>
      
      {/* Floating Gradient Strips */}
      <div className="fixed top-1/5 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-500/20 to-transparent -z-10"></div>
      <div className="fixed top-3/5 right-0 w-full h-px bg-gradient-to-l from-transparent via-slate-500/15 to-transparent -z-10"></div>
      <div className="fixed bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-500/12 to-transparent -z-10"></div>

      <Navbar />
      <div className="pt-16 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Portfolio Charts */}
        <div className="mt-8">
          <PortfolioCharts portfolioData={portfolioData} />
        </div>

        {/* Category Cards */}
        <div className="mt-8 space-y-8 pb-8">
          {Object.entries(groupedAllocations).map(([category, allocations]) => (
            <CategoryCard
              key={category}
              title={category}
              allocations={allocations}
              totalAmount={portfolioData.portfolio_metrics.total_investment}
              onStockClick={handleStockClick}
            />
          ))}
        </div>
      </div>
      <StockDetailModal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        ticker={selectedStock?.ticker}
        name={selectedStock?.name}
      />
    </div>
  );
};

export default Dashboard; 