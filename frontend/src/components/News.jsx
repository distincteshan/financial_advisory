import React, { useState, useEffect } from 'react';
import Navbar from './NavBar';
import { motion } from 'framer-motion';
import { fadeIn, textVariant } from '../utils/motion';

const NewsCard = ({ article, index }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <motion.div
      variants={fadeIn("up", 0.1 * index)}
      className="bg-black/40 rounded-xl border border-gray-800 hover:border-indigo-500/30 transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={() => window.open(article.url, '_blank')}
    >
      {article.urlToImage && (
        <div className="h-48 overflow-hidden">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-indigo-400 text-sm font-medium">
            {article.source?.name || 'Unknown Source'}
          </span>
          <span className="text-gray-500 text-xs">
            {formatDate(article.publishedAt)}
          </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-3 group-hover:text-indigo-400 transition-colors duration-300">
          {truncateText(article.title, 100)}
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          {truncateText(article.description, 150)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-indigo-400 text-sm font-medium group-hover:text-indigo-300 transition-colors duration-300">
            Read more →
          </span>
          {article.author && (
            <span className="text-gray-500 text-xs">
              By {truncateText(article.author, 30)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const NewsSection = ({ title, articles, loading, error, icon }) => {
  if (loading) {
    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <span>{title}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-black/40 rounded-xl border border-gray-800 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-700"></div>
              <div className="p-6">
                <div className="h-4 bg-gray-700 rounded mb-3"></div>
                <div className="h-6 bg-gray-700 rounded mb-3"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <span>{title}</span>
        </h2>
        <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-2">Failed to load news</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeIn("up", 0.3)}
      initial="hidden"
      whileInView="show"
      className="mb-16"
    >
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <span>{title}</span>
      </h2>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <NewsCard key={index} article={article} index={index} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
          <p className="text-gray-400">No news articles available at the moment.</p>
        </div>
      )}
    </motion.div>
  );
};

const News = () => {
  const [globalNews, setGlobalNews] = useState([]);
  const [indianNews, setIndianNews] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [indianLoading, setIndianLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [indianError, setIndianError] = useState(null);

  const fetchNews = async () => {
    try {
      setGlobalLoading(true);
      setIndianLoading(true);
      setGlobalError(null);
      setIndianError(null);

      // Fetch from our backend API
      const [globalResponse, indianResponse] = await Promise.all([
        fetch('http://localhost:5000/api/news/global'),
        fetch('http://localhost:5000/api/news/indian')
      ]);

      const globalData = await globalResponse.json();
      const indianData = await indianResponse.json();

      if (globalData.success && globalData.articles) {
        setGlobalNews(globalData.articles);
      } else {
        console.error('Failed to fetch global news:', globalData.error);
        setGlobalError(globalData.error || 'Failed to fetch global news');
        // Fallback to sample data
        setGlobalNews(sampleGlobalNews);
      }

      if (indianData.success && indianData.articles) {
        setIndianNews(indianData.articles);
      } else {
        console.error('Failed to fetch Indian news:', indianData.error);
        setIndianError(indianData.error || 'Failed to fetch Indian news');
        // Fallback to sample data
        setIndianNews(sampleIndianNews);
      }

    } catch (error) {
      console.error('Error fetching news:', error);
      setGlobalError('Failed to connect to news service');
      setIndianError('Failed to connect to news service');
      
      // Fallback to sample data when API is unavailable
      setGlobalNews(sampleGlobalNews);
      setIndianNews(sampleIndianNews);
    } finally {
      setGlobalLoading(false);
      setIndianLoading(false);
    }
  };

  const sampleIndianNews = [
    {
      title: "Nifty 50 Hits Record High as Banking Stocks Surge",
          description: "The Nifty 50 index reached new heights driven by strong performance in banking and financial services sectors.",
          url: "https://example.com/indian-news1",
          urlToImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date().toISOString(),
          source: { name: "Economic Times" },
          author: "Market Reporter"
        },
        {
          title: "RBI Maintains Policy Rates in Latest Monetary Review",
          description: "The Reserve Bank of India keeps key policy rates unchanged while monitoring inflation and growth dynamics.",
          url: "https://example.com/indian-news2",
          urlToImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: { name: "Business Standard" },
          author: "RBI Correspondent"
        },
        {
          title: "IT Sector Leads Market Rally with Strong Q4 Results",
          description: "Indian IT giants report robust quarterly earnings, driving broader market optimism and sector outperformance.",
          url: "https://example.com/indian-news3",
          urlToImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: { name: "Money Control" },
          author: "IT Sector Analyst"
        },
        {
          title: "FIIs Return to Indian Markets After Recent Outflows",
          description: "Foreign institutional investors show renewed interest in Indian equities following recent market corrections.",
          url: "https://example.com/indian-news4",
          urlToImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 10800000).toISOString(),
          source: { name: "Business Today" },
          author: "FII Tracker"
        },
        {
          title: "Indian Rupee Strengthens Against Dollar",
          description: "The Indian rupee gains ground against the US dollar supported by positive economic indicators and FII inflows.",
          url: "https://example.com/indian-news5",
          urlToImage: "https://images.unsplash.com/photo-1582282508702-57d89071f8d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 14400000).toISOString(),
          source: { name: "Hindu BusinessLine" },
          author: "Currency Expert"
        },
        {
          title: "GST Collections Hit New Record High",
          description: "India's GST collections reach unprecedented levels, indicating strong economic activity and improved compliance.",
          url: "https://example.com/indian-news6",
          urlToImage: "https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 18000000).toISOString(),
          source: { name: "Live Mint" },
          author: "Tax Reporter"
        }
      ];

  const sampleGlobalNews = [
        {
          title: "Global Stock Markets Show Mixed Performance Amid Economic Uncertainty",
          description: "Major stock indices worldwide displayed varied performance as investors weigh economic indicators and central bank policies.",
          url: "https://example.com/news1",
          urlToImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date().toISOString(),
          source: { name: "Financial Times" },
          author: "Market Correspondent"
        },
        {
          title: "Federal Reserve Signals Potential Interest Rate Changes",
          description: "The Federal Reserve's latest statements indicate possible adjustments to monetary policy in response to inflation data.",
          url: "https://example.com/news2",
          urlToImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: { name: "Reuters" },
          author: "Economics Reporter"
        },
        {
          title: "Cryptocurrency Market Experiences Volatility",
          description: "Bitcoin and other major cryptocurrencies see significant price movements as regulatory news impacts investor sentiment.",
          url: "https://example.com/news3",
          urlToImage: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: { name: "CoinDesk" },
          author: "Crypto Analyst"
        },
        {
          title: "Tech Sector Shows Strong Earnings Growth",
          description: "Leading technology companies report better-than-expected quarterly results, boosting sector confidence.",
          url: "https://example.com/news4",
          urlToImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 10800000).toISOString(),
          source: { name: "TechCrunch" },
          author: "Tech Reporter"
        },
        {
          title: "Oil Prices Fluctuate on Supply Chain Concerns",
          description: "Crude oil markets react to geopolitical developments and supply chain disruptions affecting global energy trade.",
          url: "https://example.com/news5",
          urlToImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 14400000).toISOString(),
          source: { name: "Bloomberg" },
          author: "Energy Correspondent"
        },
        {
          title: "Gold Reaches New Highs Amid Market Uncertainty",
          description: "Precious metals see increased demand as investors seek safe-haven assets during volatile market conditions.",
          url: "https://example.com/news6",
          urlToImage: "https://images.unsplash.com/photo-1610375461246-83df859d849d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          publishedAt: new Date(Date.now() - 18000000).toISOString(),
          source: { name: "MarketWatch" },
          author: "Commodities Analyst"
        }
      ];

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      {/* Animated Dots */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] -z-10"></div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <motion.div
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          animate="show"
          className="text-center mb-16 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
          <motion.h1
            variants={textVariant(0.3)}
            className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Financial News
          </motion.h1>
          <motion.p
            variants={fadeIn("up", 0.4)}
            className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Stay informed with the latest global and Indian financial news. 
            Make better investment decisions with real-time market insights and analysis.
          </motion.p>
          <motion.button
            variants={fadeIn("up", 0.5)}
            onClick={fetchNews}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2 mx-auto"
          >
            <span>🔄</span>
            <span>Refresh News</span>
          </motion.button>
        </motion.div>

        {/* Global Financial News */}
        <NewsSection
          title="Global Financial News"
          articles={globalNews}
          loading={globalLoading}
          error={globalError}
          icon="🌍"
        />

        {/* Indian Financial News */}
        <NewsSection
          title="Indian Financial News"
          articles={indianNews}
          loading={indianLoading}
          error={indianError}
          icon="🇮🇳"
        />

        {/* News Sources Disclaimer */}
        <motion.div
          variants={fadeIn("up", 0.6)}
          initial="hidden"
          whileInView="show"
          className="mt-16 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
        >
          <h3 className="text-blue-400 font-semibold mb-2">📰 News Sources</h3>
          <p className="text-gray-400 text-sm">
            News content is sourced from reputable financial publications and news agencies. 
            This information is for educational purposes only and should not be considered as investment advice. 
            Always verify information from multiple sources before making investment decisions.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default News; 