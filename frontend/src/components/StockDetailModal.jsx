import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const NEWS_API_KEY = '95b376f42d204ed2a78b5b116b7a5a1c'; // TODO: Move to backend in production

const StockDetailModal = ({ open, onClose, ticker, name }) => {
  const [priceData, setPriceData] = useState(null);
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    if (!open || !ticker) return;
    setLoading(true);
    setNewsLoading(true);
    // Fetch price history and stats from backend
    const fetchData = async () => {
      try {
        // Fetch price history (last 90 days)
        const priceRes = await fetch(`http://localhost:5000/api/market/history/${ticker}?days=90`);
        const priceJson = await priceRes.json();
        setPriceData(priceJson);
        // Fetch stats (use the same endpoint or a new one if available)
        const statsRes = await fetch(`http://localhost:5000/api/market/stats/${ticker}`);
        const statsJson = await statsRes.json();
        setStats(statsJson);
      } catch (e) {
        setPriceData(null);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Fetch news from NewsAPI
    const fetchNews = async () => {
      try {
        // Improved query for stock-specific news
        let query = '';
        if (name && ticker) {
          query = `(${ticker} OR \"${name}\" OR \"${name} stock\" OR \"${name} share\")`;
        } else if (name) {
          query = `(${name} OR \"${name} stock\" OR \"${name} share\")`;
        } else {
          query = ticker;
        }
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${NEWS_API_KEY}&language=en&sortBy=publishedAt&pageSize=5`;
        const res = await fetch(url);
        const json = await res.json();
        setNews(json.articles || []);
      } catch (e) {
        setNews([]);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, [open, ticker, name]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl p-8 relative border border-gray-700 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-white mb-2">{name} <span className="text-gray-400 text-lg">({ticker})</span></h2>
        {loading ? (
          <div className="text-gray-400 py-8 text-center">Loading price data...</div>
        ) : priceData && priceData.history ? (
          <div className="mb-6">
            <Line
              data={{
                labels: priceData.history.map(d => d.date),
                datasets: [{
                  label: 'Price (INR)',
                  data: priceData.history.map(d => d.price),
                  borderColor: '#4F46E5',
                  backgroundColor: 'rgba(79,70,229,0.1)',
                  tension: 0.2,
                  fill: true,
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Last 90 Days Price', color: '#fff' },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  x: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } },
                  y: { ticks: { color: '#cbd5e1' }, grid: { color: '#334155' } }
                }
              }}
            />
          </div>
        ) : (
          <div className="text-gray-400 py-8 text-center">No price data available.</div>
        )}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Market Cap</div>
              <div className="text-white font-bold">{stats.marketCap ? `₹${stats.marketCap.toLocaleString()}` : '-'}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">PE Ratio</div>
              <div className="text-white font-bold">{stats.peRatio || '-'}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">52W High</div>
              <div className="text-white font-bold">{stats.high52 || '-'}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">52W Low</div>
              <div className="text-white font-bold">{stats.low52 || '-'}</div>
            </div>
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Latest News</h3>
          {newsLoading ? (
            <div className="text-gray-400">Loading news...</div>
          ) : news.length > 0 ? (
            <ul className="space-y-3">
              {news.map((article, idx) => (
                <li key={idx} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition cursor-pointer" onClick={() => window.open(article.url, '_blank')}>
                  <div className="text-indigo-400 font-medium text-sm mb-1">{article.source?.name || 'News'}</div>
                  <div className="text-white font-bold mb-1">{article.title}</div>
                  <div className="text-gray-400 text-xs mb-1">{new Date(article.publishedAt).toLocaleString()}</div>
                  <div className="text-gray-300 text-sm">{article.description}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400">No news found for this stock.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal; 