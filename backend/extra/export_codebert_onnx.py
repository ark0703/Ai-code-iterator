import os
from pathlib import Path
from transformers import AutoTokenizer, AutoModel
from transformers.onnx import FeaturesManager, export
from transformers.onnx.features import Feature
import torch
import logging

# Optional: enable logging
logging.basicConfig(level=logging.INFO)

# Model to export
model_id = "microsoft/codebert-base"

# Export path
onnx_path = Path("onnx-models/codebert")
onnx_path.mkdir(parents=True, exist_ok=True)

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModel.from_pretrained(model_id)

# Choose the proper ONNX config
feature = "default"  # or Feature.TEXT_EMBEDDING if you want only embeddings
model_kind, model_onnx_config = FeaturesManager.check_supported_model_or_raise(model, feature=feature)
onnx_config = model_onnx_config(model.config)

# Dummy input for export (tokenizer_args)
dummy_text = "def hello_world():\n    print('Hello World')"
tokenized = tokenizer(dummy_text, return_tensors="pt")

# Export the model
export(
    preprocessor=tokenizer,
    model=model,
    config=onnx_config,
    opset=13,
    output=onnx_path / "model.onnx",
    tokenizer_args=(dummy_text,)
)

print(f"✅ CodeBERT has been exported to: {onnx_path / 'model.onnx'}")
