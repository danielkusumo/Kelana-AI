import os
from typing import Any
import boto3
from dotenv import load_dotenv

load_dotenv()

def get_bedrock_client():
    """
    Configure and return a Bedrock runtime client.
    Uses explicit credentials from the .env file (AWS_REGION, AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY) and falls back to the bearer token if the key pair is absent.
    """

    region = os.getenv("AWS_REGION")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")

    if not region:
        raise ValueError("AWS_REGION is not set in the environment.")

    kwargs = {"service_name": "bedrock-runtime", "region_name": region}

    if access_key and secret_key:
        kwargs["aws_access_key_id"] = access_key
        kwargs["aws_secret_access_key"] = secret_key
    else:
        bearer_token = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
        if not bearer_token:
            raise ValueError("AWS credentials are not set in the environment.")
        kwargs["aws_session_token"] = bearer_token

    return boto3.client(**kwargs)

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


def ask_base_model(question: str) -> str:
    """
    Ask the base foundation model directly (NO knowledge base) and return its answer.

    This is used as a comparison baseline against the RAG-based `ask_knowledge_base`.
    """
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    messages = [
        {
            "role": "user",
            "content": [{"text": question}],
        }
    ]

    client = get_bedrock_client()
    response = client.converse(modelId=model_id, messages=messages)

    output_message = response["output"]["message"]
    text_parts = [
        block["text"]
        for block in output_message["content"] if "text" in block
    ]
    return "\n".join(text_parts)


def generate_base_model_chat(turns: list[dict[str, str]], system_text: str | None = None) -> str:
    """
    Generate a reply from the base foundation model given a full multi-turn
    conversation (`turns` = [{"role": "user"|"assistant", "content": str}, ...]).

    No knowledge base is used — the model answers from its own knowledge and the
    conversation history provided. `system_text` (if given) is passed as a system
    prompt, used to inject a rolling summary of the earlier conversation.
    """
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    messages = [
        {"role": t["role"], "content": [{"text": t["content"]}]}
        for t in turns
    ]

    kwargs: dict[str, Any] = {"modelId": model_id, "messages": messages}
    if system_text:
        kwargs["system"] = [{"text": system_text}]

    client = get_bedrock_client()
    response = client.converse(**kwargs)

    output_message = response["output"]["message"]
    text_parts = [
        block["text"]
        for block in output_message["content"] if "text" in block
    ]
    return "\n".join(text_parts)


def summarize_conversation(text: str) -> str:
    """
    Condense a (portion of a) conversation into a short, dense summary. Used to
    keep long chat histories inside the model's context window.
    """
    model_id = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

    prompt = (
        "You are a faithful conversation summarizer. Condense ONLY the travel "
        "Q&A conversation below. Rules:\n"
        "1. Reproduce only facts, destinations, dates, budgets, preferences and "
        "conclusions that are actually stated in the conversation.\n"
        "2. Do NOT add, infer or invent any detail that is not in the conversation "
        "(no made-up trips, cities, or numbers).\n"
        "3. If a fact is ambiguous, omit it rather than guess.\n"
        "4. Keep it under 200 words.\n\n"
        f"--- CONVERSATION ---\n{text}\n\n"
        "--- SUMMARY ---"
    )

    client = get_bedrock_client()
    response = client.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
    )

    output_message = response["output"]["message"]
    text_parts = [
        block["text"]
        for block in output_message["content"] if "text" in block
    ]
    summary = "\n".join(text_parts).strip()
    # Fallback if the model returned nothing useful.
    return summary or text[:1000]