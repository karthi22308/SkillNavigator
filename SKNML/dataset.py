import pandas as pd
import random

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

# Function to create sample data
def create_sample_data(num_samples=1000):
    data = {
        'Technical_Score': [random.randint(50, 100) for _ in range(num_samples)],
        'Soft_Skill_Score': [random.randint(50, 100) for _ in range(num_samples)],
        'Strength_Areas': [', '.join(random.sample(all_areas, 3)) for _ in range(num_samples)],
        'Weak_Areas': [', '.join(random.sample(all_areas, 2)) for _ in range(num_samples)],
    }

    # Generate output (courses suggested)
    data['Output'] = []
    for i in range(num_samples):
        strengths = data['Strength_Areas'][i].split(', ')
        weaknesses = data['Weak_Areas'][i].split(', ')
        courses = []
        for area in strengths:
            courses.append(course_mapping[area][1])  # Advanced courses for strengths
        for area in weaknesses:
            courses.append(course_mapping[area][0])  # Beginner courses for weaknesses
        data['Output'].append(', '.join(courses))

    df = pd.DataFrame(data)

    # Save to Excel or CSV
    df.to_excel("candidate_data.xlsx", index=False)  # Save as Excel file
    # df.to_csv("candidate_data.csv", index=False)  # Save as CSV file

    return df


# Generate the dummy data and save it as Excel
create_sample_data()