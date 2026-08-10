def print_trip_summary(destination, country, days, budget, currency, travel_month):
    # remove numbers after comma if it's integer
    if budget == int(budget):
        budget_str = f"{int(budget)}"
    else:
        budget_str = f"{budget}"

    print("\n========================")
    print("KelanaAI")
    print("========================")
    print(f"{'Destination':>12} : {destination}")
    print(f"{'Country':>12}   : {country}")
    print(f"{'Days':>12}     : {days}")
    print(f"{'Budget':>12}    : {budget_str} {currency}")
    print(f"{'Currency':>12}   : {currency}")
    print(f"{'Travel Month':>12} : {travel_month}")

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