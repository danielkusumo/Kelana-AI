import os
import boto3
from typing import Any
from dotenv import load_dotenv

load_dotenv()

# minimum score for retrieving document
SCORE_THRESHOLD = float(os.getenv("KB_SCORE_THRESHOLD"))

def get_kb_client():
    """
    Return a Bedrock Agent Runtime client for knowledge-base retrieval.
    """
    region = os.getenv("AWS_REGION")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")

    if not region:
        raise ValueError("AWS_REGION is not set in the environment.")
    if not access_key or not secret_key:
        raise ValueError("AWS credentials (ACCESS_KEY_ID / SECRET_ACCESS_KEY) are not set.")

    return boto3.client(
        "bedrock-agent-runtime",
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )

def _get_converse_client():
    """Return a Bedrock Runtime client to generate text."""
    region = os.getenv("AWS_REGION")
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    return boto3.client(
        "bedrock-runtime",
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )

def _doc_name(uri: str | None) -> str:
    """Extract a readable document name (e.g. 'Kazakhstan.pdf') from a URI."""
    if not uri:
        return "Document"
    filename = uri.split("/")[-1].split("?")[0]
    return filename or "Document"


def _format_source(result: dict[str, Any]) -> dict[str, Any]:
    """Extract a readable source summary from a retrieval result."""
    score = result.get("score") or 0.0
    content = (result.get("content") or {}).get("text", "") or ""

    location = result.get("location") or {}
    uri = None
    for loc in ("s3Location", "webLocation", "customDocumentLocation", "kendraDocumentLocation"):
        if location.get(loc):
            uri = location[loc].get("uri") or location[loc].get("url")
            break

    metadata = (result.get("metadata") or {})
    title = (
        metadata.get("title")
        or metadata.get("documentName")
        or metadata.get("source")
        or _doc_name(uri)
    )

    snippet = " ".join(content.split())[:280]
    if len(content) > 280:
        snippet += "..."

    return {
        "score": round(float(score), 3),
        "title": str(title),
        "uri": uri,
        "snippet": snippet,
    }

def retrieve_context(question: str) -> dict[str, Any]:
    """
    Retrieve & filter the most relevant documents from the Bedrock knowledge base.

    Returns a dict:
        {"context": str, "sources": [...], "accepted": bool}

    `sources` only includes documents with score >= KB_SCORE_THRESHOLD (default 0.4).
    If no source passes the threshold, `accepted` is False and `context` is empty.
    """
    kb_id = os.getenv("KNOWLEDGE_BASE_ID")

    if not kb_id:
        raise ValueError("KNOWLEDGE_BASE_ID is not set in the environment.")

    client = get_kb_client()

    retrieve_response = client.retrieve(
        knowledgeBaseId=kb_id,
        retrievalQuery={"text": question},
        retrievalConfiguration={
            "managedSearchConfiguration": {
                "numberOfResults": 5,
            }
        },
    )

    raw_results = retrieve_response.get("retrievalResults", []) or []

    # Build filtered source list and context from given docs
    accepted_sources = []
    context_parts = []
    seen = set()
    for r in raw_results:
        source = _format_source(r)
        if source["score"] < SCORE_THRESHOLD:
            continue
        key = source.get("uri") or source.get("title") or source["snippet"]
        if key in seen:
            continue
        seen.add(key)
        accepted_sources.append(source)
        content = (r.get("content") or {}).get("text", "") or ""
        context_parts.append(content)

    if not accepted_sources:
        return {"context": "", "sources": [], "accepted": False}

    return {
        "context": "\n\n".join(context_parts),
        "sources": accepted_sources,
        "accepted": True,
    }

def generate_answer(prompt: str) -> str:
    """Generate a text answer from a fully-built prompt via Amazon Bedrock."""
    model_id = os.getenv("KNOWLEDGE_BASE_MODEL_ARN")
    if not model_id:
        raise ValueError("KNOWLEDGE_BASE_MODEL_ARN is not set in the environment.")

    converse_client = _get_converse_client()
    response = converse_client.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
    )

    output_message = response["output"]["message"]
    text_parts = [
        block["text"]
        for block in output_message["content"] if "text" in block
    ]
    return "\n".join(text_parts).strip() or "Mohon maaf, saya tidak dapat membantu."

def ask_knowledge_base(question: str) -> dict[str, Any]:
    """
    Ask the Bedrock knowledge base a question and generate a grounded answer (RAG).

    Returns a dict:
        {"answer": str, "sources": [...], "accepted": bool}

    `sources` only includes documents with score >= KB_SCORE_THRESHOLD (default 0.4).
    If no source passes the threshold, the answer is a refusal message.
    """
    from services.prompt_builder import build_single_prompt

    result = retrieve_context(question)

    if not result["accepted"]:
        return {
            "answer": (
                "Mohon maaf, saya tidak dapat membantu menjawab pertanyaan ini. "
                "Informasi yang relevan tidak ditemukan di dokumen perjalanan yang tersedia "
                "atau relevansinya di bawah ambang batas kepercayaan."
            ),
            "sources": [],
            "accepted": False,
        }

    answer = generate_answer(build_single_prompt(result["context"], question))
    return {"answer": answer, "sources": result["sources"], "accepted": True}