import onnxruntime as ort
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
session = ort.InferenceSession("onnx-models/codebert/model.onnx")

inputs = tokenizer("def hello():\n    print('Hello')", return_tensors="np")
outputs = session.run(None, dict(inputs))
print(outputs)
