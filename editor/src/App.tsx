import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { editor as MonacoEditorType } from "monaco-editor";
import * as monaco from "monaco-editor";

const App = () => {
  const [codeOutput, setCodeOutput] = useState("# Your game code here\n");
  const [logOutput, setLogOutput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestedRange, setSuggestedRange] = useState<monaco.IRange | null>(
    null
  );

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleBuild = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    setLogOutput("⏳ Generating code from instruction...\n");

    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      body: JSON.stringify({ prompt: inputValue }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setCodeOutput(data.result);
    setLogOutput("✅ Code generated successfully\n");
    setLoading(false);
  };

  const handleOptimize = async () => {
    const editor = editorRef.current;

    if (!editor) return;

    const model = editor.getModel();
    const selection = editor.getSelection();

    if (!model || !selection) return;

    const selectedText = model.getValueInRange(selection);
    if (!selectedText.trim()) return;

    const userPrompt = window.prompt(
      "What do you want to do with this code?",
      "Optimize this for performance"
    );
    if (!userPrompt || !userPrompt.trim()) return;

    setLoading(true);
    setLogOutput("⏳ Optimizing selected code...\n");

    const res = await fetch("http://localhost:8000/generate", {
      method: "POST",
      body: JSON.stringify({
        prompt: `${userPrompt}\n\n${selectedText}`,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    setLogOutput("✅ Optimized suggestion received.\n");

    setSuggestion(data.result);
    setSuggestedRange(selection);

    setLoading(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "98vw",
        maxWidth: "100vw",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", bottom: 10, right: 10, zIndex: 2 }}>
        <button onClick={() => setShowInput(!showInput)}>+ Build</button>
        {showInput && (
          <div>
            <input
              type="text"
              placeholder="What do you want to build?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button onClick={handleBuild}>Generate</button>
          </div>
        )}
        <button onClick={handleOptimize} style={{ marginLeft: 10 }}>
          Optimize Selected
        </button>
      </div>

      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 5,
          }}
        >
          <h1>🧠 Thinking...</h1>
        </div>
      )}

      <Editor
        height="100%"
        defaultLanguage="python"
        value={codeOutput}
        theme="vs-dark"
        onMount={(editor: MonacoEditorType.IStandaloneCodeEditor) => {
          editorRef.current = editor;
        }}
        options={{
          wordWrap: "on",
          wrappingIndent: "same",
          fontSize: 14,
          minimap: { enabled: false },
        }}
      />

      <div
        style={{
          background: "#111",
          color: "#0f0",
          padding: "1rem",
          height: "200px",
          maxWidth: "100vw",
          overflowY: "scroll",
        }}
      >
        <h3>Logs</h3>
        <pre>{logOutput}</pre>
      </div>
      {suggestion && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "#fff",
            padding: "1rem",
            borderRadius: "8px",
            zIndex: 10,
            width: "80%",
            maxWidth: "600px",
            boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          }}
        >
          <h3>🧠 AI Suggestion</h3>
          <pre
            style={{
              background: "#111",
              padding: "0.5rem",
              maxHeight: "300px",
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {suggestion}
          </pre>
          <div style={{ marginTop: "1rem", textAlign: "right" }}>
            <button
              onClick={() => {
                if (editorRef.current && suggestedRange) {
                  editorRef.current.executeEdits("replace-selection", [
                    {
                      range: suggestedRange,
                      text: suggestion,
                      forceMoveMarkers: true,
                    },
                  ]);
                }
                setSuggestion(null);
                setSuggestedRange(null);
              }}
              style={{ marginRight: 10 }}
            >
              ✅ Integrate
            </button>
            <button onClick={() => setSuggestion(null)}>❌ Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
