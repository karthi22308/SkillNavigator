import json

from flask import Flask, request, jsonify
import pandas as pd
import random
from textblob import TextBlob
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from openai import AzureOpenAI
from flask_cors import CORS
# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
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
# Perform sentiment analysis
def analyze_sentiment(feedback_text):
    sentiment = TextBlob(feedback_text).sentiment.polarity
    if sentiment > 0:
        return "Positive"
    elif sentiment < 0:
        return "Negative"
    else:
        return "Neutral"


# Extract topics from feedback
def extract_topics(feedback_texts, n_topics=3):
    vectorizer = CountVectorizer(stop_words="english")
    feedback_matrix = vectorizer.fit_transform(feedback_texts)

    lda = LatentDirichletAllocation(n_components=n_topics, random_state=42)
    lda.fit(feedback_matrix)

    topics = []
    for topic_idx, topic in enumerate(lda.components_):
        topic_words = [vectorizer.get_feature_names_out()[i] for i in topic.argsort()[:-5 - 1:-1]]
        topics.append(f"Topic {topic_idx + 1}: {', '.join(topic_words)}")
    return topics


# Generate actionable insights
def generate_insights(df):
    insights = {
        "Positive Feedback": len(df[df["Sentiment"] == "Positive"]),
        "Negative Feedback": len(df[df["Sentiment"] == "Negative"]),
        "Neutral Feedback": len(df[df["Sentiment"] == "Neutral"]),
        "Top Suggestions": df[df["Sentiment"] == "Negative"]["Feedback_Text"].tolist()[:3]
    }
    return insights


# API endpoint to analyze feedback
@app.route('/analyze', methods=['POST'])
def analyze_feedback():
    try:
        # Parse input JSON
        data = request.json
        feedback_texts = data['feedback_texts']

        # Perform sentiment analysis
        feedback_df = pd.DataFrame({"Feedback_Text": feedback_texts})
        feedback_df["Sentiment"] = feedback_df["Feedback_Text"].apply(analyze_sentiment)

        # Extract topics
        topics = extract_topics(feedback_texts)

        # Generate actionable insights
        insights = generate_insights(feedback_df)
        response1 = {
            "sentiments": feedback_df["Sentiment"].tolist(),
            "topics": topics,
            "insights": insights
        }
        prompt = 'you are a feedback review suggestor below is the feedback we got for this trainer '+ json.dumps(response1, indent=2,ensure_ascii=False)+' suggest some improvemnt plan for the trainer'
        genaiout = (generate_response(prompt))

        response = {
            "sentiments": feedback_df["Sentiment"].tolist(),
            "topics": topics,
            "insights": insights,
            "GenAI Suggestions":genaiout
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
