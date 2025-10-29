from flask import Flask, jsonify
from config import Config
from extensions import mongo
from routes.auth import auth_bp
from routes.equipment import equipment_bp
from routes.loans import loans_bp
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    mongo.init_app(app)
    CORS(app)

    # register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(equipment_bp)
    app.register_blueprint(loans_bp)

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    # basic error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "server error", "detail": str(e)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=18080, debug=True)
