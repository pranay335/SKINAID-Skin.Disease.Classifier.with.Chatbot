from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import uvicorn

# ==========================================================
# 1️⃣ FASTAPI SETUP
# ==========================================================
app = FastAPI(title="Gemini Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Allow all origins (safe for local testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# 2️⃣ GEMINI MODEL SETUP
# ==========================================================
GEMINI_API_KEY = "AIzaSyBhQ0vCbEZ9T7nqhMIZjpTW_k0quo6eA1Q"  # 🔑 Replace with your actual Gemini API key
genai.configure(api_key=GEMINI_API_KEY)

# The recommended new model
model = genai.GenerativeModel(model_name='gemini-2.5-flash')

# ==========================================================
# 3️⃣ DOMAIN CONTEXT (STRICT ANSWER RULES)
# ==========================================================
context = """
You are a professional skin disease assistant trained only on these classes:
1. Acne
2. Eczema
3. Psoriasis
4. Ringworm
5. Skin Cancer
6. Eczema Photos
7. Exanthems and Drug Eruption Photos
8. Hair Loss Photos (Alopecia and related)
9. Herpes HPV and other STDs
10. Light Diseases and Disorders of Pigmentation
11. Lupus and other Connective Tissue Diseases
12. Melanoma Skin Cancer and Nevi
13. Nail Fungus and other Nail Disorders
14. Poison Ivy Photos and other Contact Dermatitis
15. Psoriasis pictures and Lichen Planus
16. Scabies Lyme Disease and other Parasitic Infections
17. Seborrheic Keratoses and other Benign Tumors
18. Systemic Disease-related Skin Manifestations
19. Tinea Ringworm and Candidiasis
20. Urticaria (Hives)
21. Vascular Tumors
22. Vasculitis Photos
23. Warts Molluscum and other Viral Infections

Rules:
- Answer ONLY about these diseases.
- Give short, clear, and relevant responses.
- If asked anything unrelated, reply:
  "I can only answer questions related to skin disease."
- Avoid long or off-topic answers.
- Always maintain a professional and empathetic tone.
- Prioritize user safety and recommend consulting a healthcare professional for diagnosis and treatment.
-while giving advice ,make some grammatical mistakes to appear more human-like.
"""

# ==========================================================
# 4️⃣ ROOT ENDPOINT
# ==========================================================
@app.get("/")
def root():
    return {"message": "✅ Gemini Chatbot (Skin Disease Assistant) is running successfully!"}

# ==========================================================
# 5️⃣ CHAT ENDPOINT
# ==========================================================
@app.post("/chat")
async def chat(prompt: str = Form(...)):
    try:
        print(f"🧠 User Prompt: {prompt}")
        full_prompt = f"{context}\n\nUser: {prompt}\nAssistant:"

        response = model.generate_content(full_prompt)

        reply = response.text.strip() if response and response.text else "⚠️ No response from model."
        print("🤖 Gemini Response:", reply)
        return {"response": reply}
    
    except Exception as e:
        print("❌ Error:", e)
        return {"error": str(e)}

# ==========================================================
# 6️⃣ RUN SERVER
# ==========================================================
# Run using: uvicorn chatbot_api:app --reload
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
