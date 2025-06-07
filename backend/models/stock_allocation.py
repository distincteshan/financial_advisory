import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from scipy.optimize import minimize
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StockAllocationModel:
    def __init__(self, risk_free_rate=0.07):
        self.risk_free_rate = risk_free_rate
        self.nifty50_tickers = [
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS", 
            "HINDUNILVR.NS", "SBIN.NS", "ITC.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
            "AXISBANK.NS", "BAJFINANCE.NS", "SUNPHARMA.NS", "BAJAJFINSV.NS", "ADANIPORTS.NS",
            "MARUTI.NS", "M&M.NS", "POWERGRID.NS", "NTPC.NS", "DRREDDY.NS"
        ]
        
    def fetch_stock_data(self):
        """Fetch and prepare stock data"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        logger.info("Fetching stock data...")
        
        # Initialize data storage
        price_data = pd.DataFrame()
        valid_tickers = []
        
        # Fetch data for each ticker
        for ticker in self.nifty50_tickers:
            try:
                stock_data = yf.download(ticker, start=start_date, end=end_date, progress=False)
                if not stock_data.empty and len(stock_data) > 100:
                    price_data[ticker] = stock_data['Close']
                    valid_tickers.append(ticker)
            except Exception as e:
                logger.warning(f"Error fetching data for {ticker}: {e}")
        
        # Clean and prepare data
        self.price_data = price_data.dropna(axis=1, thresh=len(price_data)*0.7)
        self.price_data = self.price_data.ffill()
        self.valid_tickers = list(self.price_data.columns)
        
        # Calculate daily returns
        daily_returns = (self.price_data / self.price_data.shift(1) - 1).dropna()
        
        # Calculate annualized returns properly
        # First get total return for the period
        total_returns = (self.price_data.iloc[-1] / self.price_data.iloc[0]) - 1
        
        # Convert to annualized returns using actual number of trading days
        days = len(self.price_data)
        self.annual_returns = ((1 + total_returns) ** (252/days)) - 1
        
        # Calculate annualized volatility
        self.annual_volatility = daily_returns.std() * np.sqrt(252)
        
        # Calculate covariance matrix
        self.covariance = daily_returns.cov() * 252
        
        # Store daily returns for other calculations
        self.returns = daily_returns
        
        logger.info(f"Successfully processed data for {len(self.valid_tickers)} stocks")
        
    def calculate_momentum_scores(self):
        """Calculate momentum scores for stock selection"""
        # 3-month momentum (higher weight)
        three_month_ago = max(0, len(self.price_data) - 63)
        momentum_3m = (self.price_data.iloc[-1] / self.price_data.iloc[three_month_ago] - 1) * 0.7
        
        # 6-month momentum (lower weight)
        six_month_ago = max(0, len(self.price_data) - 126)
        momentum_6m = (self.price_data.iloc[-1] / self.price_data.iloc[six_month_ago] - 1) * 0.3
        
        self.momentum_scores = momentum_3m + momentum_6m
        
    def select_top_stocks(self, n=15):
        """Select top N stocks based on momentum and Sharpe ratio"""
        # Calculate Sharpe ratios
        sharpe_ratios = (self.annual_returns - self.risk_free_rate) / self.annual_volatility
        
        # Combine momentum and Sharpe ratio scores
        combined_score = 0.6 * self.momentum_scores.rank() + 0.4 * sharpe_ratios.rank()
        
        # Select top N stocks
        self.top_stocks = combined_score.nlargest(n).index.tolist()
        
        return self.top_stocks
        
    def optimize_portfolio(self):
        """Optimize portfolio weights for the selected stocks"""
        n_assets = len(self.top_stocks)
        
        # Filter data for selected stocks
        filtered_returns = self.annual_returns[self.top_stocks]
        filtered_cov = self.covariance.loc[self.top_stocks, self.top_stocks]
        
        def portfolio_volatility(weights):
            return np.sqrt(np.dot(weights.T, np.dot(filtered_cov, weights)))
            
        def portfolio_return(weights):
            return np.sum(filtered_returns * weights)
            
        def sharpe_ratio(weights):
            ret = portfolio_return(weights)
            vol = portfolio_volatility(weights)
            return (ret - self.risk_free_rate) / vol
            
        def objective(weights):
            return -sharpe_ratio(weights)  # Minimize negative Sharpe ratio = Maximize Sharpe ratio
            
        # Constraints
        constraints = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}  # Weights sum to 1
        ]
        
        # Bounds (2% to 15% per stock)
        bounds = tuple((0.02, 0.15) for _ in range(n_assets))
        
        # Initial weights based on momentum ranking
        momentum_ranks = self.momentum_scores[self.top_stocks].rank()
        initial_weights = momentum_ranks / momentum_ranks.sum()
        
        try:
            result = minimize(
                objective,
                initial_weights,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints
            )
            
            if result.success:
                optimal_weights = result.x
            else:
                logger.warning("Optimization failed, using momentum-based weights")
                optimal_weights = initial_weights
                
        except Exception as e:
            logger.error(f"Optimization error: {e}")
            optimal_weights = initial_weights
            
        return optimal_weights
        
    def generate_optimized_portfolio(self):
        """Generate complete optimized portfolio with all metrics"""
        # Fetch and prepare data
        self.fetch_stock_data()
        
        # Calculate momentum scores
        self.calculate_momentum_scores()
        
        # Select top stocks
        self.select_top_stocks()
        
        # Optimize weights
        optimal_weights = self.optimize_portfolio()
        
        # Create portfolio dataframe
        portfolio = pd.DataFrame({
            'Ticker': self.top_stocks,
            'Weight': optimal_weights * 100,  # Convert to percentage
            'Expected Return': self.annual_returns[self.top_stocks] * 100,  # Convert to percentage
            'Volatility': self.annual_volatility[self.top_stocks] * 100,  # Convert to percentage
            'Momentum Score': self.momentum_scores[self.top_stocks]
        })
        
        # Sort by weight
        portfolio = portfolio.sort_values('Weight', ascending=False)
        
        # Cap returns at reasonable levels
        portfolio['Expected Return'] = portfolio['Expected Return'].clip(-50, 50)
        
        return portfolio 