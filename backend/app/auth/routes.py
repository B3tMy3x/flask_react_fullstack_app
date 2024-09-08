from werkzeug.security import generate_password_hash, check_password_hash
from flask import request, jsonify
from ..models import User
from .. import db
from .jwt import create_jwt_token
from flask import Blueprint

auth = Blueprint("auth", __name__)


@auth.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()

    try:
        if user and check_password_hash(user.password, data["password"]):
            token = create_jwt_token(user.id)
            return jsonify({"token": token})
        return jsonify({"message": "Invalid credentials"}), 401
    except:
        return jsonify({"message": "Invalid credentials"}), 401


@auth.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data["password"], method="pbkdf2:sha256")
    new_user = User(
        username=data["username"], email=data["email"], password=hashed_password
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except:
        return jsonify({"message": "This user is already exist"}), 401

    token = create_jwt_token(new_user.id)
    return jsonify({"token": token})
