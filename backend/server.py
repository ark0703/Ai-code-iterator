from fastapi import FastAPI
from pydantic import BaseModel
from llama_cpp import Llama
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Loading the Mistral model from local
llm = Llama(
    model_path="F:/models/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
    n_ctx=4096,
    n_threads=8,
    n_batch=512,
    n_gpu_layers=0
)

class PromptRequest(BaseModel):
    prompt: str
    
#this is for the prompt manipulation
context_prefix = (
    "You are an expert in game development and performance optimization. "
    "All responses must be relevant to improving or creating efficient games, including engines like Unity, Unreal, or custom engines. "
    "Provide the suggested Code "
    "Respond with clarity and in technical depth.\n\n"
)

@app.post("/generate")
async def generate_text(req: PromptRequest):
    full_prompt = f"[INST] {context_prefix}{req.prompt} [/INST]"
    print(f"🟢 Prompt: {req.prompt}")

    total_output = ""
    max_rounds = 3  # Avoid infinite loops
    for i in range(max_rounds):
        output = llm(
            full_prompt + total_output,
            max_tokens=1024,
            stop=["# End"],
        )
        chunk = output["choices"][0]["text"]
        print(f"🔹 Round {i+1} Output:\n{chunk}\n")
        total_output += chunk

        if "# End" in chunk or len(chunk.strip()) < 50:
            break

    return {"result": total_output.strip()}

@app.post("/generate-stream")
async def generate_stream(req: PromptRequest):
    full_prompt = f"[INST] {context_prefix}{req.prompt} [/INST]"

    def stream():
        yield "⏳ Generating response...\n"
        output = llm(full_prompt, max_tokens=2048)
        result = output["choices"][0]["text"]

        for line in result.splitlines():
            yield line + "\n"
            time.sleep(0.1)

        yield "\n✅ Done.\n"

    return StreamingResponse(stream(), media_type="text/plain")
