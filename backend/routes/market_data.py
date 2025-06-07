from flask import Blueprint, jsonify, request
import requests
import yfinance as yf
from datetime import datetime
import logging

market_data = Blueprint('market_data', __name__)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_stock_price(symbol):
    try:
        stock = yf.Ticker(symbol)
        current_data = stock.info
        if 'regularMarketPrice' in current_data:
            return current_data['regularMarketPrice']
        return None
    except Exception as e:
        logger.error(f"Error fetching stock price for {symbol}: {str(e)}")
        return None

def get_crypto_price(symbol):
    try:
        # Extract the crypto symbol (e.g., 'BTC' from 'BTC-INR')
        crypto = symbol.split('-')[0].lower()
        url = f'https://api.coingecko.com/api/v3/simple/price'
        params = {
            'ids': {
                'btc': 'bitcoin',
                'eth': 'ethereum',
                'sol': 'solana'
            }.get(crypto),
            'vs_currencies': 'inr'
        }
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        coin_id = params['ids']
        if coin_id in data:
            return data[coin_id]['inr']
        return None
    except Exception as e:
        logger.error(f"Error fetching crypto price for {symbol}: {str(e)}")
        return None

def get_gold_price():
    try:
        gold = yf.Ticker('GC=F')
        current_data = gold.info
        if 'regularMarketPrice' in current_data:
            # Convert from USD to INR (approximate)
            usd_price = current_data['regularMarketPrice']
            inr_price = usd_price * 83  # Using approximate USD-INR rate
            return inr_price
        return None
    except Exception as e:
        logger.error(f"Error fetching gold price: {str(e)}")
        return None

def get_mutual_fund_nav(symbol):
    # For demonstration, returning fixed NAV values
    nav_values = {
        'HDFC_FLEXI_CAP': 100.0,
        'PPFAS_FLEXI_CAP': 102.0,
    }
    return nav_values.get(symbol)

@market_data.route('/price/<symbol>')
def get_current_price(symbol):
    try:
        logger.info(f"Fetching price for {symbol}")
        price = None

        if symbol.endswith('.NS'):
            price = get_stock_price(symbol)
        elif symbol.endswith('-INR'):
            price = get_crypto_price(symbol)
        elif symbol == 'GC=F':
            price = get_gold_price()
        elif '_FLEXI_CAP' in symbol:
            price = get_mutual_fund_nav(symbol)

        if price is not None:
            logger.info(f"Successfully fetched price for {symbol}: {price}")
            return jsonify({'current_price': price})
        else:
            logger.warning(f"No price found for {symbol}")
            return jsonify({'error': f'Could not fetch price for {symbol}'}), 404

    except Exception as e:
        logger.error(f"Error processing request for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500 