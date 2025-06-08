from flask import Blueprint, jsonify, request
import requests
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()




# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

news = Blueprint('news', __name__)

# Your NewsAPI.org API key (keep this secure in production)
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
NEWS_API_BASE_URL = 'https://newsapi.org/v2'

@news.route('/global', methods=['GET'])
def get_global_news():
    """
    Fetch global financial news from NewsAPI.org
    """
    try:
        # Parameters for global financial news
        params = {
            'apiKey': NEWS_API_KEY,
            'q': 'finance OR stocks OR markets OR economy OR "stock market" OR "financial markets"',
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': 12,  # Get 12 articles
            'domains': 'reuters.com,bloomberg.com,marketwatch.com,cnbc.com,wsj.com,ft.com,forbes.com'
        }
        
        # Make request to NewsAPI
        response = requests.get(f'{NEWS_API_BASE_URL}/everything', params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            articles = data.get('articles', [])
            
            # Filter and clean articles
            filtered_articles = []
            for article in articles:
                # Skip articles without essential information
                if not article.get('title') or not article.get('url'):
                    continue
                    
                # Skip removed articles
                if article.get('title') == '[Removed]':
                    continue
                    
                filtered_articles.append({
                    'title': article.get('title'),
                    'description': article.get('description'),
                    'url': article.get('url'),
                    'urlToImage': article.get('urlToImage'),
                    'publishedAt': article.get('publishedAt'),
                    'source': article.get('source', {}),
                    'author': article.get('author')
                })
            
            logger.info(f"Successfully fetched {len(filtered_articles)} global news articles")
            return jsonify({
                'success': True,
                'articles': filtered_articles,
                'total': len(filtered_articles)
            }), 200
            
        else:
            logger.error(f"NewsAPI returned status code: {response.status_code}")
            return jsonify({
                'success': False,
                'error': f'NewsAPI error: {response.status_code}',
                'articles': []
            }), response.status_code
            
    except requests.exceptions.Timeout:
        logger.error("Request to NewsAPI timed out")
        return jsonify({
            'success': False,
            'error': 'Request timeout',
            'articles': []
        }), 408
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch news',
            'articles': []
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in get_global_news: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'articles': []
        }), 500

@news.route('/indian', methods=['GET'])
def get_indian_news():
    """
    Fetch Indian financial news from NewsAPI.org
    """
    try:
        # Parameters for Indian financial news
        params = {
            'apiKey': NEWS_API_KEY,
            'q': 'India AND (finance OR stocks OR markets OR economy OR "stock market" OR "financial markets" OR NSE OR BSE OR "Indian economy" OR rupee OR RBI)',
            'language': 'en',
            'sortBy': 'publishedAt',
            'pageSize': 12,  # Get 12 articles
            'domains': 'economictimes.indiatimes.com,moneycontrol.com,business-standard.com,livemint.com,reuters.com,bloomberg.com'
        }
        
        # Make request to NewsAPI
        response = requests.get(f'{NEWS_API_BASE_URL}/everything', params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            articles = data.get('articles', [])
            
            # Filter and clean articles
            filtered_articles = []
            for article in articles:
                # Skip articles without essential information
                if not article.get('title') or not article.get('url'):
                    continue
                    
                # Skip removed articles
                if article.get('title') == '[Removed]':
                    continue
                    
                filtered_articles.append({
                    'title': article.get('title'),
                    'description': article.get('description'),
                    'url': article.get('url'),
                    'urlToImage': article.get('urlToImage'),
                    'publishedAt': article.get('publishedAt'),
                    'source': article.get('source', {}),
                    'author': article.get('author')
                })
            
            logger.info(f"Successfully fetched {len(filtered_articles)} Indian news articles")
            return jsonify({
                'success': True,
                'articles': filtered_articles,
                'total': len(filtered_articles)
            }), 200
            
        else:
            logger.error(f"NewsAPI returned status code: {response.status_code}")
            return jsonify({
                'success': False,
                'error': f'NewsAPI error: {response.status_code}',
                'articles': []
            }), response.status_code
            
    except requests.exceptions.Timeout:
        logger.error("Request to NewsAPI timed out")
        return jsonify({
            'success': False,
            'error': 'Request timeout',
            'articles': []
        }), 408
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch news',
            'articles': []
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error in get_indian_news: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'articles': []
        }), 500

@news.route('/top-headlines', methods=['GET'])
def get_top_headlines():
    """
    Fetch top financial headlines
    """
    try:
        # Parameters for top business headlines
        params = {
            'apiKey': NEWS_API_KEY,
            'category': 'business',
            'language': 'en',
            'pageSize': 10,
            'country': 'us'  # Can be changed to 'in' for Indian headlines
        }
        
        # Make request to NewsAPI
        response = requests.get(f'{NEWS_API_BASE_URL}/top-headlines', params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            articles = data.get('articles', [])
            
            # Filter and clean articles
            filtered_articles = []
            for article in articles:
                # Skip articles without essential information
                if not article.get('title') or not article.get('url'):
                    continue
                    
                # Skip removed articles
                if article.get('title') == '[Removed]':
                    continue
                    
                filtered_articles.append({
                    'title': article.get('title'),
                    'description': article.get('description'),
                    'url': article.get('url'),
                    'urlToImage': article.get('urlToImage'),
                    'publishedAt': article.get('publishedAt'),
                    'source': article.get('source', {}),
                    'author': article.get('author')
                })
            
            logger.info(f"Successfully fetched {len(filtered_articles)} top headlines")
            return jsonify({
                'success': True,
                'articles': filtered_articles,
                'total': len(filtered_articles)
            }), 200
            
        else:
            logger.error(f"NewsAPI returned status code: {response.status_code}")
            return jsonify({
                'success': False,
                'error': f'NewsAPI error: {response.status_code}',
                'articles': []
            }), response.status_code
            
    except Exception as e:
        logger.error(f"Unexpected error in get_top_headlines: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'articles': []
        }), 500 