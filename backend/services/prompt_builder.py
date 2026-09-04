from typing import Any

def build_single_prompt(context: str, question: str) -> str:
    """Single-turn prompt used by the plain Knowledge Base search (`/ask`)."""
    return (
        "You are a helpful travel assistant. Answer the question using ONLY the "
        "travel documentation below. Be concise and structured. "
        "If the answer is not in the documents, say you cannot answer.\n\n"
        f"--- DOCUMENTS ---\n{context}\n\n"
        f"--- QUESTION ---\n{question}\n\n"
        "--- ANSWER ---"
    )

def build_chat_prompt(context: str, history: list[dict[str, Any]], question: str) -> str:
    """
    Build a conversation-aware prompt.

    `history` is a list of dicts: [{"role": "user"|"assistant", "content": str}, ...].
    Prior turns provide conversational context, but the model must still answer
    the latest question using ONLY the retrieved travel documents.
    """
    parts = [
        "You are a helpful travel assistant. Answer the user's LATEST question "
        "using ONLY the travel documentation below. Be concise and structured.",
        "You may use earlier conversation turns for context, but every claim must "
        "be grounded in the provided documents.",
        "If the answer is not in the documents, say you cannot answer.",
        "",
        "--- DOCUMENTS ---",
        context.strip() or "(no relevant documents found)",
        "",
        "--- CONVERSATION HISTORY ---",
    ]

    if not history:
        
        parts.append("(no previous messages)")
    else:
        for m in history:
            role = "User" if m.get("role") == "user" else "Assistant"
            parts.append(f"{role}: {m.get('content', '')}")

    # If the last turn is the question itself, avoid duplicating it.
    question_text = question.strip()
    if history and history[-1].get("role") == "user":
        if history[-1].get("content", "").strip() == question_text:
            question_text = ""

    parts += ["", "--- QUESTION ---", question_text or "(continuation)", "", "--- ANSWER ---"]
    return "\n".join(parts)