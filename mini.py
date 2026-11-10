
def loan_approval():
    print("====== Loan Approval System ======")

    # Taking user input
    name = input("Enter Applicant Name: ")
    age = int(input("Enter Age: "))
    income = float(input("Enter Monthly Income (₹): "))
    credit_score = int(input("Enter Credit Score (300-900): "))
    employment = input("Employment Status (employed/self-employed/unemployed): ").lower()
    loan_amount = float(input("Enter Loan Amount Required (₹): "))

    print("\nProcessing Application...\n")


    if age < 18:
        print("❌ Loan Rejected: Applicant must be 18+")
    
    elif credit_score >= 750 and income >= 50000 and employment != "unemployed":
        print("✅ Loan Approved")
    
    elif 650 <= credit_score < 750 and income >= 30000:
        print("⚠️ Loan Approved with Conditions (Higher Interest)")
    
    elif credit_score < 650 or income < 20000:
        print("❌ Loan Rejected due to Low Credit Score or Income")
    
    else:
        print("⚠️ Further Verification Required")

    print("\n===== Application Summary =====")
    print(f"Name: {name}")
    print(f"Age: {age}")
    print(f"Income: ₹{income}")
    print(f"Credit Score: {credit_score}")
    print(f"Employment: {employment}")
    print(f"Loan Amount: ₹{loan_amount}")


loan_approval()