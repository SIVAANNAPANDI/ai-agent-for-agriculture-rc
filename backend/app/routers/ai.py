from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.ai import ChatRequest, ChatResponse, ConversationResponse, ConversationSummary
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["AI Agriculture Agent"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agri_agent(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Interact with AgriAssist AI Agricultural Agent (Nemotron-3 with strict agronomic guardrails and tool calling)."""
    return await AIService.process_chat(db, current_user, payload)


@router.get("/conversations", response_model=List[ConversationSummary])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all previous AI consultation threads for the farmer."""
    return AIService.list_conversations(db, current_user)


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation_history(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full message history for a specific conversation thread."""
    return AIService.get_conversation(db, conversation_id, current_user)


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an AI consultation thread."""
    AIService.delete_conversation(db, conversation_id, current_user)
    return None
