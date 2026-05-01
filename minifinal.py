# ML Loan Approval System (Final Version)

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

# -------------------------
# Step 1: Dataset
# -------------------------
data = {
    "age": [25, 40, 35, 28, 50, 23, 45, 33],
    "income": [30000, 80000, 60000, 25000, 90000, 20000, 70000, 40000],
    "credit_score": [650, 800, 750, 600, 820, 580, 770, 690],
    "employment": [1, 1, 1, 0, 1, 0, 1, 1],
    "loan_approved": [1, 1, 1, 0, 1, 0, 1, 0]
}

df = pd.DataFrame(data)

# -------------------------
# Step 2: Features & Target
# -------------------------
X = df[["age", "income", "credit_score", "employment"]]
y = df["loan_approved"]

# -------------------------
# Step 3: Scaling
# -------------------------
scaler = StandardScaler()
X = scaler.fit_transform(X)

# -------------------------
# Step 4: Split Data
# -------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -------------------------
# Step 5: Train Model
# -------------------------
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# -------------------------
# Step 6: Accuracy
# -------------------------
accuracy = model.score(X_test, y_test)
print(f"\nModel Accuracy: {accuracy * 100:.2f}%")

# -------------------------
# Step 7: Prediction Function
# -------------------------
def predict_loan():
    print("\n===== ML Loan Prediction System =====")

    try:
        age = int(input("Enter Age: "))
        income = float(input("Enter Monthly Income: "))
        credit_score = int(input("Enter Credit Score: "))
        employment = int(input("Employment (1=Yes, 0=No): "))

        # Scale input
        user_data = scaler.transform([[age, income, credit_score, employment]])

        prediction = model.predict(user_data)

        if prediction[0] == 1:
            print("✅ Loan Approved")
        else:
            print("❌ Loan Rejected")

    except:
        print("⚠️ Invalid input! Please try again.")

# -------------------------
# Run Program
# -------------------------
predict_loan()