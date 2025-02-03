from flask import Flask
from flask_cors import CORS
from routes.auth import auth_blueprint
from routes.questionnaire import questionnaire_blueprint


app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_blueprint, url_prefix="/auth")
app.register_blueprint(questionnaire_blueprint, url_prefix="/questionnaire")

if __name__ == "__main__":
    app.run(debug=True)
