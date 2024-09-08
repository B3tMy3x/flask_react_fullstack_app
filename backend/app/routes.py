from flask import request, jsonify, current_app
from .models import Chart, User
from . import db
from flask import Blueprint
from .auth.jwt import decode_jwt_token
from functools import wraps
import jwt

main = Blueprint("main", __name__)


def decode_jwt_token(token):
    try:
        decoded = jwt.decode(
            token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
        )
        return decoded["user_id"]
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired!"}), 403
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token is invalid!"}), 403


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token is missing!"}), 403

        try:
            token = token.split(" ")[1]
            user_id = decode_jwt_token(token)
            if isinstance(user_id, tuple):
                return user_id
        except Exception as e:
            return jsonify({"message": "Token is invalid!", "error": str(e)}), 403

        return f(user_id, *args, **kwargs)

    return decorated


@main.route("/api/save-chart", methods=["POST"])
@token_required
def save_chart(user_id):
    title = request.json.get("title")
    data = request.json.get("chartData")

    if not data or not title:
        return jsonify({"message": "Title and chart data are required!"}), 400

    try:
        chart = Chart(user_id=user_id, title=title, data=data)
        db.session.add(chart)
        db.session.commit()
        return jsonify({"message": "Chart saved successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to save chart", "error": str(e)}), 500


@main.route("/api/profile", methods=["GET"])
@token_required
def profile(user_id):
    try:
        charts = Chart.query.filter_by(user_id=user_id).all()
        chart_data = [
            {"title": chart.title, "data": chart.data, "id": chart.id}
            for chart in charts
        ]
        return jsonify({"charts": chart_data}), 200
    except Exception as e:
        return jsonify({"message": "Failed to load charts", "error": str(e)}), 500


@main.route("/api/chart/<int:chart_id>", methods=["GET"])
@token_required
def get_chart_by_id(user_id, chart_id):
    try:
        chart = Chart.query.filter_by(id=chart_id, user_id=user_id).first()
        if chart is None:
            return jsonify({"message": "Chart not found"}), 404
        return jsonify({"id": chart.id, "title": chart.title, "data": chart.data}), 200
    except Exception as e:
        return jsonify({"message": "Failed to retrieve chart", "error": str(e)}), 500


@main.route("/api/chart/<int:chart_id>", methods=["PUT"])
@token_required
def update_chart_by_id(user_id, chart_id):
    try:
        chart = Chart.query.filter_by(id=chart_id, user_id=user_id).first()
        if chart is None:
            return jsonify({"message": "Chart not found"}), 404

        data = request.get_json()
        title = data.get("title", "")
        chart_data = data.get("data", "")

        if not title:
            return jsonify({"message": "Title is required"}), 400

        chart.title = title
        chart.data = chart_data
        db.session.commit()

        return jsonify({"message": "Chart updated successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to update chart", "error": str(e)}), 500


@main.route("/api/chart/<int:chart_id>", methods=["DELETE"])
@token_required
def delete_chart_by_id(user_id, chart_id):
    try:
        chart = Chart.query.filter_by(id=chart_id, user_id=user_id).first()
        if chart is None:
            return jsonify({"message": "Chart not found"}), 404
        db.session.delete(chart)
        db.session.commit()

        return jsonify({"message": "Chart deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete chart", "error": str(e)}), 500
