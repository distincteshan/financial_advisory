from flask import Blueprint, jsonify, request
from models.portfolio_optimizer import portfolio_optimizer
from functools import lru_cache
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

portfolio_blueprint = Blueprint('portfolio', __name__)

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

@portfolio_blueprint.route('/get-portfolio', methods=['GET'])
def get_portfolio():
    try:
        logger.debug("Handling /get-portfolio request...")
        # Get investment amount from query parameter
        investment_amount = float(request.args.get('amount', 100000))
        logger.debug(f"Investment amount: {investment_amount}")
        
        # Get portfolio data
        portfolio_data = portfolio_optimizer.get_optimized_portfolio(investment_amount)
        
        if portfolio_data is None:
            logger.error("No portfolio data available")
            return jsonify({
                'error': 'Failed to generate portfolio. Please try again later.'
            }), 500
        
        # Log the portfolio data structure
        logger.debug("Portfolio data structure:")
        logger.debug(f"Portfolio metrics: {portfolio_data.get('portfolio_metrics')}")
        logger.debug(f"Allocations: {portfolio_data.get('allocations')}")
        
        # Validate the data structure
        if not isinstance(portfolio_data.get('allocations'), list):
            logger.error("Invalid allocations data structure")
            return jsonify({
                'error': 'Invalid portfolio data structure'
            }), 500
            
        # Validate each allocation entry
        for allocation in portfolio_data.get('allocations', []):
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
        return jsonify(portfolio_data), 200
        
    except Exception as e:
        logger.error(f"Error in get_portfolio route: {e}", exc_info=True)
        return jsonify({
            'error': 'Internal server error. Please try again later.'
        }), 500 