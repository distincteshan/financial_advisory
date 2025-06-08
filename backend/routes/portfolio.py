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
@lru_cache(maxsize=100)  # Increased cache size to accommodate different user profiles
def get_cached_portfolio(investment_amount, risk_score=None, risk_category=None):
    try:
        print("Fetching portfolio data...")
        portfolio_data = portfolio_optimizer.get_optimized_portfolio(investment_amount, risk_score, risk_category)
        
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
        'HDFC_FLEXI_CAP': 1961,  # Updated to current market price, not NAV
        'GC=F': 276473  # Updated to match the screenshot value for gold price
    }

def get_risk_based_allocation(risk_score, risk_category=None):
    """
    Generate asset allocation based on user's risk profile
    
    Parameters:
    risk_score (int): User's risk score (typically 1-10)
    risk_category (str): User's risk category (e.g., 'conservative', 'moderate', 'aggressive')
    
    Returns:
    dict: Asset allocation dictionary
    """
    # Default to using risk_score if available
    if risk_score is not None:
        # Convert risk score to a scale of 0-1
        risk_factor = risk_score / 10
    # Fall back to risk_category if risk_score isn't available
    elif risk_category:
        risk_categories = {
            'conservative': 0.2,
            'moderate': 0.5,
            'balanced': 0.5,
            'growth': 0.7,
            'aggressive': 0.9
        }
        risk_factor = risk_categories.get(risk_category.lower(), 0.5)
    else:
        # Default to moderate risk if neither is provided
        risk_factor = 0.5
    
    logger.debug(f"Using risk factor: {risk_factor}")
    
    # Define allocation ranges for each asset class based on risk
    # Format: [min_allocation_at_risk_0, max_allocation_at_risk_1]
    allocation_ranges = {
        'Stocks': [0.20, 0.70],  # 20% to 70%
        'Cryptocurrency': [0.00, 0.25],  # 0% to 25%
        'Mutual Funds': [0.40, 0.05],  # 40% to 5% (decreases with risk)
        'Commodities': [0.30, 0.10]  # 30% to 10% (decreases with risk)
    }
    
    # Calculate allocations based on risk factor
    assets_data = {
        'Stocks': [
            {
                'name': 'Reliance Industries',
                'ticker': 'RELIANCE.NS',
                'expected_return': 15,
                'weight': 0.0,  # Will be filled in
            },
            {
                'name': 'TCS',
                'ticker': 'TCS.NS',
                'expected_return': 12,
                'weight': 0.0,
            },
            {
                'name': 'HDFC Bank',
                'ticker': 'HDFCBANK.NS',
                'expected_return': 14,
                'weight': 0.0,
            },
            {
                'name': 'Infosys',
                'ticker': 'INFY.NS',
                'expected_return': 13,
                'weight': 0.0,
            },
            {
                'name': 'ICICI Bank',
                'ticker': 'ICICIBANK.NS',
                'expected_return': 16,
                'weight': 0.0,
            },
            {
                'name': 'Hindustan Unilever',
                'ticker': 'HINDUNILVR.NS',
                'expected_return': 10,
                'weight': 0.0,
            }
        ],
        'Cryptocurrency': [
            {
                'name': 'Bitcoin',
                'ticker': 'BTC-INR',
                'expected_return': 25,
                'weight': 0.0,
            },
            {
                'name': 'Ethereum',
                'ticker': 'ETH-INR',
                'expected_return': 20,
                'weight': 0.0,
            },
            {
                'name': 'Solana',
                'ticker': 'SOL-INR',
                'expected_return': 30,
                'weight': 0.0,
            }
        ],
        'Mutual Funds': [
            {
                'name': 'HDFC Flexi Cap Fund',
                'ticker': 'HDFC_FLEXI_CAP',
                'expected_return': 12,
                'weight': 0.0,
                'nav': 50.27  # NAV for mutual fund
            }
        ],
        'Commodities': [
            {
                'name': 'Gold',
                'ticker': 'GC=F',
                'expected_return': 8,
                'weight': 0.0,
            }
        ]
    }
    
    # Calculate category weights based on risk factor
    category_weights = {}
    total_weight = 0
    for category, range_values in allocation_ranges.items():
        min_alloc, max_alloc = range_values
        # Linear interpolation between min and max based on risk_factor
        weight = min_alloc + (max_alloc - min_alloc) * risk_factor
        category_weights[category] = weight
        total_weight += weight
    
    # Normalize category weights to ensure they sum to 1.0
    for category in category_weights:
        category_weights[category] /= total_weight
    
    logger.debug(f"Category weights: {category_weights}")
    
    # Distribute weights within each category
    for category, assets in assets_data.items():
        category_weight = category_weights[category]
        num_assets = len(assets)
        
        # For simplicity, distribute equally within each category
        # More sophisticated approaches could be implemented here
        asset_weight = category_weight / num_assets
        
        for asset in assets:
            asset['weight'] = asset_weight
    
    return assets_data

