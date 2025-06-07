from flask import Flask
from flask_cors import CORS
from routes.portfolio import portfolio
from routes.market_data import market_data

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(portfolio, url_prefix='/portfolio')
app.register_blueprint(market_data, url_prefix='/api/market')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
