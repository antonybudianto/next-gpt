"use client";

import { useCallback, useState } from "react";

export default function HomeClient() {
  const [output, setOutput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (promptText: string) => {
    setOutput("");
    setLoading(true);
    try {
      const response = await fetch("/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptText,
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      // This data is a ReadableStream
      const data = response.body;
      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setOutput((prev) => prev + chunkValue);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = useCallback((e: any) => {
    setPrompt(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    generate(prompt);
  }, [prompt]);

  return (
    <div className="flex flex-col">
      <h1 className="font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-cyan-400 to-green-600">
        ChatGPT
      </h1>
      <textarea
        className="px-3 py-2 mt-5"
        placeholder="Input your prompt"
        onChange={handleChange}
        value={prompt}
        disabled={loading}
      ></textarea>
      <button
        type="button"
        className="px-2 py-3 bg-gray-900 mt-3 disabled:bg-gray-600"
        onClick={handleSubmit}
        disabled={loading}
      >
        Send
      </button>
      <div className="mt-20">{output}</div>
    </div>
  );
}