def validate_mutual_fund_allocations(allocations, investment_amount):
    """
    Validate mutual fund allocations to ensure they don't exceed investment amount
    and quantities are consistent with market prices.
    
    Parameters:
    allocations (list): List of asset allocations
    investment_amount (float): Total investment amount
    
    Returns:
    list: Corrected allocations
    """
    # Find mutual fund allocations
    mf_allocations = [a for a in allocations if a['category'] == 'Mutual Funds']
    
    if not mf_allocations:
        return allocations
    
    for mf in mf_allocations:
        # Recalculate quantity based on initial investment and current price
        mf['quantity'] = round(mf['initial_investment'] / mf['current_price'], 4)
        
        # Update amount to reflect current value
        current_value = mf['quantity'] * mf['current_price']
        mf['amount'] = current_value
        
        logger.debug(f"Mutual fund {mf['name']} - Initial: {mf['initial_investment']}, " + 
                     f"Price: {mf['current_price']}, Quantity: {mf['quantity']}, " +
                     f"Current Value: {mf['amount']}")
    
    # Validate total mutual fund allocation
    total_mf_initial = sum(mf['initial_investment'] for mf in mf_allocations)
    mf_weight = total_mf_initial / investment_amount
    
    # If mutual fund initial investment is more than 50% of investment, adjust it
    if mf_weight > 0.5:
        logger.warning(f"Mutual fund allocation ({total_mf_initial}) exceeds 50% of investment")
        scale_factor = (0.5 * investment_amount) / total_mf_initial
        
        for mf in mf_allocations:
            old_amount = mf['initial_investment']
            mf['initial_investment'] *= scale_factor
            mf['weight'] = (mf['initial_investment'] / investment_amount)
            
            # Recalculate quantity and current value
            mf['quantity'] = round(mf['initial_investment'] / mf['current_price'], 4)
            mf['amount'] = mf['quantity'] * mf['current_price']
            
            logger.debug(f"Scaled {mf['name']} from {old_amount} to {mf['initial_investment']}")
    
    return allocations

