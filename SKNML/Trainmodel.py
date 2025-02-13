import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load the data from the Excel file
df = pd.read_excel("candidate_data.xlsx")

# Encode strengths and weaknesses into binary vectors (1 or 0)
all_areas = ['Java', 'Git', 'SQL', 'Python', 'Machine Learning', 'Cloud Computing', 'dotnet']

def encode_areas(areas, all_areas):
    return [1 if area in areas else 0 for area in all_areas]

# Encoding strength and weakness areas
df['Strength_Encoded'] = df['Strength_Areas'].apply(lambda x: encode_areas(x.split(', '), all_areas))
df['Weak_Encoded'] = df['Weak_Areas'].apply(lambda x: encode_areas(x.split(', '), all_areas))

# Combine features (Technical Score, Soft Skill Score, and encoded strengths and weaknesses)
X = df.apply(lambda row: [row['Technical_Score'], row['Soft_Skill_Score']] + row['Strength_Encoded'] + row['Weak_Encoded'], axis=1)
X = pd.DataFrame(X.tolist(), columns=['Technical_Score', 'Soft_Skill_Score'] + [f'Strength_{area}' for area in all_areas] + [f'Weak_{area}' for area in all_areas])

# Target variable (Output)
y = df['Output']

# Split the data into training and testing sets (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Save the trained model
joblib.dump(model, 'random_forest_model.pkl')