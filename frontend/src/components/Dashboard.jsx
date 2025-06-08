import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioCharts from './PortfolioCharts';
import Navbar from './NavBar';

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

const AssetRow = ({ asset }) => {
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
    <tr className="border-b border-gray-800">
      <td className="py-4 px-4">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-8 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <div className="text-white font-medium">{asset.name}</div>
            <div className="text-gray-400 text-sm">{asset.ticker}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="text-white">{formatQuantity(asset.quantity, asset.category)}</div>
        <div className="text-gray-400 text-sm">Units</div>
      </td>
      <td className="py-4 px-4 text-right">
        {marketData.loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : marketData.error ? (
          <div className="text-red-400 text-sm">{marketData.error}</div>
        ) : (
          <div>
            <div className="text-white">{formatINR(marketData.currentPrice)}</div>
            <div className="text-gray-400 text-sm">Market Price</div>
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        {marketData.loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : marketData.error ? (
          <div className="text-red-400 text-sm">{marketData.error}</div>
        ) : (
          <div>
            <div className="text-white">{formatINR(calculatedInvestment)}</div>
            <div className="text-gray-400 text-sm">Initial Investment</div>
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        {marketData.loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : marketData.error ? (
          <div className="text-red-400 text-sm">{marketData.error}</div>
        ) : (
          <div>
            <div className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {formatINR(marketData.expectedPrice)}
            </div>
            <div className="text-gray-400 text-sm">Expected in 1Y</div>
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {formatPercent(Math.abs(asset.expected_return))}
        </div>
        <div className="text-gray-400 text-sm">Expected Return</div>
      </td>
    </tr>
  );
};

const CategoryCard = ({ title, allocations, totalAmount }) => {
  const categoryTotal = allocations.reduce((sum, asset) => sum + asset.amount, 0);
  const categoryWeight = (categoryTotal / totalAmount) * 100;
  const weightedReturn = allocations.reduce((sum, asset) => {
    return sum + (asset.expected_return * (asset.amount / categoryTotal));
  }, 0);

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <span className="text-gray-400 text-sm">{formatPercent(categoryWeight)} of portfolio</span>
        </div>
        <div className="text-right">
          <div className="text-white font-bold">{formatINR(categoryTotal)}</div>
          <div className={`text-sm ${weightedReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {weightedReturn >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(weightedReturn))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="py-3 px-4 text-left">Asset</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4 text-right">Market Price</th>
              <th className="py-3 px-4 text-right">Initial Investment</th>
              <th className="py-3 px-4 text-right">Expected Price</th>
              <th className="py-3 px-4 text-right">Expected Return</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((asset) => (
              <AssetRow key={asset.ticker} asset={asset} />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Optimizing your portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-900/50 p-6 rounded-lg text-red-200 max-w-md text-center">
            <div className="text-xl font-bold mb-2">Error</div>
            <div>{error}</div>
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
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 