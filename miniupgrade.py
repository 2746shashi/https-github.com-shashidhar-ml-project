
import tkinter as tk
from tkinter import messagebox
import csv
import os


def evaluate_loan(age, income, credit_score, employment, loan_amount):
    
    if age < 18:
        return "Rejected (Underage)"
    
    if credit_score >= 750 and income >= 50000 and employment != "unemployed":
        return "Approved"
    
    elif 650 <= credit_score < 750 and income >= 30000:
        return "Approved with Conditions"
    
    elif credit_score < 650 or income < 20000:
        return "Rejected"
    
    else:
        return "Verification Required"



def save_to_file(data):
    file_exists = os.path.isfile("loan_data.csv")
    
    with open("loan_data.csv", mode='a', newline='') as file:
        writer = csv.writer(file)
        
        if not file_exists:
            writer.writerow(["Name", "Age", "Income", "Credit Score", "Employment", "Loan Amount", "Decision"])
        
        writer.writerow(data)



def submit():
    try:
        name = entry_name.get()
        age = int(entry_age.get())
        income = float(entry_income.get())
        credit_score = int(entry_credit.get())
        employment = entry_employment.get().lower()
        loan_amount = float(entry_loan.get())

        decision = evaluate_loan(age, income, credit_score, employment, loan_amount)

        result_label.config(text=f"Decision: {decision}")

        # Save data
        save_to_file([name, age, income, credit_score, employment, loan_amount, decision])

        messagebox.showinfo("Success", "Application Processed Successfully!")

    except:
        messagebox.showerror("Error", "Please enter valid data")


root = tk.Tk()
root.title("Loan Approval System")
root.geometry("400x450")

tk.Label(root, text="Loan Approval System", font=("Arial", 16)).pack(pady=10)

tk.Label(root, text="Name").pack()
entry_name = tk.Entry(root)
entry_name.pack()

tk.Label(root, text="Age").pack()
entry_age = tk.Entry(root)
entry_age.pack()

tk.Label(root, text="Monthly Income (₹)").pack()
entry_income = tk.Entry(root)
entry_income.pack()

tk.Label(root, text="Credit Score").pack()
entry_credit = tk.Entry(root)
entry_credit.pack()

tk.Label(root, text="Employment Status").pack()
entry_employment = tk.Entry(root)
entry_employment.pack()

tk.Label(root, text="Loan Amount (₹)").pack()
entry_loan = tk.Entry(root)
entry_loan.pack()


tk.Button(root, text="Submit", command=submit, bg="green", fg="white").pack(pady=15)


result_label = tk.Label(root, text="Decision: ", font=("Arial", 12))
result_label.pack()


root.mainloop()