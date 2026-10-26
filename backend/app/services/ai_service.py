import re
import httpx
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.config import settings
from app.models.user import User
from app.models.farm import Farm
from app.models.ai import AIConversation, AIMessage
from app.models.crop import Crop
from app.models.cultivation import CultivationCycle
from app.services.weather_service import WeatherService
from app.schemas.ai import ChatRequest, ChatResponse, MessageSchema, ConversationResponse, ConversationSummary
from app.core.exceptions import NotFoundException, ForbiddenException


# Strictly Agricultural Domain Keywords
AGRI_KEYWORDS = [
    "crop", "crops", "farm", "farming", "soil", "npk", "nitrogen", "phosphorus", "potassium",
    "fertilizer", "fertigation", "ph", "irrigation", "water", "drip", "sprinkler", "rain",
    "weather", "temperature", "humidity", "disease", "pest", "fungus", "blight", "rot",
    "tomato", "potato", "paddy", "rice", "cotton", "maize", "turmeric", "pepper", "chilli",
    "harvest", "sowing", "transplant", "weeding", "yield", "cultivation", "seed", "nursery",
    "organic", "compost", "manure", "neem", "tractor", "labour", "market", "produce",
    "plant", "leaf", "leaves", "stem", "root", "flower", "fruit", "agriculture", "agronomy",
    "spray", "pesticide", "herbicide", "insecticide", "pruning", "mulch", "calcium", "boron",
    # Tamil Keywords
    "விவசாயம்", "பயிர்", "மண்", "உரம்", "பாசனம்", "தண்ணீர்", "மழை", "வானிலை", "நோய்",
    "பூச்சி", "தக்காளி", "நெல்", "மஞ்சள்", "பருத்தி", "சோளம்", "அறுவடை", "விதை", "நாற்று",
    "களையெடுப்பு", "தோட்டம்", "பண்ணை", "காய்கறி", "வேளாண்மை", "இயற்கை உரம்", "பூச்சிக்கொல்லி"
]

NON_AGRI_KEYWORDS = [
    "movie", "cinema", "actor", "actress", "film", "song", "music", "cricket", "football",
    "sports", "world cup", "gaming", "playstation", "minecraft", "election", "politics",
    "prime minister", "president", "bitcoin", "crypto", "blockchain", "javascript code",
    "python script for web", "react component", "gym workout", "hollywood", "bollywood"
]


