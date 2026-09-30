# 🌾 IEEE Research Papers for Agriculture AI Agent

## Research Foundation

This README summarizes **10 IEEE research papers** relevant to our proposed **software-based, multimodal, multi-agent Agriculture AI Agent**.

### Project Focus

- Multi-Agent AI
- LLM-based orchestration
- Agricultural decision-making
- Crop recommendation
- Disease detection
- Weather-based decisions
- Fertilizer recommendation
- Irrigation planning
- Market information
- Explainable AI
- Multimodal farmer interaction

### Excluded

- ❌ IoT / Sensors
- ❌ UAV / Drones
- ❌ Physical hardware
- ❌ Wireless sensor networks
- ❌ MQTT hardware communication
- ❌ RAG

---

# 📚 10 Relevant IEEE Research Papers

## 1. AgriMAS

**Title:** Relative Benefits of a Multi-Agent System Framework for Waste Reduction in Precision Agriculture

**Conference:** IEEE IC-AIDA 2026  
**DOI:** `10.1109/IC-AIDA68291.2026.11564402`

### Abstract

AgriMAS proposes a modular multi-agent AI framework for agricultural diagnosis and decision-making. Specialized agents perform data acquisition, preprocessing, feature synthesis, classification, error correction, and interpretability.

### Algorithms

- Multi-Agent System
- ResNet50
- VGG16
- DenseNet
- SHAP
- Grad-CAM
- Feature Synthesis

### Project Use

**Disease Agent + Explainable AI + Multi-Agent Architecture**

---

# 2. Interactive AI Training Agent for Tomato Farmers

**Title:** Interactive AI Training Agent for Tomato Farmers: A GenAI and LLM Driven Approach to Agriculture 4.0

**Conference:** IEEE ICECIT 2025  
**DOI:** `10.1109/ICECIT67774.2025.11451172`

### Abstract

This research proposes an AI training agent for farmers using text, voice, and image interaction. It combines Generative AI, LLMs, computer vision, disease detection, and agricultural prediction.

### Algorithms

- LLM
- Generative AI
- Computer Vision
- Image Classification
- Multimodal AI
- Autonomous Agents

### Project Use

**LLM + Voice/Text/Image Interaction + Disease Agent**

> The original paper uses RAG, but RAG is **excluded from our project**.

---

# 3. AMAI-PF

**Title:** Agentic Multi-Agent Intelligence for Precision Farming

**Conference:** IEEE AIEI 2026  
**DOI:** `10.1109/AIEI69164.2026.11496776`

### Abstract

AMAI-PF presents an agentic multi-agent framework using reinforcement learning for adaptive precision-farming coordination. Autonomous agents perform specialized tasks and coordinate their decisions.

### Algorithms

- Multi-Agent Reinforcement Learning
- Q-Learning
- Decentralized Coordination
- Autonomous Agents

### Project Use

**Agent Coordination + Adaptive Decision-Making**

### Excluded

- Sensor networks
- Network routing
- NS-2
- Hardware infrastructure

---

# 4. MARbLE

**Title:** MARbLE: Multi-Agent Reinforcement Learning at the Edge for Digital Agriculture

**Conference:** IEEE/ACM SEC 2022  
**DOI:** `10.1109/SEC54971.2022.00013`

### Abstract

MARbLE provides a platform for developing and managing autonomous agricultural agent swarms using multi-agent reinforcement learning.

### Algorithms

- Multi-Agent Reinforcement Learning
- Reinforcement Learning
- Task Mapping
- Evaluation Functions
- Load Balancing

### Project Use

**Agent Orchestration + Task Management**

### Excluded

- UAV / Drone
- Edge hardware
- Physical swarm deployment

---

# 5. PollenNet

**Title:** Optimizing Artificial Pollination in Indian Agriculture through Multi-Agent Reinforcement Learning and Generative AI for Precision Pollen Distribution

**Conference:** IEEE ICAIQSA 2025  
**DOI:** `10.1109/ICAIQSA67794.2025.11440598`

### Abstract

PollenNet applies multi-agent reinforcement learning and generative AI to coordinate agricultural pollination decisions. The research demonstrates how multiple agents can cooperate to optimize complex agricultural tasks.

### Algorithms

- Multi-Agent Reinforcement Learning
- Generative AI
- GAN
- Optimization

### Project Use

**Multi-Agent Optimization**

### Excluded

- Physical pollination equipment
- Hardware infrastructure

---

# 6. Digital Farmer Agents

**Title:** The Digital Farmer Agents in Precise and Sustainable Agricultural Ecosystems

**Conference:** IEEE FLLM 2025  
**DOI:** `10.1109/FLLM67465.2025.11391213`

### Abstract

Digital Farmer Agents use goal-oriented planning to combine agricultural information for decision-making. The system supports irrigation, fertilization, pest management, crop rotation, optimization, explainability, and re-planning.

### Algorithms

- Goal-Based Planning
- Multi-Agent Planning
- Optimization
- Digital Twin
- What-If Analysis
- Explainable AI
- Re-Planning

### Project Use

**Decision Agent + Irrigation + Fertilizer + Monitoring + Re-Planning**

---

# 7. Agentic Spectrum-Conscious Architecture

**Title:** Agentic, Spectrum-Conscious Architecture for Smart Farming Connectivity

**IEEE Document:** `11448879`

### Abstract

This research proposes an agentic architecture for smart-farming environments using intelligent agents, multi-layer coordination, and orchestration.

### Techniques

- Intelligent Agents
- Agent Coordination
- Multi-Layer Orchestration
- Optimization
- Decision-Making

### Project Use

**Farm Orchestrator + Multi-Layer Architecture**

### Excluded

- Spectrum Management
- Wireless Infrastructure
- IoT Hardware
- Communication Hardware

---

# 8. Multi-Agent Collaborative Agricultural Decision-Making

**Title:** A Multi-Agent Collaborative Method for Agricultural Decision-Making

**Conference:** IEEE EIBDCT 2026  
**DOI:** `10.1109/EIBDCT69742.2026.11566787`

### Abstract

This research uses LLMs to understand and decompose agricultural tasks. Dynamic scheduling assigns appropriate agents to subtasks, while a cross-agent pipeline exchanges information and integrates results.

### Algorithms

- LLM
- Task Decomposition
- Dynamic Agent Scheduling
- Multi-Agent Collaboration
- Cross-Agent Data Pipeline
- Result Integration

### Project Use

**Farm Orchestrator**

### Proposed Flow

```text
Farmer Question
       ↓
LLM Task Understanding
       ↓
Task Decomposition
       ↓
Dynamic Agent Selection
       ↓
Crop / Weather / Disease / Market Agents
       ↓
Decision Agent
       ↓
Final Recommendation
