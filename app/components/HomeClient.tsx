"use client";

import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Chat {
  user: string;
  prompt: string;
}

export default function HomeClient() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  const generate = async (promptText: string) => {
    setLoading(true);
    setChats((_chats) => {
      return [
        ..._chats,
        { user: "user", prompt: prompt },
        { user: "bot", prompt: "..." },
      ];
    });

    /**
     * To give context to the API
     */
    const assistances = chats
      .filter((_chat) => _chat.user === "bot")
      .map((_chat) => {
        return {
          role: "assistant",
          content: _chat.prompt,
        };
      });
    const payload = [
      ...assistances,
      {
        role: "user",
        content: promptText,
      },
    ];

    try {
      const response = await fetch("/api/gpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: payload,
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

        setChats((_chats) => {
          let lastChat = { ..._chats[_chats.length - 1] };
          if (lastChat.prompt === "...") {
            lastChat.prompt = "";
          }
          lastChat.prompt += chunkValue;
          return [..._chats.slice(0, _chats.length - 1), lastChat];
        });
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
      <div className="my-10">
        {chats.map((chat, i) => (
          <div
            className={`px-3 py-2 mt-3 rounded ${
              chat.user === "bot"
                ? "bg-gray-800 text-gray-300 mt-0"
                : "bg-gray-900"
            }`}
            key={i}
          >
            <ReactMarkdown children={chat.prompt} remarkPlugins={[remarkGfm]} />
          </div>
        ))}
      </div>
    </div>
  );
}
