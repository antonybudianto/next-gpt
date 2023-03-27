"use client";

import { useCallback, useState } from "react";

export default function HomeClient() {
  const [output, setOutput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (promptText: string) => {
    // e.preventDefault();
    setOutput("");
    setLoading(true);
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
  };

  const handleChange = useCallback((e: any) => {
    setPrompt(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    generate(prompt);
  }, [prompt]);

  return (
    <div className="flex flex-col">
      <textarea
        className="px-3 py-2"
        onChange={handleChange}
        value={prompt}
      ></textarea>
      <button
        type="button"
        className="px-2 py-3 bg-gray-900"
        onClick={handleSubmit}
      >
        Generate
      </button>
      <div className="mt-20">{output}</div>
    </div>
  );
}
