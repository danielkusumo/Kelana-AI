def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif 1000 <= budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_transport(cat):
    if cat == "Backpacker":
        return "Bus"
    elif cat == "Standard":
        return "Train"
    else:
        return "Flight"

def get_travel_session(month):
    if month == "December":
        return "Peak Season"
    elif month == "June":
        return "Holiday Season"
    else:
        return "Regular Season"

def calculate_daily_budget(budget, days):
    if days <= 0:
        return 0
    return round(budget / days, 2)

def get_recommendations(destination):
    recommendations = {
        "Bali": ["Ubud", "Seminyak", "Nusa Penida", "Uluwatu"],
        "Paris": ["Eiffel Tower", "Louvre Museum", "Notre Dame", "Montmartre"],
        "Tokyo": ["Shibuya", "Asakusa", "Akihabara", "Shinjuku"],
        "New York": ["Times Square", "Central Park", "Statue of Liberty", "Brooklyn Bridge"],
        "London": ["Big Ben", "London Eye", "Tower Bridge", "British Museum"],
    }
    return recommendations.get(destination, ["Explore local attractions", "Visit city center", "Try local cuisine"],)

def format_recommendations(places):
    result = "\nRecommended Places\n" 
    for i, place in enumerate(places):
        if i < len(places) - 1:
            result += f"- {place}\n"
        else:
            result += f"- {place}"
    return result