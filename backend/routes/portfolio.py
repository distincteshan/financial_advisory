from flask import Blueprint, jsonify, request
from models.portfolio_optimizer import portfolio_optimizer
from functools import lru_cache
from datetime import datetime, timedelta
import logging
import numpy as np
import pandas as pd
from scipy.optimize import minimize
import jwt
from config import SECRET_KEY, users_collection
from bson import ObjectId

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
        
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"message": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode token
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        # Get user data from database
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        # Get investment amount from user data
        investment_amount = user.get('investment_amount')
        if not investment_amount:
            return jsonify({"message": "No investment amount found. Please complete the questionnaire."}), 400
            
        logger.debug(f"User investment amount: {investment_amount}")
        
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
                    'nav': 50.27  # NAV for mutual fund
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
        remaining_amount = 0  # To track leftover amount from rounding

        for category, assets in assets_data.items():
            for asset in assets:
                asset_amount = investment_amount * asset['weight']
                current_price = prices[asset['ticker']]
                
                # Calculate quantity based on asset type
                if category == 'Stocks':
                    # For stocks, round down to nearest integer
                    quantity = int(asset_amount / current_price)
                    actual_amount = quantity * current_price
                    remaining_amount += asset_amount - actual_amount
                elif category == 'Mutual Funds':
                    # For mutual funds, use 4 decimal places
                    quantity = round(asset_amount / asset['nav'], 4)
                    actual_amount = quantity * asset['nav']
                else:
                    # For other assets (crypto, commodities), use normal division
                    quantity = asset_amount / current_price
                    actual_amount = asset_amount
                
                allocations.append({
                    'name': asset['name'],
                    'ticker': asset['ticker'],
                    'category': category,
                    'expected_return': asset['expected_return'],
                    'amount': actual_amount,
                    'quantity': quantity,
                    'initial_investment': actual_amount,
                    'weight': asset['weight'],
                    'current_price': current_price
                })

        # If there's remaining amount from stock rounding, redistribute to mutual funds
        if remaining_amount > 0 and any(a['category'] == 'Mutual Funds' for a in allocations):
            for allocation in allocations:
                if allocation['category'] == 'Mutual Funds':
                    additional_units = round(remaining_amount / allocation['current_price'], 4)
                    allocation['quantity'] += additional_units
                    allocation['amount'] += remaining_amount
                    allocation['initial_investment'] += remaining_amount
                    remaining_amount = 0
                    break

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
                allocation['quantity'] = float(allocation['quantity'])
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
                'sharpe_ratio': sharpe_ratio,
                'remaining_amount': remaining_amount  # Include any remaining amount in response
            },
            'allocations': allocations
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_portfolio route: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal server error. Please try again later.'
        }), 500 