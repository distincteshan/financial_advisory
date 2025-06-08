from flask import Flask
from flask_cors import CORS
from routes.portfolio import portfolio
from routes.market_data import market_data
from routes.auth import auth
from routes.news import news

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],  # Vite's default port
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Register blueprints
app.register_blueprint(portfolio, url_prefix='/portfolio')
app.register_blueprint(market_data, url_prefix='/api/market')
app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(news, url_prefix='/api/news')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
