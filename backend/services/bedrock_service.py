import os
import boto3
from dotenv import load_dotenv

load_dotenv()

def get_bedrock_client():
    """
    Configure and return a Bedrock runtime client.
    Uses AWS_BEARER_TOKEN_BEDROCK for bearer token authentication
    and AWS_REGION from the .env file.
    """

    region = os.getenv("AWS_REGION")
    bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")

    if not region:
        raise ValueError("AWS_REGION is not set in the environment.")
    if not bearer_token:
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK is not set in the environment.")

    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=region,
        aws_session_token=bearer_token,
    )

    return client


def get_ai_recommendation(destination: str, days: int, budget: float, travel_style: str) -> str:
    """
    Call Amazon Bedrock to generate a travel itinerary recommendation.

    Args:
        destination: The travel destination (e.g. "Bali")
        days: Number of travel days
        budget: Total budget in USD
        travel_style: Travel style (e.g. "Backpacker", "Standard", "Luxury")

    Returns:
        AI-generated itinerary as a string.
    """

    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    prompt = (
        f"You are an experienced travel planner.\n"
        f"Create a detailed travel plan for a {days}-day trip to {destination}.\n\n"
        f"--- TRIP DETAILS ---\n"
        f"- Destination: {destination}\n"
        f"- Duration: {days} Days\n"
        f"- Total Budget: USD {budget}\n"
        f"- Travel Style: {travel_style}\n\n"
        f"--- OUTPUT REQUIREMENTS ---\n"
        f"Please deliver the entire response in clean, standard Markdown. Follow these strict formatting rules:\n"
        f"1. **No Raw Escape Characters**: Do not return raw '\\n' strings. Use standard text line breaks.\n"
        f"2. **Strict List Indentation**: For bullet points, use a single dash `- ` for the main item. For sub-items, indent with exactly two spaces and a dash (e.g., '  - '). Do not mix tabs or multiple spaces.\n"
        f"3. **Structure Outline**:\n"
        f"   # {days}-Day Travel Plan to {destination}\n\n"
        f"   ## Trip Overview\n"
        f"   [Provide brief overview here]\n\n"
        f"   ## Daily Itinerary\n"
        f"   For EACH day (Day 1 to Day {days}), structure it precisely like this example and follow these time-of-day constraints:\n"
        f"   - Morning: Provide exactly 2 to 3 distinct activities per day.\n"
        f"   - Afternoon: Focus strictly on cultural sites, historical landmarks, and immersive local experiences.\n"
        f"   - Evening: Focus strictly on excellent dinner spots, local culinary hubs, and vibrant nightlife options.\n\n"
        f"   ### Day 1: [Day Title]\n"
        f"   - Morning\n"
        f"     - Activity 1\n"
        f"     - Activity 2\n"
        f"     - Activity 3 (Optional)\n"
        f"   - Afternoon\n"
        f"     - Cultural Site / Experience 1\n"
        f"     - Cultural Site / Experience 2\n"
        f"   - Evening\n"
        f"     - Dinner Spot\n"
        f"     - Nightlife / Evening Activity\n\n"
        f"   ## Estimated Daily Budget\n"
        f"   [Provide standard Markdown table with columns: Category | Cost per Day (USD) | Total Cost (USD)]\n\n"
        f"   ## Food Recommendations\n"
        f"   - **Local Dishes**: [Items]\n"
        f"   - **Street Food**: [Items]\n"
        f"   - **Dining Areas**: [Items]\n\n"
        f"   ## Transport Suggestions\n"
        f"   - **Options**: [List options here]\n\n"
        f"Make sure to stop exactly when Day {days} is finished. Do not add conversational intro or outro text outside the markdown structure."
    )


    # Payload format for Amazon Nova / Converse API
    payload = {
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ]
    }

    client = get_bedrock_client()

    response = client.converse(
        modelId=model_id,
        messages=payload["messages"],
    )

    # Extract the text from the response
    output_message = response["output"]["message"]
    text_parts = [
        block["text"]
        for block in output_message["content"] if "text" in block
    ]
    return "\n".join(text_parts)