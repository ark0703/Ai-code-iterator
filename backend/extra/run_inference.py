import onnxruntime as ort
from transformers import RobertaTokenizer

tokenizer = RobertaTokenizer.from_pretrained("microsoft/codebert-base")
text = "def greet():\n    print('Hello!')"
inputs = tokenizer(text, return_tensors="np")

session = ort.InferenceSession("codebert.onnx")
outputs = session.run(None, {
    "input_ids": inputs["input_ids"],
    "attention_mask": inputs["attention_mask"]
})

print("✅ Inference output shape:", outputs[0].shape)
