import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

from flask import Flask
from flask_cors import CORS
from routes.auth import auth_blueprint
from routes.portfolio import portfolio_blueprint


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

app.register_blueprint(auth_blueprint, url_prefix="/auth")
app.register_blueprint(portfolio_blueprint, url_prefix="/portfolio")

if __name__ == "__main__":
    app.run(debug=True)
