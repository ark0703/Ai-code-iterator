import { useEffect, useState } from "react";
import { pipeline } from "@xenova/transformers";

export default function CodeAssistant() {
  const [output, setOutput] = useState(null);

  useEffect(() => {
    (async () => {
      const classifier = await pipeline(
        "fill-mask",
        "Xenova/bert-base-uncased"
      );
      const result = await classifier("The capital of France is [MASK].");
      setOutput(result);
    })();
  }, []);

  return (
    <div>
      <h1>Model Output</h1>
      <pre>{JSON.stringify(output, null, 2)}</pre>
    </div>
  );
}
