import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PriceChart from './PriceChart';

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

const AssetRow = ({ asset, onSelect }) => {
  const isPositive = asset.expected_return >= 0;
  return (
    <div 
      className="bg-gray-900 rounded-lg p-4 mb-3 hover:bg-gray-800 transition-all cursor-pointer"
      onClick={() => onSelect(asset)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-8 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <div className="text-white font-medium">{asset.name}</div>
            <div className="text-gray-400 text-sm">{asset.ticker}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-medium">{formatINR(asset.amount)}</div>
          <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {formatPercent(Math.abs(asset.expected_return))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryCard = ({ title, allocations, totalAmount, onSelectAsset }) => {
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
      <div className="space-y-2">
        {allocations.map((asset) => (
          <AssetRow key={asset.ticker} asset={asset} onSelect={onSelectAsset} />
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      fetchChartData(selectedAsset.ticker);
    }
  }, [selectedAsset]);

  const fetchChartData = async (ticker) => {
    try {
      // For stocks (NSE)
      if (ticker.endsWith('.NS')) {
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?range=1y&interval=1d`
        );
        
        const quotes = response.data.chart.result[0].indicators.quote[0];
        const timestamps = response.data.chart.result[0].timestamp;
        
        const chartData = timestamps.map((time, i) => ({
          time: new Date(time * 1000).toISOString().split('T')[0],
          open: quotes.open[i],
          high: quotes.high[i],
          low: quotes.low[i],
          close: quotes.close[i],
          volume: quotes.volume[i]
        })).filter(item => item.open && item.high && item.low && item.close);

        setChartData(chartData);
      }
      // For crypto
      else if (ticker === 'BTC-INR' || ticker === 'ETH-INR' || ticker === 'SOL-INR') {
        const symbol = ticker.split('-')[0].toLowerCase();
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=inr&days=365&interval=daily`
        );

        const chartData = response.data.prices.map(([time, price]) => ({
          time: new Date(time).toISOString().split('T')[0],
          open: price,
          high: price,
          low: price,
          close: price,
          volume: 0
        }));

        setChartData(chartData);
      }
      // For mutual funds
      else if (ticker.includes('FLEXI_CAP')) {
        // Mutual fund data might need a different API
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData(null);
    }
  };

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      // Get questionnaire data from localStorage
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

      console.log('Investment Amount from Questionnaire:', investmentAmount);
      
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

  const { portfolio_metrics, allocations } = portfolioData || {};

  // Group allocations by category
  const groupedAllocations = allocations?.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = [];
    }
    acc[asset.category].push(asset);
    return acc;
  }, {}) || {};

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with total investment */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-4">Your Investment Portfolio</h1>
          <div className="text-4xl font-bold text-green-400 mb-2">
            {formatINR(portfolio_metrics?.total_investment)}
          </div>
          <div className="text-gray-400">Total Investment Amount</div>
        </div>

        {/* Portfolio Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 font-medium mb-2">Expected Return</h3>
            <div className="text-3xl font-bold text-white">
              {formatPercent(portfolio_metrics?.expected_return || 0)}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 font-medium mb-2">Portfolio Volatility</h3>
            <div className="text-3xl font-bold text-white">
              {formatPercent(portfolio_metrics?.volatility || 0)}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 font-medium mb-2">Sharpe Ratio</h3>
            <div className="text-3xl font-bold text-white">
              {(portfolio_metrics?.sharpe_ratio || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Selected Asset Chart */}
        {selectedAsset && chartData && (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
            <PriceChart 
              data={chartData}
              symbol={selectedAsset.name}
              theme="dark"
            />
          </div>
        )}

        {/* Category Cards in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(groupedAllocations).map(([category, assets]) => (
            <CategoryCard
              key={category}
              title={category}
              allocations={assets}
              totalAmount={portfolio_metrics?.total_investment}
              onSelectAsset={setSelectedAsset}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 