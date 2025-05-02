from transformers import RobertaTokenizer, RobertaModel
import torch

model = RobertaModel.from_pretrained("microsoft/codebert-base")
tokenizer = RobertaTokenizer.from_pretrained("microsoft/codebert-base")

# Dummy input
text = "def hello_world():\n    print('Hello, world!')"
inputs = tokenizer(text, return_tensors="pt")

# Export to ONNX
torch.onnx.export(
    model,
    args=(input_ids, attention_mask),
    f="codebert.onnx",
    opset_version=17,  # ← update this
    input_names=["input_ids", "attention_mask"],
    output_names=["last_hidden_state"],
    dynamic_axes={"input_ids": {0: "batch_size", 1: "sequence"}, "attention_mask": {0: "batch_size", 1: "sequence"}},
)

print("✅ Model converted and saved to codebert.onnx")
