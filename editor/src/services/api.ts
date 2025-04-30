import axios from "axios";

export async function sendPrompt(prompt: string): Promise<string> {
  try {
    const res = await axios.post("http://localhost:8000/generate", { prompt });
    return res.data.result;
  } catch (err) {
    return "Error: " + err;
  }
}

export async function streamMistralOutput(
  prompt: string,
  onUpdate: (text: string) => void
): Promise<string> {
  const res = await fetch("http://localhost:8000/generate-stream", {
    method: "POST",
    body: JSON.stringify({ prompt }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.body) {
    throw new Error("❌ No response body received.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    fullText += chunk;
    onUpdate(fullText);
  }

  // Extract final code if present
  const match = fullText.match(/✅ Done:\n([\s\S]*)$/);
  return match ? match[1].trim() : "";
}
