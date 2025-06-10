from flask import Blueprint, jsonify, request
import requests
import yfinance as yf
from datetime import datetime, timedelta
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
        'HDFC_FLEXI_CAP': 1961,
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

@market_data.route('/history/<symbol>')
def get_stock_history(symbol):
    try:
        days = int(request.args.get('days', 90))
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        stock = yf.Ticker(symbol)
        hist = stock.history(start=start_date.strftime('%Y-%m-%d'), end=end_date.strftime('%Y-%m-%d'))
        if hist.empty:
            return jsonify({'error': 'No historical data found'}), 404
        # Format: [{date, price}]
        history = [
            {'date': idx.strftime('%Y-%m-%d'), 'price': float(row['Close'])}
            for idx, row in hist.iterrows()
        ]
        return jsonify({'history': history})
    except Exception as e:
        logger.error(f"Error fetching history for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@market_data.route('/stats/<symbol>')
def get_stock_stats(symbol):
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        stats = {
            'marketCap': info.get('marketCap'),
            'peRatio': info.get('trailingPE'),
            'high52': info.get('fiftyTwoWeekHigh'),
            'low52': info.get('fiftyTwoWeekLow'),
            'sector': info.get('sector'),
            'industry': info.get('industry'),
            'dividendYield': info.get('dividendYield'),
            'beta': info.get('beta'),
            'volume': info.get('volume'),
            'currency': info.get('currency'),
        }
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error fetching stats for {symbol}: {str(e)}")
        return jsonify({'error': str(e)}), 500 