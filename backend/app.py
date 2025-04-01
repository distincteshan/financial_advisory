from flask import Flask
from flask_cors import CORS
from routes.auth import auth_blueprint


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

app.register_blueprint(auth_blueprint, url_prefix="/auth")

if __name__ == "__main__":
    app.run(debug=True)
