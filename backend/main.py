def print_trip_summary(destination, country, days, budget, currency, travel_month):
    # remove numbers after comma if it's integer
    if budget == int(budget):
        budget_str = f"{int(budget)}"
    else:
        budget_str = f"{budget}"

    print("\n==========================")
    print("KelanaAI")
    print("==========================")
    print(f"Destination  : {destination}")
    print(f"Country      : {country}")
    print(f"Days         : {days}")
    print(f"Budget       : {budget_str} {currency}")
    print(f"Currency     : {currency}")
    print(f"Travel Month : {travel_month}")

def main():
    destination = input("Destination : ")
    country = input("Country : ")
    days = int(input("Days : "))
    budget = float(input("Budget : "))
    currency = input("Currency : ")
    travel_month = input("Travel Month : ")
    print_trip_summary(destination, country, days, budget, currency, travel_month)

if __name__ == "__main__":
    main()