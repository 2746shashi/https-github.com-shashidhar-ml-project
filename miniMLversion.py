import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# Step 1: Create Dataset (Sample Data)
data = {
    "age": [25, 40, 35, 28, 50, 23, 45, 33],
    "income": [30000, 80000, 60000, 25000, 90000, 20000, 70000, 40000],
    "credit_score": [650, 800, 750, 600, 820, 580, 770, 690],
    "employment": [1, 1, 1, 0, 1, 0, 1, 1],  # 1=employed, 0=unemployed
    "loan_approved": [1, 1, 1, 0, 1, 0, 1, 0]
}

df = pd.DataFrame(data)
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
X = scaler.fit_transform()

# Step 2: Split Data
X = df[["age", "income", "credit_score", "employment"]]
y = df["loan_approved"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Step 3: Train Model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Step 4: Prediction Function
def predict_loan():
    print("===== ML Loan Prediction System =====")

    age = int(input("Enter Age: "))
    income = float(input("Enter Monthly Income: "))
    credit_score = int(input("Enter Credit Score: "))
    employment = int(input("Employment (1=Yes, 0=No): "))

    prediction = model.predict([[age, income, credit_score, employment]])

    if prediction[0] == 1:
        print("✅ Loan Approved (ML Prediction)")
    else:
        print("❌ Loan Rejected (ML Prediction)")

# Run prediction
predict_loan()