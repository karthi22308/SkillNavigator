import streamlit as st
import joblib
import pandas as pd
from openai import AzureOpenAI
def generate_response(input):
    client = AzureOpenAI(api_version='2024-06-01', azure_endpoint='https://hexavarsity-secureapi.azurewebsites.net/api/azureai', api_key='4ceeaa9071277c5b')
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{'role': 'user', 'content': input}],
        temperature=0.7,
        max_tokens=2560,
        top_p=0.6,
        frequency_penalty=0.7
    )
    return res.choices[0].message.content
# Load the trained model
model = joblib.load('random_forest_model.pkl')

# Define areas for strengths and weaknesses
all_areas = ['Java', 'Git', 'SQL', 'Python', 'Machine Learning', 'Cloud Computing', 'dotnet']

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

# Function to encode areas (strengths/weaknesses)
def encode_areas(areas, all_areas):
    return [1 if area in areas else 0 for area in all_areas]

# Streamlit app layout
st.title("AI-Powered Course Recommendation")

# Input fields for Technical Score, Soft Skill Score, Strength Areas, Weak Areas
technical_score = st.slider("Technical Score", min_value=50, max_value=100, value=75)
soft_skill_score = st.slider("Soft Skill Score", min_value=50, max_value=100, value=75)

strength_areas = st.multiselect(
    "Strength Areas",
    all_areas,
    default=["Java", "Python"]
)

weak_areas = st.multiselect(
    "Weak Areas",
    all_areas,
    default=["SQL"]
)

# When "Suggest" button is clicked
if st.button('Suggest Courses'):
    # Encode the input candidate features
    candidate_features = [technical_score, soft_skill_score] + encode_areas(strength_areas, all_areas) + encode_areas(weak_areas, all_areas)
    candidate_features = pd.DataFrame([candidate_features], columns=['Technical_Score', 'Soft_Skill_Score'] + [f'Strength_{area}' for area in all_areas] + [f'Weak_{area}' for area in all_areas])

    # Predict courses using the trained model
    recommended_courses = model.predict(candidate_features)[0]

    # Display the course recommendations
    st.write("Suggested Courses based on your input:")
    for course in recommended_courses.split(', '):
        st.write(f"- {course}")
    prompt = 'you are course recommendation ai her is a candidate  with a strength areas :' + str(
        strength_areas) + 'weak areas' + str(
        weak_areas) + 'give some udemy course sussgestions and improvement plan for this candidtae'
    st.write("GenAi Suggestions:")
    st.write(generate_response(prompt))
