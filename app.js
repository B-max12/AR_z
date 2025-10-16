from flask import Flask, jsonify, request
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)

# Initialize Firebase
cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Arz Backend!"}), 200

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    db.collection('users').add(data)
    return jsonify({"status": "success", "data": data}), 200

@app.route('/get_users', methods=['GET'])
def get_users():
    users = db.collection('users').stream()
    data = [{**doc.to_dict(), "id": doc.id} for doc in users]
    return jsonify(data), 200

if __name__ == '__main__':
    app.run(debug=True)
