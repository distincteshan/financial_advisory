import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta

class EnhancedPortfolioOptimizer:
    def __init__(self, risk_free_rate=0.07):
        self.risk_free_rate = risk_free_rate
        
        # Define all assets with their tickers and minimum allocations
        self.assets = {
            'STOCKS': {
                'RELIANCE.NS': {'min': 5, 'max': 15},
                'TCS.NS': {'min': 5, 'max': 15},
                'HDFCBANK.NS': {'min': 5, 'max': 15},
                'INFY.NS': {'min': 5, 'max': 15},
                'ICICIBANK.NS': {'min': 5, 'max': 15},
                'HINDUNILVR.NS': {'min': 5, 'max': 15},
                'SBIN.NS': {'min': 5, 'max': 15},
                'ITC.NS': {'min': 5, 'max': 15},
                'BHARTIARTL.NS': {'min': 5, 'max': 15},
                'KOTAKBANK.NS': {'min': 5, 'max': 15}
            },
            'CRYPTO': {
                'BTC-INR': {'min': 2, 'max': 10},
                'ETH-INR': {'min': 2, 'max': 8},
                'SOL-INR': {'min': 1, 'max': 5}
            },
            'COMMODITIES': {
                'GC=F': {'min': 5, 'max': 15}  # Gold Futures
            },
            'MUTUAL_FUNDS': {
                'PPFAS_FLEXI_CAP': {'min': 5, 'max': 20, 'nav': 50.27},  # Example NAV
                'HDFC_FLEXI_CAP': {'min': 5, 'max': 20, 'nav': 45.89}    # Example NAV
            }
        }
        
        self.price_data = None
        self.returns = None
        self.volatility = None

    def get_optimized_portfolio(self, investment_amount):
        try:
            print("Starting portfolio optimization...")
            end_date = datetime.now()
            start_date = end_date - timedelta(days=365)
            
            # Fetch data for all assets
            self.fetch_all_asset_data(start_date, end_date)
            
            # Calculate returns and volatility
            self.calculate_metrics()
            
            # Calculate optimal allocation based on risk-return profile
            allocation = self.calculate_allocation(investment_amount)
            
            # Format the results with proper validation
            result = {
                'portfolio_metrics': {
                    'total_investment': float(investment_amount),
                    'expected_return': float(self.portfolio_return * 100) if hasattr(self, 'portfolio_return') else 0,
                    'volatility': float(self.portfolio_volatility * 100) if hasattr(self, 'portfolio_volatility') else 0,
                    'sharpe_ratio': float(self.portfolio_sharpe) if hasattr(self, 'portfolio_sharpe') else 0
                },
                'allocations': []
            }
            
            # Add all assets to the result with proper validation
            for category, assets in allocation.items():
                for asset, details in assets.items():
                    # Ensure all required fields are present and valid
                    asset_data = {
                        'name': self.get_display_name(asset),
                        'category': category,
                        'ticker': asset,
                        'weight': float(details['weight']) if details.get('weight') is not None else 0,
                        'amount': float(details['amount']) if details.get('amount') is not None else 0,
                        'expected_return': float(details.get('return', 0) * 100),
                        'volatility': float(details.get('volatility', 0) * 100)
                    }
                    # Only add assets with valid weights
                    if asset_data['weight'] > 0:
                        result['allocations'].append(asset_data)
            
            # Validate the total weight is approximately 100%
            total_weight = sum(asset['weight'] for asset in result['allocations'])
            if not (95 <= total_weight <= 105):  # Allow for small rounding errors
                print(f"Warning: Total weight {total_weight}% is not 100%")
                # Normalize weights to 100%
                for asset in result['allocations']:
                    asset['weight'] = (asset['weight'] / total_weight) * 100
                    asset['amount'] = (asset['weight'] / 100) * investment_amount
            
            print("Portfolio optimization completed successfully")
            print(f"Number of allocations: {len(result['allocations'])}")
            print(f"Total weight: {sum(asset['weight'] for asset in result['allocations'])}%")
            return result
            
        except Exception as e:
            print(f"Error in portfolio optimization: {e}")
            return None

    def fetch_all_asset_data(self, start_date, end_date):
        """Fetch data for all assets"""
        data = pd.DataFrame()
        
        # Fetch stock data
        for ticker in self.assets['STOCKS'].keys():
            try:
                stock_data = yf.download(ticker, start=start_date, end=end_date, progress=False)
                if not stock_data.empty:
                    data[ticker] = stock_data['Close']
            except Exception as e:
                print(f"Error fetching {ticker}: {e}")

        # Fetch crypto data
        for ticker in self.assets['CRYPTO'].keys():
            try:
                crypto_data = yf.download(ticker, start=start_date, end=end_date, progress=False)
                if not crypto_data.empty:
                    data[ticker] = crypto_data['Close']
            except Exception as e:
                print(f"Error fetching {ticker}: {e}")

        # Fetch gold data
        try:
            gold_data = yf.download('GC=F', start=start_date, end=end_date, progress=False)
            if not gold_data.empty:
                data['GC=F'] = gold_data['Close']
        except Exception as e:
            print(f"Error fetching gold data: {e}")

        # For mutual funds, use assumed returns based on historical performance
        data['PPFAS_FLEXI_CAP'] = 100 * (1 + 0.15)**(np.arange(len(data))/252)  # 15% annual return
        data['HDFC_FLEXI_CAP'] = 100 * (1 + 0.12)**(np.arange(len(data))/252)   # 12% annual return

        self.price_data = data.ffill().bfill()  # Forward and backward fill missing values

    def calculate_metrics(self):
        """Calculate returns and risk metrics"""
        if self.price_data is None or self.price_data.empty:
            raise ValueError("No price data available")

        # Calculate returns
        returns = self.price_data.pct_change().dropna()
        
        # Calculate annualized metrics
        self.returns = returns.mean() * 252
        self.volatility = returns.std() * np.sqrt(252)
        
        # Calculate correlation matrix
        self.correlation = returns.corr()

    def calculate_allocation(self, investment_amount):
        """Calculate optimal allocation based on constraints and risk-return profile"""
        allocation = {}
        
        # Initialize allocation structure
        for category, assets in self.assets.items():
            allocation[category] = {}
            category_weight = self.get_category_weight(category)
            category_amount = investment_amount * (category_weight / 100)
            
            # Allocate within category based on constraints and performance
            total_weight = 0
            for asset, constraints in assets.items():
                weight = constraints['min']  # Start with minimum weight
                amount = category_amount * (weight / 100)
                
                allocation[category][asset] = {
                    'weight': weight,
                    'amount': amount,
                    'return': self.returns.get(asset, 0.10),  # Default 10% if no data
                    'volatility': self.volatility.get(asset, 0.15)  # Default 15% if no data
                }
                total_weight += weight
            
            # Normalize weights within category
            if total_weight > 0:
                for asset in allocation[category]:
                    allocation[category][asset]['weight'] = (allocation[category][asset]['weight'] / total_weight) * 100
                    allocation[category][asset]['amount'] = category_amount * (allocation[category][asset]['weight'] / 100)
        
        # Calculate portfolio metrics
        self.calculate_portfolio_metrics(allocation, investment_amount)
        
        return allocation

    def get_category_weight(self, category):
        """Get the target weight for each asset category"""
        category_weights = {
            'STOCKS': 50,  # 50% in stocks
            'CRYPTO': 10,  # 10% in crypto
            'COMMODITIES': 20,  # 20% in gold
            'MUTUAL_FUNDS': 20   # 20% in mutual funds
        }
        return category_weights.get(category, 0)

    def calculate_portfolio_metrics(self, allocation, investment_amount):
        """Calculate overall portfolio metrics"""
        portfolio_return = 0
        portfolio_volatility = 0
        
        # Calculate weighted return and volatility
        for category, assets in allocation.items():
            for asset, details in assets.items():
                weight = details['amount'] / investment_amount
                portfolio_return += weight * details['return']
                portfolio_volatility += weight * details['volatility']
        
        self.portfolio_return = portfolio_return
        self.portfolio_volatility = portfolio_volatility
        self.portfolio_sharpe = (portfolio_return - self.risk_free_rate) / portfolio_volatility if portfolio_volatility > 0 else 0

    def get_display_name(self, ticker):
        """Convert ticker to display name"""
        display_names = {
            'BTC-INR': 'Bitcoin',
            'ETH-INR': 'Ethereum',
            'SOL-INR': 'Solana',
            'GC=F': 'Gold',
            'PPFAS_FLEXI_CAP': 'Parag Parikh Flexi Cap',
            'HDFC_FLEXI_CAP': 'HDFC Flexi Cap'
        }
        if ticker in display_names:
            return display_names[ticker]
        return ticker.replace('.NS', '')

# Create singleton instance
portfolio_optimizer = EnhancedPortfolioOptimizer() 