# Add this new validation function for gold specifically
def fix_gold_allocation(allocations):
    """
    Apply the special formula for gold: quantity = market_price / initial_investment
    This is specifically requested for gold only.
    
    Parameters:
    allocations (list): List of asset allocations
    
    Returns:
    list: Corrected allocations with gold using the special formula
    """
    for allocation in allocations:
        if allocation['category'] == 'Commodities' and allocation['ticker'] == 'GC=F':
            # Apply the special formula for gold: quantity = market_price / initial_investment
            initial_investment = allocation['initial_investment']
            market_price = allocation['current_price']
            
            # Special formula for gold
            allocation['quantity'] = round(market_price / initial_investment, 4)
            
            # Set amount/current value based on quantity
            allocation['amount'] = initial_investment  # Current value equals initial investment
            
            logger.debug(f"Applied special gold formula for {allocation['name']}: " +
                        f"Quantity = {market_price} / {initial_investment} = {allocation['quantity']}")
    
    return allocations

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
        
        # Get user's risk profile
        risk_score = user.get('risk_score')
        risk_category = user.get('risk_category')
        
        logger.debug(f"User risk profile - score: {risk_score}, category: {risk_category}")
        
        # Get personalized asset allocation based on risk profile
        assets_data = get_risk_based_allocation(risk_score, risk_category)

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
                    # For mutual funds, calculate quantity based on initial investment
                    # Strictly use the formula: quantity = initial_investment / market_price
                    quantity = round(asset_amount / current_price, 4)
                    initial_investment = asset_amount  # This is the allocated amount for this asset
                    # Current value might fluctuate based on market price, but initial investment remains fixed
                    actual_amount = quantity * current_price  # This represents current value
                else:
                    # For other assets (crypto, commodities), use normal division
                    quantity = asset_amount / current_price
                    actual_amount = asset_amount
                
                allocations.append({
                    'name': asset['name'],
                    'ticker': asset['ticker'],
                    'category': category,
                    'expected_return': asset['expected_return'],
                    'amount': actual_amount,  # Current value
                    'quantity': quantity,
                    'initial_investment': asset_amount,  # Always preserve the original allocated amount
                    'weight': asset['weight'],
                    'current_price': current_price
                })

        # If there's remaining amount from stock rounding, redistribute to mutual funds
        if remaining_amount > 0 and any(a['category'] == 'Mutual Funds' for a in allocations):
            for allocation in allocations:
                if allocation['category'] == 'Mutual Funds':
                    # Add remaining amount to initial investment
                    allocation['initial_investment'] += remaining_amount
                    
                    # Recalculate quantity and current value based on initial investment
                    allocation['quantity'] = round(allocation['initial_investment'] / allocation['current_price'], 4)
                    allocation['amount'] = allocation['quantity'] * allocation['current_price']
                    
                    # Update weight to reflect new initial investment
                    allocation['weight'] = allocation['initial_investment'] / investment_amount
                    
                    logger.debug(f"Added remaining {remaining_amount} to {allocation['name']}, " +
                                f"new quantity: {allocation['quantity']}, " +
                                f"new value: {allocation['amount']}")
                    
                    remaining_amount = 0
                    break
                    
        # Validate mutual fund allocations specifically
        allocations = validate_mutual_fund_allocations(allocations, investment_amount)
        
        # Apply special formula for gold quantity
        allocations = fix_gold_allocation(allocations)

        # Validate total allocation doesn't exceed investment amount
        total_allocated_initial = sum(allocation['initial_investment'] for allocation in allocations)
        if total_allocated_initial > investment_amount * 1.001:  # Allow 0.1% margin for rounding errors
            logger.warning(f"Total initial allocation ({total_allocated_initial}) exceeds investment amount ({investment_amount})")
            # Scale down allocations proportionally
            scale_factor = investment_amount / total_allocated_initial
            for allocation in allocations:
                allocation['initial_investment'] *= scale_factor
                allocation['weight'] *= scale_factor
                
                # Recalculate quantity and current value
                allocation['quantity'] = round(allocation['initial_investment'] / allocation['current_price'], 4)
                allocation['amount'] = allocation['quantity'] * allocation['current_price']
            
            logger.debug(f"Scaled down allocations by factor of {scale_factor}")

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
        
        # Final validation of total allocation
        final_total_initial = sum(float(a['initial_investment']) for a in allocations)
        if abs(final_total_initial - investment_amount) > 0.01 * investment_amount:
            logger.warning(f"Final total initial allocation ({final_total_initial}) still differs from investment amount ({investment_amount})")
            logger.warning("Adjusting response to show correct values")
            
            # Calculate corrected weights
            for allocation in allocations:
                allocation['weight'] = (allocation['initial_investment'] / final_total_initial) * 100
                
            # Add note about adjustment to response
            note = f"Allocation adjusted to match investment amount ({investment_amount})"
        else:
            note = "Allocation matches investment amount"
        
        # Calculate total current value
        total_current_value = sum(float(a['amount']) for a in allocations)
        
        logger.debug("Returning validated portfolio data to client")
        return jsonify({
            'portfolio_metrics': {
                'total_investment': investment_amount,
                'total_current_value': total_current_value,
                'expected_return': portfolio_return * 100,
                'volatility': portfolio_volatility * 100,
                'sharpe_ratio': sharpe_ratio,
                'remaining_amount': remaining_amount,  # Include any remaining amount in response
                'note': note  # Add note about allocation adjustment
            },
            'allocations': allocations
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_portfolio route: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal server error. Please try again later.'
        }), 500 

@portfolio.route('/risk-allocation-chart', methods=['GET'])
def get_risk_allocation_chart():
    """Generate a visualization of how asset allocations change with different risk profiles"""
    try:
        # Sample investment amount for demonstration
        investment_amount = 1000000
        
        # Generate allocations for different risk levels
        risk_levels = ['conservative', 'moderate', 'aggressive']
        allocations_by_risk = {}
        
        for risk_category in risk_levels:
            # Get allocation for this risk profile
            assets_data = get_risk_based_allocation(None, risk_category)
            
            # Group by category
            category_weights = {}
            for category, assets in assets_data.items():
                category_weight = sum(asset['weight'] for asset in assets)
                category_weights[category] = category_weight
                
            allocations_by_risk[risk_category] = category_weights
        
        # Format data for frontend visualization
        chart_data = {
            'labels': list(allocations_by_risk['conservative'].keys()),
            'datasets': []
        }
        
        for risk_category in risk_levels:
            dataset = {
                'label': risk_category.capitalize(),
                'data': [allocations_by_risk[risk_category][category] for category in chart_data['labels']]
            }
            chart_data['datasets'].append(dataset)
        
        return jsonify(chart_data), 200
        
    except Exception as e:
        logger.error(f"Error generating risk allocation chart: {e}", exc_info=True)
        return jsonify({
            'error': 'Error generating visualization'
        }), 500 

