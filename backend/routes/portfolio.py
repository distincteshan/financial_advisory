from flask import Blueprint, jsonify, request
from models.portfolio_optimizer import portfolio_optimizer
from functools import lru_cache
from datetime import datetime, timedelta
import logging
import numpy as np
import pandas as pd
from scipy.optimize import minimize

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

portfolio = Blueprint('portfolio', __name__)

# Cache the portfolio data for 1 hour to avoid frequent API calls
@lru_cache(maxsize=1)
def get_cached_portfolio():
    try:
        print("Fetching portfolio data...")
        portfolio_data = portfolio_optimizer.get_optimized_portfolio()
        
        if portfolio_data is None:
            print("Portfolio optimization returned None")
            return None
            
        print("Successfully retrieved portfolio data")
        return portfolio_data
        
    except Exception as e:
        print(f"Error in get_cached_portfolio: {e}")
        return None

def calculate_portfolio_metrics(weights, returns, cov_matrix, risk_free_rate=0.05):
    portfolio_return = np.sum(returns * weights)
    portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))
    sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_volatility
    return portfolio_return, portfolio_volatility, sharpe_ratio

def get_asset_prices():
    # This would typically fetch from a database or external API
    # Using sample data for demonstration
    return {
        'RELIANCE.NS': 2500,
        'TCS.NS': 3500,
        'HDFCBANK.NS': 1600,
        'INFY.NS': 1400,
        'ICICIBANK.NS': 900,
        'HINDUNILVR.NS': 2600,
        'BTC-INR': 4500000,
        'ETH-INR': 250000,
        'SOL-INR': 8000,
        'HDFC_FLEXI_CAP': 100,
        'GC=F': 60000
    }

@portfolio.route('/get-portfolio', methods=['GET'])
def get_portfolio():
    try:
        logger.debug("Handling /get-portfolio request...")
        # Get investment amount from query parameter
        investment_amount = float(request.args.get('amount', 100000))
        logger.debug(f"Investment amount: {investment_amount}")
        
        # Sample historical returns and volatility data
        assets_data = {
            'Stocks': [
                {
                    'name': 'Reliance Industries',
                    'ticker': 'RELIANCE.NS',
                    'expected_return': 15,
                    'weight': 0.15,
                },
                {
                    'name': 'TCS',
                    'ticker': 'TCS.NS',
                    'expected_return': 12,
                    'weight': 0.10,
                },
                {
                    'name': 'HDFC Bank',
                    'ticker': 'HDFCBANK.NS',
                    'expected_return': 14,
                    'weight': 0.10,
                },
                {
                    'name': 'Infosys',
                    'ticker': 'INFY.NS',
                    'expected_return': 13,
                    'weight': 0.10,
                },
                {
                    'name': 'ICICI Bank',
                    'ticker': 'ICICIBANK.NS',
                    'expected_return': 16,
                    'weight': 0.10,
                },
                {
                    'name': 'Hindustan Unilever',
                    'ticker': 'HINDUNILVR.NS',
                    'expected_return': 10,
                    'weight': 0.10,
                }
            ],
            'Cryptocurrency': [
                {
                    'name': 'Bitcoin',
                    'ticker': 'BTC-INR',
                    'expected_return': 25,
                    'weight': 0.10,
                },
                {
                    'name': 'Ethereum',
                    'ticker': 'ETH-INR',
                    'expected_return': 20,
                    'weight': 0.08,
                },
                {
                    'name': 'Solana',
                    'ticker': 'SOL-INR',
                    'expected_return': 30,
                    'weight': 0.07,
                }
            ],
            'Mutual Funds': [
                {
                    'name': 'HDFC Flexi Cap Fund',
                    'ticker': 'HDFC_FLEXI_CAP',
                    'expected_return': 12,
                    'weight': 0.05,
                }
            ],
            'Commodities': [
                {
                    'name': 'Gold',
                    'ticker': 'GC=F',
                    'expected_return': 8,
                    'weight': 0.05,
                }
            ]
        }

        # Get current prices
        prices = get_asset_prices()
        
        # Calculate allocations and add quantity data
        allocations = []
        for category, assets in assets_data.items():
            for asset in assets:
                asset_amount = investment_amount * asset['weight']
                current_price = prices[asset['ticker']]
                quantity = asset_amount / current_price
                
                allocations.append({
                    'name': asset['name'],
                    'ticker': asset['ticker'],
                    'category': category,
                    'expected_return': asset['expected_return'],
                    'amount': asset_amount,
                    'quantity': quantity,
                    'initial_investment': asset_amount,
                    'weight': asset['weight']
                })

        # Calculate portfolio metrics
        weights = np.array([asset['weight'] for asset in allocations])
        returns = np.array([asset['expected_return'] / 100 for asset in allocations])
        
        # Sample covariance matrix (simplified)
        n_assets = len(allocations)
        cov_matrix = np.eye(n_assets) * 0.04  # Assuming 20% volatility for each asset
        for i in range(n_assets):
            for j in range(n_assets):
                if i != j:
                    cov_matrix[i,j] = 0.02  # Assuming 0.02 covariance between assets

        portfolio_return, portfolio_volatility, sharpe_ratio = calculate_portfolio_metrics(
            weights, returns, cov_matrix
        )

        # Log the portfolio data structure
        logger.debug("Portfolio data structure:")
        logger.debug(f"Portfolio metrics: {portfolio_return * 100}, {portfolio_volatility * 100}, {sharpe_ratio}")
        logger.debug(f"Allocations: {allocations}")
        
        # Validate the data structure
        if not isinstance(allocations, list):
            logger.error("Invalid allocations data structure")
            return jsonify({
                'error': 'Invalid portfolio data structure'
            }), 500
            
        # Validate each allocation entry
        for allocation in allocations:
            if not all(key in allocation for key in ['name', 'category', 'weight', 'amount']):
                logger.error(f"Invalid allocation entry: {allocation}")
                return jsonify({
                    'error': 'Invalid allocation data structure'
                }), 500
            
            # Ensure numerical values are valid
            try:
                allocation['weight'] = float(allocation['weight'])
                allocation['amount'] = float(allocation['amount'])
            except (ValueError, TypeError) as e:
                logger.error(f"Invalid numerical values in allocation: {allocation}")
                return jsonify({
                    'error': 'Invalid numerical values in allocation data'
                }), 500
        
        logger.debug("Returning validated portfolio data to client")
        return jsonify({
            'portfolio_metrics': {
                'total_investment': investment_amount,
                'expected_return': portfolio_return * 100,
                'volatility': portfolio_volatility * 100,
                'sharpe_ratio': sharpe_ratio
            },
            'allocations': allocations
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_portfolio route: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal server error. Please try again later.'
        }), 500 