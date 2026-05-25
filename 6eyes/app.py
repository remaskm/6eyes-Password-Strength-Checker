from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import string

app = Flask(__name__)
CORS(app)

COMMON_PASSWORDS = {
    "password", "123456", "password123", "admin", "letmein",
    "qwerty", "abc123", "iloveyou", "111111", "welcome",
    "monkey", "dragon", "master", "sunshine", "princess",
    "password1", "123456789", "football", "shadow", "superman"
}

def check_strength(password):
    results = {}

    results["has_length"]    = len(password) >= 8
    results["has_upper"]     = any(c.isupper() for c in password)
    results["has_digit"]     = any(c.isdigit() for c in password)
    results["has_symbol"]    = any(c in string.punctuation for c in password)

    results["not_common"]    = password.lower() not in COMMON_PASSWORDS
    results["has_long"]      = len(password) >= 12
    results["no_spaces"]     = " " not in password
    results["no_repeat"]     = not re.search(r'(.)\1{2,}', password)

    core_score = sum([
        results["has_length"],
        results["has_upper"],
        results["has_digit"],
        results["has_symbol"]
    ])

    bonus_score = sum([
        results["not_common"],
        results["has_long"],
        results["no_repeat"]
    ])

    total_score = core_score + bonus_score

    if not results["has_length"]:
        strength = "Weak"
    elif not results["not_common"]:
        strength = "Weak"
    elif core_score <= 2:
        strength = "Weak"
    elif core_score == 3 and bonus_score == 0:
        strength = "Medium"
    elif core_score == 3 or (core_score == 4 and bonus_score < 2):
        strength = "Medium"
    else:
        strength = "Strong"

    tips = []
    if not results["has_length"]:   tips.append("Use at least 8 characters")
    if not results["has_upper"]:    tips.append("Add an uppercase letter (A-Z)")
    if not results["has_digit"]:    tips.append("Add a number (0-9)")
    if not results["has_symbol"]:   tips.append("Add a symbol (e.g. !@#$%^&*)")
    if not results["not_common"]:   tips.append("This is a commonly leaked password")
    if not results["has_long"]:     tips.append("Try 12+ characters for extra strength")
    if not results["no_repeat"]:    tips.append("Avoid repeated characters (e.g. aaa, 111)")

    return {
        "strength":   strength,
        "score":      total_score,
        "max_score":  7,
        "checks":     results,
        "tips":       tips,
        "length":     len(password)
    }

@app.route("/check", methods=["POST"])
def check():
    data     = request.get_json()
    password = data.get("password", "")
    if not password:
        return jsonify({"error": "No password provided"}), 400
    return jsonify(check_strength(password))

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Six Eyes"})

if __name__ == "__main__":
    print("Six Eyes — analysis engine running on http://localhost:5000")
    app.run(debug=True, port=5000)