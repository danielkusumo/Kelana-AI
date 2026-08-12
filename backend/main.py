from services.trip_service import (get_travel_session, get_trip_category, calculate_daily_budget, get_recommendations, format_recommendations, get_transport)

def print_trip_summary(destination, days, budget, currency, travel_month):
    # remove decimals if it's integer
    if budget == int(budget):
        budget_str = f"{int(budget)}"
    else:
        budget_str = f"{budget}"

    # calculate and format daily budget
    daily_budget = calculate_daily_budget(budget, days)
    if daily_budget == int(daily_budget):
        daily_budget_str = f"{int(daily_budget)}"
    else:
        daily_budget_str = f"{daily_budget}"

    print("\n==========================")
    print("KelanaAI")
    print("==========================")
    print(f"Destination  : {destination}")
    print(f"Days         : {days}")
    print(f"Budget       : {budget_str} {currency}")
    print(f"Category     : {get_trip_category(budget)}")
    print(f"Daily Budget : {daily_budget_str} {currency}/Day")
    print(f"Travel Month : {travel_month}")
    print(f"Season       : {get_travel_session(travel_month)}")
    print(f"Transport    : {get_transport(get_trip_category(budget))}")

    places = get_recommendations(destination)
    print(format_recommendations(places))

def main():
    while True:
        print()
        print("=" * 40)
        print("Welcome to KelanaAI - Your Trip Planner!")
        print("=" * 40)

        destination = input("Destination  : ")
        days = int(input("Days         : "))
        budget = int(input("Budget       : "))
        currency = input("Currency     : ")
        travel_month = input("Travel Month : ")
        print_trip_summary(destination, days, budget, currency, travel_month)

        again = input("\nDo you want to add more destinations? (y/n): ").strip().lower()
        if again not in ("y", "yes"):
            print("\nThank you for using KelanaAI. Safe travels!")
            break

if __name__ == "__main__":
    main()