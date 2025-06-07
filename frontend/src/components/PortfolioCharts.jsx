import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PortfolioCharts = ({ portfolioData }) => {
  if (!portfolioData) return null;

  // Generate colors for charts
  const colors = [
    '#4F46E5', // Indigo
    '#06B6D4', // Cyan
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ];

  // 1. Asset Allocation Pie Chart Data
  const allocationData = {
    labels: portfolioData.allocations.map(a => a.name),
    datasets: [{
      data: portfolioData.allocations.map(a => a.weight * 100),
      backgroundColor: colors,
      borderWidth: 1
    }]
  };

  // 2. Category-wise Investment Bar Chart Data
  const categoryData = portfolioData.allocations.reduce((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = 0;
    }
    acc[curr.category] += curr.amount;
    return acc;
  }, {});

  const categoryChartData = {
    labels: Object.keys(categoryData),
    datasets: [{
      label: 'Investment Amount (₹)',
      data: Object.values(categoryData),
      backgroundColor: colors.slice(0, Object.keys(categoryData).length),
      borderWidth: 1
    }]
  };

  // 3. Expected Returns Bar Chart Data
  const returnsData = {
    labels: portfolioData.allocations.map(a => a.name),
    datasets: [{
      label: 'Expected Return (%)',
      data: portfolioData.allocations.map(a => a.expected_return),
      backgroundColor: colors.slice(0, portfolioData.allocations.length),
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#F3F4F6',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        color: '#F3F4F6',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#F3F4F6'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#F3F4F6',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Portfolio Metrics Summary */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm">Total Investment</h3>
          <p className="text-2xl font-bold text-white">
            ₹{portfolioData.portfolio_metrics.total_investment.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm">Expected Return</h3>
          <p className="text-2xl font-bold text-green-500">
            {portfolioData.portfolio_metrics.expected_return.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm">Volatility</h3>
          <p className="text-2xl font-bold text-yellow-500">
            {portfolioData.portfolio_metrics.volatility.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-gray-400 text-sm">Sharpe Ratio</h3>
          <p className="text-2xl font-bold text-blue-500">
            {portfolioData.portfolio_metrics.sharpe_ratio.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Asset Allocation Pie Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Asset Allocation</h2>
        <div className="h-80">
          <Pie 
            data={allocationData} 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Portfolio Allocation (%)'
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Category-wise Investment Bar Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-white">Investment by Category</h2>
        <div className="h-80">
          <Bar 
            data={categoryChartData} 
            options={{
              ...barOptions,
              plugins: {
                ...barOptions.plugins,
                title: {
                  ...barOptions.plugins.title,
                  text: 'Investment Distribution by Category'
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Expected Returns Bar Chart */}
      <div className="bg-gray-800 rounded-lg p-6 col-span-1 md:col-span-2">
        <h2 className="text-xl font-bold mb-4 text-white">Expected Returns by Asset</h2>
        <div className="h-80">
          <Bar 
            data={returnsData} 
            options={{
              ...barOptions,
              plugins: {
                ...barOptions.plugins,
                title: {
                  ...barOptions.plugins.title,
                  text: 'Expected Returns by Asset (%)'
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default PortfolioCharts; 