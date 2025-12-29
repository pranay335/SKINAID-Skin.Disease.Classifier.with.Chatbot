from transformers import LlamaForCausalLM, LlamaTokenizer
from peft import PeftModel

BASE_MODEL = "meta-llama/Llama-2-7b-chat-hf"   # Base LLaMA-2
BASE_SAVE_DIR = "models/base_llama2"           # Save base model here
ADAPTER_DIR = "models"                         # Your fine-tuned adapter path

print("⏳ Downloading LLaMA 2 base model from Hugging Face...")
tokenizer = LlamaTokenizer.from_pretrained(BASE_MODEL)
tokenizer.save_pretrained(BASE_SAVE_DIR)
model = LlamaForCausalLM.from_pretrained(BASE_MODEL)
model.save_pretrained(BASE_SAVE_DIR)
print("✅ Base model downloaded successfully!")

print("⏳ Applying fine-tuned adapter...")
model = LlamaForCausalLM.from_pretrained(BASE_SAVE_DIR)
model = PeftModel.from_pretrained(model, ADAPTER_DIR)

prompt = "Hello, how are you?"
inputs = tokenizer(prompt, return_tensors="pt")
outputs = model.generate(**inputs, max_new_tokens=100)
print("\n🧠 Model output:\n")
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
