import React from 'react';

const Dashboard = () => {
  // Dummy portfolio data
  const portfolioData = {
    riskProfile: "Moderate",
    totalValue: 100000,
    allocation: [
      { name: "Stocks", percentage: 50, value: 50000, color: "bg-blue-500" },
      { name: "Bonds", percentage: 30, value: 30000, color: "bg-green-500" },
      { name: "Cash", percentage: 10, value: 10000, color: "bg-yellow-500" },
      { name: "Real Estate", percentage: 10, value: 10000, color: "bg-purple-500" }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Investment Portfolio</h1>
          <p className="mt-2 text-gray-600">Risk Profile: {portfolioData.riskProfile}</p>
        </div>

        {/* Portfolio Summary Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Portfolio Summary</h2>
          <div className="text-2xl font-bold text-gray-900 mb-4">
            ${portfolioData.totalValue.toLocaleString()}
          </div>

          {/* Asset Allocation Bars */}
          <div className="space-y-4">
            {portfolioData.allocation.map((asset, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{asset.name}</span>
                  <span>{asset.percentage}% (${asset.value.toLocaleString()})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`${asset.color} h-2.5 rounded-full`}
                    style={{ width: `${asset.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Portfolio Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Annual Return</span>
                <span className="font-semibold text-gray-900">8.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Risk Level</span>
                <span className="font-semibold text-gray-900">Moderate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Portfolio Beta</span>
                <span className="font-semibold text-gray-900">0.85</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Consider increasing bond allocation for better diversification
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Review portfolio rebalancing quarterly
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Monitor market conditions for potential adjustments
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 