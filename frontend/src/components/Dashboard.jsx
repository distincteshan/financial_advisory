import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Area } from '@ant-design/plots';

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

// Function to calculate portfolio value projection
const calculatePortfolioProjection = (initialAmount, expectedReturn, years = 3) => {
  const monthlyData = [];
  const monthlyReturn = (1 + expectedReturn/100)**(1/12) - 1;
  let currentValue = initialAmount;
  
  // Generate monthly data points for 3 years
  for (let month = 0; month <= years * 12; month++) {
    monthlyData.push({
      month: `Month ${month}`,
      value: currentValue,
      // Format date for tooltip
      date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short'
      })
    });
    currentValue *= (1 + monthlyReturn);
  }
  
  return monthlyData;
};

const CategoryCard = ({ title, allocations, totalAmount }) => {
  const categoryTotal = allocations.reduce((sum, asset) => sum + asset.amount, 0);
  const categoryWeight = (categoryTotal / totalAmount) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <span className="text-sm font-medium text-gray-500">{formatPercent(categoryWeight)} of portfolio</span>
      </div>
      <div className="space-y-4">
        {allocations.map((asset) => (
          <div key={asset.ticker} className="flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-700">{asset.name}</div>
              <div className="text-sm text-gray-500">{formatPercent(asset.weight)} allocation</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-700">{formatINR(asset.amount)}</div>
              <div className="text-sm text-gray-500">
                {asset.expected_return > 0 ? '+' : ''}{formatPercent(asset.expected_return)} exp. return
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const amount = localStorage.getItem('investmentAmount') || 100000;
      const response = await axios.get(`http://localhost:5000/portfolio/get-portfolio?amount=${amount}`);
      setPortfolioData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch portfolio data');
      console.error('Error fetching portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Optimizing your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 p-6 rounded-lg text-red-700 max-w-md text-center">
          <div className="text-xl font-bold mb-2">Oops!</div>
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

  // Calculate portfolio projection data
  const projectionData = calculatePortfolioProjection(
    portfolio_metrics?.total_investment || 0,
    portfolio_metrics?.expected_return || 0
  );

  // Configure the area chart
  const areaConfig = {
    data: projectionData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    xAxis: {
      label: {
        formatter: (v) => v.replace('Month ', ''),
        style: {
          fill: '#666',
          fontSize: 12,
        },
      },
      tickCount: 6,
    },
    yAxis: {
      label: {
        formatter: (v) => formatINR(v),
        style: {
          fill: '#666',
          fontSize: 12,
        },
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: 'Projected Value',
        value: formatINR(datum.value),
        date: datum.date,
      }),
    },
    areaStyle: () => ({
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    }),
    line: {
      color: '#1890ff',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with total investment */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Investment Portfolio</h1>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {formatINR(portfolio_metrics?.total_investment)}
          </div>
          <div className="text-gray-600">Total Investment Amount</div>
        </div>

        {/* Portfolio Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-medium mb-2">Expected Return</h3>
            <div className="text-3xl font-bold">{formatPercent(portfolio_metrics?.expected_return || 0)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-medium mb-2">Portfolio Volatility</h3>
            <div className="text-3xl font-bold">{formatPercent(portfolio_metrics?.volatility || 0)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-medium mb-2">Sharpe Ratio</h3>
            <div className="text-3xl font-bold">{(portfolio_metrics?.sharpe_ratio || 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Portfolio Value Projection Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Portfolio Value Projection</h2>
          <div className="h-96">
            <Area {...areaConfig} />
          </div>
          <div className="text-sm text-gray-500 mt-4 text-center">
            Projected growth based on {formatPercent(portfolio_metrics?.expected_return || 0)} annual return
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(groupedAllocations).map(([category, assets]) => (
            <CategoryCard
              key={category}
              title={category}
              allocations={assets}
              totalAmount={portfolio_metrics?.total_investment}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 