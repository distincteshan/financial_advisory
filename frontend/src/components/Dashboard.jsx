import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioCharts from './PortfolioCharts';

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

const formatQuantity = (value) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
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

  const currentValue = marketData.currentPrice ? marketData.currentPrice * asset.quantity : null;
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
        <div className="text-white">{formatQuantity(asset.quantity)}</div>
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
            <div className="text-gray-400 text-sm">Current Price</div>
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
            <div className="text-white">{formatINR(currentValue)}</div>
            <div className="text-gray-400 text-sm">Current Value</div>
          </div>
        )}
      </td>
      <td className="py-4 px-4 text-right">
        <div className="text-white">{formatINR(asset.initial_investment)}</div>
        <div className="text-gray-400 text-sm">Initial Investment</div>
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
              <th className="py-3 px-4 text-right">Current Value</th>
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
      const questionnaireData = localStorage.getItem('questionnaireResponses');
      if (!questionnaireData) {
        setError('No questionnaire data found. Please complete the questionnaire first.');
        setLoading(false);
        return;
      }

      const responses = JSON.parse(questionnaireData);
      const investmentAmount = parseFloat(responses.investmentAmount);
      
      if (!investmentAmount || isNaN(investmentAmount)) {
        setError('Invalid investment amount. Please complete the questionnaire again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/portfolio/get-portfolio?amount=${investmentAmount}`);
      
      if (response.data.portfolio_metrics.total_investment !== investmentAmount) {
        console.error('Investment amount mismatch:', {
          requested: investmentAmount,
          received: response.data.portfolio_metrics.total_investment
        });
        setError('Portfolio allocation amount does not match your investment amount');
        return;
      }
      
      setPortfolioData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch portfolio data. ' + err.message);
      console.error('Error fetching portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Optimizing your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-red-900/50 p-6 rounded-lg text-red-200 max-w-md text-center">
          <div className="text-xl font-bold mb-2">Error</div>
          <div>{error}</div>
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
    <div className="min-h-screen bg-gray-900 p-8">
      {/* Portfolio Charts */}
      <PortfolioCharts portfolioData={portfolioData} />

      {/* Category Cards */}
      <div className="mt-8 space-y-8">
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
  );
};

export default Dashboard; 