from flask import Flask, request, jsonify
import numpy as np
import joblib
import pandas as pd
from openai import AzureOpenAI
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Load the trained Random Forest model
rf_model = joblib.load('random_forest_model.pkl')

# Initialize Azure OpenAI client
client = AzureOpenAI(api_version='2024-06-01', azure_endpoint='https://hexavarsity-secureapi.azurewebsites.net/api/azureai', api_key='4ceeaa9071277c5b')

# Define all possible areas
all_areas = ['Java', 'Git', 'SQL', 'Python', 'Machine Learning', 'Cloud Computing', 'dotnet']

# Function to encode areas (strengths/weaknesses)
def encode_areas(areas, all_areas):
    return [1 if area in areas else 0 for area in all_areas]

# Course mapping logic
course_mapping = {
    'Java': ['Java for Beginners', 'Advanced Java'],
    'Git': ['Git for Beginners', 'Advanced Git'],
    'SQL': ['SQL for Beginners', 'Advanced SQL'],
    'Python': ['Python for Beginners', 'Advanced Python'],
    'Machine Learning': ['Intro to Machine Learning', 'Advanced Machine Learning'],
    'Cloud Computing': ['Intro to Cloud Computing', 'Cloud Security Basics'],
    'dotnet': ['dotnet for Beginners', 'Advanced dotnet'],
}

# Function to generate Gen AI response
def generate_response(input_text):
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{'role': 'user', 'content': input_text}],
        temperature=0.7,
        max_tokens=2560,
        top_p=0.6,
        frequency_penalty=0.7
    )
    return res.choices[0].message.content

# Define the API route
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        # Parse JSON input
        data = request.json
        technical_score = data['technical_score']
        soft_skill_score = data['soft_skill_score']
        strength_areas = data.get('strength_areas', [])
        weak_areas = data.get('weak_areas', [])

        # Encode features (ensure total features match model training)
        encoded_strengths = encode_areas(strength_areas, all_areas)
        encoded_weaknesses = encode_areas(weak_areas, all_areas)
        candidate_features = np.array([technical_score, soft_skill_score] + encoded_strengths + encoded_weaknesses).reshape(1, -1)

        # Predict recommendations using Random Forest
        recommended_courses = rf_model.predict(candidate_features)[0]  # Direct course names

        # If the model directly returns course names, no need to map via course_mapping
        recommended_courses_list = list(recommended_courses.split(', ')) if isinstance(recommended_courses, str) else recommended_courses

        # Generate AI-based improvement plan
        prompt = f'Candidate has strength areas {strength_areas} and weak areas {weak_areas}. Suggest Udemy courses and improvement plans.'
        gen_ai_suggestion = generate_response(prompt)

        return jsonify({
            "recommended_courses": recommended_courses_list,
            "gen_ai_suggestion": gen_ai_suggestion
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001, debug=True)
