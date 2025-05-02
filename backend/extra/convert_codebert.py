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
    (inputs["input_ids"], inputs["attention_mask"]),
    "codebert.onnx",
    input_names=["input_ids", "attention_mask"],
    output_names=["last_hidden_state"],
    dynamic_axes={"input_ids": {0: "batch_size"}, "attention_mask": {0: "batch_size"}},
    opset_version=11
)
