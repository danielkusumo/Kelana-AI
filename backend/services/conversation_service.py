import os
from typing import Any
from fastapi import HTTPException
from database import SessionLocal
from models.conversation import Conversation, Message
from services.bedrock_service import generate_base_model_chat, summarize_conversation

# How many recent messages are kept verbatim; older ones are folded into a rolling
# summary so long conversations fit the model's context window.
MAX_KEEP_MESSAGES = int(os.getenv("CHAT_MAX_KEEP_MESSAGES", "16"))

def _iso(dt) -> str:
    return dt.isoformat() if dt else None

def message_to_dict(m: Message) -> dict[str, Any]:
    return {
        "id": m.id,
        "conversation_id": m.conversation_id,
        "role": m.role,
        "content": m.content,
        "created_at": _iso(m.created_at),
    }

def conversation_to_dict(
    c: Conversation, *, with_messages: bool = False
) -> dict[str, Any]:
    data = {
        "id": c.id,
        "user_id": c.user_id,
        "title": c.title,
        "summary": c.summary,
        "created_at": _iso(c.created_at),
        "message_count": len(c.messages) if with_messages else 0,
    }
    if with_messages:
        data["messages"] = [message_to_dict(m) for m in c.messages]
    return data

def create_conversation(user_id: int) -> dict[str, Any]:
    db = SessionLocal()
    try:
        conv = Conversation(user_id=user_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        return conversation_to_dict(conv)
    finally:
        db.close()

def list_conversations(user_id: int) -> list[dict[str, Any]]:
    db = SessionLocal()
    try:
        convs = (
            db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
            .all()
        )
        rows = []
        for c in convs:
            first = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.id).first()
            last = db.query(Message).filter(Message.conversation_id == c.id).order_by(Message.id.desc()).first()
            count = db.query(Message).filter(Message.conversation_id == c.id).count()
            meta = conversation_to_dict(c)
            meta["message_count"] = count
            meta["last_message"] = last.content if last else None
            meta["last_message_role"] = last.role if last else None
            # Default title = the first question, unless the user renamed it.
            meta["title"] = c.title or (first.content[:60] if first else None)
            rows.append(meta)
        return rows
    finally:
        db.close()

def get_conversation(user_id: int, conversation_id: int) -> dict[str, Any]:
    db = SessionLocal()
    try:
        conv = _fetch_owned(db, user_id, conversation_id)
        return conversation_to_dict(conv, with_messages=True)
    finally:
        db.close()

def _fetch_owned(db, user_id: int, conversation_id: int) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if conv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this conversation")
    return conv

def _history(db, conversation_id: int, exclude_last_id: int | None = None) -> list[dict[str, str]]:
    q = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.id)
    if exclude_last_id is not None:
        q = q.filter(Message.id != exclude_last_id)
    return [{"role": m.role, "content": m.content} for m in q.all()]


def _render_messages(messages: list[dict[str, str]]) -> str:
    return "\n\n".join(f"{m['role']}: {m['content']}" for m in messages)


def _fold_history(summary: str | None, history: list[dict[str, str]], expected: dict) -> None:
    """Trim + summarize the history into the rolling summary (in place on `expected`)."""
    if len(history) < MAX_KEEP_MESSAGES:
        expected["history"] = history
        expected["system_text"] = None
        expected["new_summary"] = None
        return

    older = history[:-MAX_KEEP_MESSAGES]
    recent = history[-MAX_KEEP_MESSAGES:]

    prompt_parts = []
    if summary:
        prompt_parts.append("EXISTING SUMMARY:\n" + summary)
    prompt_parts.append("NEW MESSAGES TO ADD:\n" + _render_messages(older))
    new_summary = summarize_conversation("\n\n".join(prompt_parts))

    expected["history"] = recent
    expected["system_text"] = (
        "This is a summary of the earlier part of this conversation:\n" + new_summary
    )
    expected["new_summary"] = new_summary

def send_message(user_id: int, conversation_id: int, content: str) -> dict[str, Any]:
    content = (content or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    # validate ownership, capture history, persist the user message
    db = SessionLocal()
    try:
        conv = _fetch_owned(db, user_id, conversation_id)
        history = _history(db, conversation_id)
        if not conv.title:
            conv.title = content[:60]

        # Trim + summarize older turns so the context stays inside the model window.
        folded: dict[str, Any] = {}
        _fold_history(conv.summary, history, folded)
        if folded["new_summary"] is not None:
            conv.summary = folded["new_summary"]

        user_msg = Message(conversation_id=conv.id, role="user", content=content)
        db.add(user_msg)
        db.commit()
        db.refresh(user_msg)
        stored_history = folded["history"] + [{"role": "user", "content": content}]
        system_text = folded["system_text"]
    finally:
        db.close()

    # Generate a reply from the base foundation model using the conversation history
    # (no knowledge-base retrieval; chat uses the base model).
    turns = [{"role": m["role"], "content": m["content"]} for m in stored_history]
    assistant_content = generate_base_model_chat(turns, system_text=system_text)
    accepted = False
    sources = []

    # persist the assistant reply
    db = SessionLocal()
    try:
        conv = _fetch_owned(db, user_id, conversation_id)
        assistant_msg = Message(conversation_id=conversation_id, role="assistant", content=assistant_content)
        db.add(assistant_msg)
        db.commit()
        db.refresh(assistant_msg)
        return {
            "conversation": conversation_to_dict(conv, with_messages=True),
            "user_message": message_to_dict(user_msg),
            "assistant_message": message_to_dict(assistant_msg),
            "sources": sources,
            "accepted": accepted,
        }
    finally:
        db.close()

def update_conversation(user_id: int, conversation_id: int, title: str) -> dict[str, Any]:
    """Rename a conversation (owner only)."""
    title = (title or "").strip()[:60]
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    db = SessionLocal()
    try:
        conv = _fetch_owned(db, user_id, conversation_id)
        conv.title = title
        db.commit()
        db.refresh(conv)
        return conversation_to_dict(conv)
    finally:
        db.close()

def delete_conversation(user_id: int, conversation_id: int) -> dict[str, Any]:
    """Delete a conversation and its messages (owner only)."""
    db = SessionLocal()
    try:
        conv = _fetch_owned(db, user_id, conversation_id)
        db.delete(conv)
        db.commit()
        return {"message": f"Conversation {conversation_id} deleted"}
    finally:
        db.close()