class AIService:
    @staticmethod
    def is_agricultural_query(text: str) -> bool:
        lower = text.lower()

        # Check for explicit non-agri markers
        for non_kw in NON_AGRI_KEYWORDS:
            if non_kw in lower:
                # Unless it also contains strong farming context
                if not any(agri in lower for agri in ["crop", "farm", "soil", "விவசாய"]):
                    return False

        # If text is too short and no agri keywords, check length
        words = re.findall(r"\w+", lower)
        if len(words) <= 2 and not any(k in lower for k in AGRI_KEYWORDS):
            # Greetings like "hello", "hi", "வணக்கம்" are allowed
            if any(g in lower for g in ["hi", "hello", "hey", "vanakkam", "வணக்கம்", "good morning"]):
                return True
            return False

        # Check if any agri keyword appears
        for kw in AGRI_KEYWORDS:
            if kw in lower:
                return True

        # Default fallback for general greetings or short questions
        if any(g in lower for g in ["hi", "hello", "hey", "help", "who are you", "வணக்கம்"]):
            return True

        return False

    @staticmethod
    def get_guardrail_response(language: str = "en") -> str:
        if language == "ta":
            return (
                "நான் உங்கள் AgriAssist விவசாய நுண்ணறிவு உதவியாளர். பயிர் சாகுபடி, மண் வளம், "
                "வானிலை, பூச்சி மற்றும் நோய் மேலாண்மை, பண்ணை மேலாண்மை போன்ற விவசாயம் சார்ந்த கேள்விகளுக்கு "
                "மட்டுமே நான் உதவ முடியும். உங்கள் பண்ணைக்கு நான் எவ்வாறு உதவலாம்?"
            )
        return (
            "I am your AgriAssist agricultural intelligence agent. I can only assist with farming, "
            "crop cultivation, soil health, weather advisories, plant diseases, and farm management. "
            "How can I help your farm today?"
        )

    @classmethod
    async def execute_agri_tools(
        cls,
        db: Session,
        user: User,
        query: str,
        farm_id: Optional[int] = None
    ) -> Tuple[List[str], List[Dict[str, Any]]]:
        """Dynamically detect needed tools and fetch real database & weather context."""
        tools_executed: List[str] = []
        tool_results: List[Dict[str, Any]] = []
        q_lower = query.lower()

        # Find target farm
        farm = None
        if farm_id:
            farm = db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user.id).first()
        if not farm:
            farm = db.query(Farm).filter(Farm.user_id == user.id).first()

        # Tool 1: Farm Microclimate Weather
        if any(w in q_lower for w in ["weather", "rain", "temperature", "forecast", "wind", "வானிலை", "மழை"]):
            if farm:
                w_res = await WeatherService.get_current_weather(
                    float(farm.latitude), float(farm.longitude), farm.location_name
                )
                tools_executed.append("get_current_weather")
                tool_results.append({
                    "tool": "get_current_weather",
                    "location": farm.location_name,
                    "temperature": w_res.temperature,
                    "condition": w_res.condition,
                    "humidity": w_res.humidity,
                    "wind_speed": w_res.wind_speed,
                    "rain_risk_pct": w_res.rain_risk_pct,
                    "advisory": w_res.advisory.actionable_summary
                })

        # Tool 2: Farm Soil Chemistry
        if any(w in q_lower for w in ["soil", "npk", "ph", "nitrogen", "fertilizer", "உரம்", "மண்"]):
            if farm and farm.soil:
                tools_executed.append("get_farm_soil")
                tool_results.append({
                    "tool": "get_farm_soil",
                    "farm_name": farm.name,
                    "soil_type": farm.soil.soil_type,
                    "ph": float(farm.soil.ph) if farm.soil.ph is not None else None,
                    "nitrogen": float(farm.soil.nitrogen_n) if farm.soil.nitrogen_n is not None else None,
                    "phosphorus": float(farm.soil.phosphorus_p) if farm.soil.phosphorus_p is not None else None,
                    "potassium": float(farm.soil.potassium_k) if farm.soil.potassium_k is not None else None,
                })

        # Tool 3: Active Cultivation Cycle & Tasks
        if any(w in q_lower for w in ["crop", "cycle", "task", "stage", "harvest", "பயிர்", "அறுவடை", "வேலை"]):
            if farm:
                cycles = db.query(CultivationCycle).filter(
                    CultivationCycle.farm_id == farm.id,
                    CultivationCycle.status == "IN_PROGRESS"
                ).all()
                if cycles:
                    cycle = cycles[0]
                    tools_executed.append("get_cultivation_status")
                    tool_results.append({
                        "tool": "get_cultivation_status",
                        "crop_name": cycle.crop.name if cycle.crop else "Unknown",
                        "crop_tamil_name": cycle.crop.tamil_name if cycle.crop else "",
                        "start_date": str(cycle.start_date),
                        "expected_harvest_date": str(cycle.expected_harvest_date),
                        "pending_tasks": [
                            {"title": t.title, "due": str(t.due_date), "stage": t.stage_name}
                            for t in cycle.tasks if t.status == "PLANNED"
                        ][:3]
                    })

        return tools_executed, tool_results

    @classmethod
    def clean_special_characters_and_tables(cls, text: str) -> str:
        """Converts raw markdown tables, pipe characters, excessive asterisks, and special characters into clean, fluent sentences."""
        if not text:
            return ""

        lines = text.split("\n")
        cleaned_lines = []

        for line in lines:
            trimmed = line.strip()
            # Skip markdown table divider lines like |---|---| or |:---:|
            if re.match(r"^\|?[\s\-:]+(\|[\s\-:]+)+\|?$", trimmed):
                continue

            # If line is a markdown table row with pipes like | Col 1 | Col 2 | Col 3 |
            if "|" in trimmed:
                cells = [c.strip() for c in trimmed.split("|") if c.strip()]
                if cells:
                    clean_cells = [re.sub(r"[\*#`_~]", "", c).strip() for c in cells]
                    if len(clean_cells) == 1:
                        cleaned_lines.append(clean_cells[0])
                    elif len(clean_cells) == 2:
                        cleaned_lines.append(f"{clean_cells[0]}: {clean_cells[1]}")
                    elif len(clean_cells) >= 3:
                        main_point = clean_cells[0]
                        details = ", ".join(clean_cells[1:])
                        cleaned_lines.append(f"{main_point}: {details}")
                continue

            # Remove excessive markdown asterisks (** or *)
            clean_line = re.sub(r"\*+", "", line)
            # Remove markdown header hashes (### or ##)
            clean_line = re.sub(r"^#+\s*", "", clean_line)
            # Remove backticks, pipes, tildes
            clean_line = clean_line.replace("`", "").replace("|", "").replace("~", "")

            cleaned_lines.append(clean_line)

        result = "\n".join(cleaned_lines)
        result = re.sub(r"\n{3,}", "\n\n", result)
        return result.strip()

    @classmethod
    async def call_openrouter(
        cls,
        user_message: str,
        conversation_history: List[Dict[str, str]],
        tool_results: List[Dict[str, Any]],
        language: str = "en"
    ) -> str:
        """Call OpenRouter API with Nemotron-3 model and agronomic system prompt."""
        system_instruction = (
            "You are the senior agronomist and chief agricultural intelligence AI for 'AgriAssist'. "
            "Your tagline is 'Your Farm. Your Data. Smarter Decisions.' "
            "You provide actionable, scientifically sound, and practical advice for modern farmers. "
            "You support English and Tamil (தமிழ்). If the user writes in Tamil or asks in Tamil, reply in Tamil. "
            "If they write in Tanglish (Tamil written in English script), reply in clear Tanglish or Tamil with English names. "
            "\nCRITICAL FORMATTING INSTRUCTIONS:\n"
            "1. Reply ONLY in clean, continuous natural language sentences and short paragraphs.\n"
            "2. DO NOT use markdown tables. NEVER use vertical pipe characters (|) or ASCII grids.\n"
            "3. DO NOT use special characters, asterisks (**), or hashtag headers (###).\n"
            "4. Express recommendations in clear, simple spoken sentences so it sounds natural when read aloud by the voice assistant.\n"
            "5. Number your points with simple numbers like 1., 2., 3. followed by complete sentences.\n"
            "Never hallucinate chemicals; prefer IPM (Integrated Pest Management) and balanced organic + inorganic fertility."
        )

        # Append tool context if available
        if tool_results:
            system_instruction += "\n\nReal Farm Context Retrieved via Database Tools:\n"
            for tr in tool_results:
                system_instruction += f"- {tr['tool']}: {tr}\n"

        messages = [{"role": "system", "content": system_instruction}]
        # Add past 4 messages for conversational context
        for msg in conversation_history[-4:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        api_key = settings.OPENROUTER_API_KEY
        if not api_key:
            raw = cls._fallback_response(user_message, language, tool_results)
            return cls.clean_special_characters_and_tables(raw)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "https://agriassist.farm",
            "X-Title": "AgriAssist AI Agriculture Platform",
            "Content-Type": "application/json"
        }

        payload = {
            "model": settings.OPENROUTER_MODEL,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 800
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)

            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                return cls.clean_special_characters_and_tables(content)
            else:
                raw = cls._fallback_response(user_message, language, tool_results)
                return cls.clean_special_characters_and_tables(raw)
        except Exception:
            raw = cls._fallback_response(user_message, language, tool_results)
            return cls.clean_special_characters_and_tables(raw)

    @classmethod
    def _fallback_response(cls, query: str, language: str, tool_results: List[Dict[str, Any]]) -> str:
        """High-grade agricultural rule-based response when offline or rate-limited."""
        q_lower = query.lower()

        if language == "ta" or any(t in q_lower for t in ["தக்காளி", "உரம்", "பூச்சி", "மண்"]):
            if "தக்காளி" in q_lower or "tomato" in q_lower:
                return (
                    "**தக்காளி பயிருக்கான வேளாண் ஆலோசனை:**\n\n"
                    "• **பூக்கும் பருவம் (Flowering):** பூக்கள் உதிர்வதைத் தடுக்க போரான் (Solubor 1 கிராம்/லிட்டர்) தெளிக்கவும்.\n"
                    "• **காய் வளர்ச்சி (Fruit Setting):** அடி அழுகல் நோய் (Blossom End Rot) வராமல் தடுக்க கால்சியம் நைட்ரேட் (Calcium Nitrate @ 2.5 கிலோ/ஏக்கர்) சொட்டுநீர் மூலம் இடவும்.\n"
                    "• **பரிந்துரைக்கப்படும் நீர் பாசனம்:** அதிகாலையில் மட்டும் பாசனம் செய்யவும்; இலைகளில் ஈரம் தங்காமல் பார்த்துக் கொள்ளவும்."
                )
            return (
                "**AgriAssist வேளாண் ஆலோசனை:**\n\n"
                "• மண் பரிசோதனை முடிவுகளின் அடிப்படையில் சமச்சீர் ஊட்டச்சத்து (NPK) இடவும்.\n"
                "• மழை வாய்ப்புள்ள நாட்களில் இலைவழி மருந்து தெளிப்பதை தவிர்க்கவும்.\n"
                "• இயற்கை பூச்சி விரட்டியாக வேப்பெண்ணெய் கரைசல் (Neem oil 5 மிலி/லிட்டர்) தெளிப்பது சிறந்தது."
            )

        # English Fallback
        if "tomato" in q_lower:
            return (
                "**Agronomic Guidance for Tomato Cultivation:**\n\n"
                "• **Flowering Stage:** Apply foliar spray of Boron (Solubor @ 1 g/L) at 50% flowering to enhance fruit set and prevent blossom drop.\n"
                "• **Fruit Expansion:** Deliver Calcium Nitrate (@ 2.5 kg/acre) via drip fertigation to prevent Blossom End Rot (BER).\n"
                "• **Irrigation:** Maintain steady soil moisture; avoid drastic wet-to-dry swings which trigger fruit cracking."
            )
        elif "weather" in q_lower and tool_results:
            w = next((tr for tr in tool_results if tr["tool"] == "get_current_weather"), None)
            if w:
                return (
                    f"**Microclimate Weather Intelligence for {w.get('location')}:**\n\n"
                    f"• **Current Condition:** {w.get('condition')} with temperature of {w.get('temperature')}°C.\n"
                    f"• **Wind & Humidity:** Wind speed is {w.get('wind_speed')} m/s and humidity is {w.get('humidity')}%.\n"
                    f"• **Advisory:** {w.get('advisory')}"
                )

        return (
            "**AgriAssist Agronomic Advisory:**\n\n"
            "• **Nutrient Management:** Follow targeted split applications of nitrogen and potassium based on current crop phenology.\n"
            "• **Water Control:** Avoid over-irrigation during humid overcast periods to reduce fungal root-rot risk.\n"
            "• **Pest Protection:** Install yellow sticky traps (10/acre) to monitor whiteflies and thrips before considering chemical sprays."
        )

    @classmethod
    async def process_chat(
        cls,
        db: Session,
        user: User,
        payload: ChatRequest
    ) -> ChatResponse:
        # 1. Strict Agricultural Domain Guardrail Check
        if not cls.is_agricultural_query(payload.message):
            guardrail_text = cls.get_guardrail_response(payload.language or "en")
            # If conversation exists, record it
            conv_id = payload.conversation_id
            if not conv_id:
                conv = AIConversation(user_id=user.id, title="Agricultural Consultation")
                db.add(conv)
                db.commit()
                db.refresh(conv)
                conv_id = conv.id

            farmer_msg = AIMessage(conversation_id=conv_id, sender="farmer", content=payload.message)
            ai_msg = AIMessage(conversation_id=conv_id, sender="ai", content=guardrail_text)
            db.add_all([farmer_msg, ai_msg])
            db.commit()
            db.refresh(ai_msg)

            return ChatResponse(
                conversation_id=conv_id,
                message=MessageSchema.model_validate(ai_msg),
                is_guardrail_triggered=True,
                tools_executed=[]
            )

        # 2. Retrieve or Create Conversation Thread
        conv = None
        if payload.conversation_id:
            conv = db.query(AIConversation).filter(
                AIConversation.id == payload.conversation_id,
                AIConversation.user_id == user.id
            ).first()

        if not conv:
            title = payload.message.strip()[:45] + ("..." if len(payload.message) > 45 else "")
            conv = AIConversation(user_id=user.id, title=title)
            db.add(conv)
            db.commit()
            db.refresh(conv)

        # Save farmer's question
        farmer_msg = AIMessage(conversation_id=conv.id, sender="farmer", content=payload.message)
        db.add(farmer_msg)
        db.commit()

        # 3. Dynamic Tool Execution (Farm data, Weather, Cultivation)
        tools_executed, tool_results = await cls.execute_agri_tools(
            db=db,
            user=user,
            query=payload.message,
            farm_id=payload.farm_id
        )

        # 4. Fetch past messages for conversational history
        past_msgs = db.query(AIMessage).filter(
            AIMessage.conversation_id == conv.id
        ).order_by(AIMessage.created_at.asc()).all()

        history = [
            {"role": "user" if m.sender == "farmer" else "assistant", "content": m.content}
            for m in past_msgs[:-1]  # Exclude current message
        ]

        # 5. Call LLM (OpenRouter Nemotron-3 or High-Grade Fallback)
        ai_content = await cls.call_openrouter(
            user_message=payload.message,
            conversation_history=history,
            tool_results=tool_results,
            language=payload.language or "en"
        )

        # 6. Save AI Response
        ai_msg = AIMessage(
            conversation_id=conv.id,
            sender="ai",
            content=ai_content,
            tool_calls=[{"tool": t} for t in tools_executed] if tools_executed else None,
            tool_results=tool_results if tool_results else None
        )
        db.add(ai_msg)
        conv.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(ai_msg)

        return ChatResponse(
            conversation_id=conv.id,
            message=MessageSchema.model_validate(ai_msg),
            is_guardrail_triggered=False,
            tools_executed=tools_executed
        )

    @classmethod
    def list_conversations(cls, db: Session, user: User) -> List[ConversationSummary]:
        convs = db.query(AIConversation).filter(
            AIConversation.user_id == user.id
        ).order_by(AIConversation.updated_at.desc()).all()

        return [
            ConversationSummary(
                id=c.id,
                title=c.title,
                created_at=c.created_at,
                updated_at=c.updated_at,
                message_count=len(c.messages)
            )
            for c in convs
        ]

    @classmethod
    def get_conversation(cls, db: Session, conversation_id: int, user: User) -> ConversationResponse:
        conv = db.query(AIConversation).filter(
            AIConversation.id == conversation_id
        ).first()

        if not conv:
            raise NotFoundException(f"Conversation with id {conversation_id} not found.")

        if conv.user_id != user.id:
            raise ForbiddenException("You do not have permission to view this conversation.")

        return ConversationResponse(
            id=conv.id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            messages=[MessageSchema.model_validate(m) for m in conv.messages]
        )

    @classmethod
    def delete_conversation(cls, db: Session, conversation_id: int, user: User) -> None:
        conv = db.query(AIConversation).filter(
            AIConversation.id == conversation_id
        ).first()

        if not conv:
            raise NotFoundException(f"Conversation with id {conversation_id} not found.")

        if conv.user_id != user.id:
            raise ForbiddenException("You do not have permission to delete this conversation.")

        db.delete(conv)
        db.commit()