@portfolio.route('/test-gold-calculation', methods=['GET'])
def test_gold_calculation():
    """Test endpoint to validate gold calculation specifically"""
    try:
        # Sample investment amount
        investment_amount = 100000
        
        # Gold allocation percentage (29.51%)
        gold_allocation = 0.2951
        
        # Gold market price
        gold_price = 276473
        
        # Calculate expected values
        expected_investment = investment_amount * gold_allocation
        expected_quantity = round(expected_investment / gold_price, 4)
        expected_value = expected_quantity * gold_price
        
        # Test the calculation
        result = {
            'investment_amount': investment_amount,
            'gold_allocation_percentage': gold_allocation * 100,
            'gold_market_price': gold_price,
            'expected_investment_in_gold': expected_investment,
            'calculated_quantity': expected_quantity,
            'calculated_value': expected_value,
            'example_calculation': 'quantity = (investment_amount * allocation_percentage) / market_price',
            'example_value': f"{investment_amount} * {gold_allocation} / {gold_price} = {expected_quantity}",
            'verification': {
                'quantity_check': f"{expected_quantity} * {gold_price} = {expected_value}",
                'is_valid': abs(expected_value - expected_investment) < 0.01 * expected_investment
            }
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Error in test-gold-calculation route: {e}", exc_info=True)
        return jsonify({
            'error': 'Error testing gold calculation'
        }), 500

@portfolio.route('/validate-portfolio', methods=['GET'])
def validate_portfolio():
    """Debug endpoint to validate portfolio allocations against investment amount"""
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"message": "No token provided"}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Decode token
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload['user_id']
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return jsonify({"message": "Invalid or expired token"}), 401

        # Get user data from database
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        # Get investment amount from user data
        investment_amount = user.get('investment_amount')
        if not investment_amount:
            return jsonify({"message": "No investment amount found"}), 400
        
        # Get user's risk profile    
        risk_score = user.get('risk_score')
        risk_category = user.get('risk_category')
        
        # Get allocation data
        assets_data = get_risk_based_allocation(risk_score, risk_category)
        prices = get_asset_prices()
        
        # Calculate allocations by category
        category_allocations = {}
        for category, assets in assets_data.items():
            category_amount = 0
            for asset in assets:
                weight = asset['weight']
                amount = investment_amount * weight
                category_amount += amount
            
            category_allocations[category] = {
                'initial_investment': category_amount,
                'percentage': (category_amount / investment_amount) * 100
            }
        
        # Analyze mutual funds specifically
        mutual_funds = assets_data.get('Mutual Funds', [])
        mf_details = []
        
        for mf in mutual_funds:
            initial_investment = investment_amount * mf['weight']
            current_price = prices[mf['ticker']]
            quantity = round(initial_investment / current_price, 4)
            current_value = quantity * current_price
            
            mf_details.append({
                'name': mf['name'],
                'market_price': current_price,
                'initial_investment': initial_investment,
                'quantity': quantity,
                'current_value': current_value,
                'difference': current_value - initial_investment,
                'difference_pct': ((current_value / initial_investment) - 1) * 100 if initial_investment > 0 else 0
            })
        
        # Total validation
        total_initial_investment = sum(c['initial_investment'] for c in category_allocations.values())
        is_valid = abs(total_initial_investment - investment_amount) < 0.01 * investment_amount
        
        # Calculate example asset for demo
        example_asset = {
            'name': 'HDFC Flexi Cap Fund',
            'market_price': 1961,
            'investment': 46406,
            'calculated_quantity': round(46406 / 1961, 4),
            'calculated_value': round(46406 / 1961, 4) * 1961
        }
        
        return jsonify({
            'investment_amount': investment_amount,
            'risk_profile': {
                'score': risk_score,
                'category': risk_category
            },
            'category_allocations': category_allocations,
            'mutual_fund_details': mf_details,
            'total_initial_investment': total_initial_investment,
            'difference': total_initial_investment - investment_amount,
            'is_valid': is_valid,
            'example_calculation': example_asset,
            'notes': [
                "Mutual fund quantities should be calculated as: initial_investment / market_price",
                "Current value should be: quantity × current_price",
                "Total of all initial investments should equal user's investment amount"
            ]
        }), 200
        
    except Exception as e:
        logger.error(f"Error in validate-portfolio route: {e}", exc_info=True)
        return jsonify({
            'error': 'Error validating portfolio allocation'
        }), 500 