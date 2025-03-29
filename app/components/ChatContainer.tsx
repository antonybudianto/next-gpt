import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Chat } from "../type";
import { getAuth } from "firebase/auth";
import { encode } from "gpt-tokenizer";

interface ChatContainerProps {
  convId: string;
  convChats: Chat[];
  loading: boolean;
  setLoading: (bool: boolean) => void;
  prompt: string;
  setPrompt: (str: string) => void;
  onDone: (chats: Chat[]) => void;
  onSubmit: (prompt: string | Array<Record<string, unknown>>) => void;
  userName?: string;
}

const ChatContainer = ({
  convId,
  convChats,
  loading,
  setLoading,
  prompt,
  setPrompt,
  onDone,
  onSubmit,
  userName = "Guest",
}: ChatContainerProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array>>();
  const [img, setImg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChats([...convChats]);
  }, [convChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const generate = useCallback(
    async (promptText: string) => {
      const finalContent = !img
        ? promptText
        : [
            {
              type: "text",
              text: promptText,
            },
            {
              type: "image_url",
              image_url: { url: img },
            },
          ];
      setLoading(true);
      if (img) {
        setImg("");
      }
      setChats((_chats) => {
        return [
          ..._chats,
          { user: "user", prompt: finalContent as string },
          { user: "bot", prompt: "..." },
        ];
      });

      try {
        /**
         * To give context to the API
         */
        const assistances = chats.map((_chat) => {
          return {
            role: _chat.user === "bot" ? "assistant" : "user",
            content: _chat.prompt,
          };
        });

        let payload = [
          ...assistances,
          {
            role: "user",
            content: finalContent,
          },
        ];

        let tokenOk = false;
        let finalPayload = [];

        let tokenCount = 0;
        for (let i = payload.length - 1; i >= 0; i--) {
          // @ts-ignore
          tokenCount += encode(
            // @ts-ignore
            typeof payload[i].content === "string"
              ? payload[i].content
              : JSON.stringify(payload[i].content)
          ).length;
          tokenOk = tokenCount < 128000; // MAX_TOKEN
          if (tokenOk) {
            finalPayload.push(payload[i]);
          } else {
            console.warn("Token limit reached: ", tokenCount);
            finalPayload.push(payload[i]);
            break;
          }
        }
        finalPayload.reverse();

        const idToken = (await getAuth().currentUser?.getIdToken()) || "";

        const response = await fetch("/api/gpt", {
          method: "POST",
          headers: {
            "X-Idtoken": idToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: finalPayload,
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
        readerRef.current = reader;

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
            const _finalChats = [
              ..._chats.slice(0, _chats.length - 1),
              lastChat,
            ];
            if (done) {
              onDone(_finalChats);
            }
            return _finalChats;
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [chats, onDone, setLoading, img]
  );

  const handleSubmit = useCallback(() => {
    if (!prompt.trim()) return;
    onSubmit(prompt);
    generate(prompt);
    setPrompt("");
  }, [prompt, generate, onSubmit, setPrompt]);

  const handleStop = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
    }
  }, []);

  const handleImageSelected = useCallback((imageUrl: string) => {
    setImg(imageUrl);
  }, []);

  // If there are no chats, show a welcome message
  if (chats.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold mb-8">What can I help with?</h1>
        </div>
        <div className="sticky bottom-0 left-0 right-0">
          <ChatInput
            prompt={prompt}
            loading={loading}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            onStop={handleStop}
            onImageSelected={handleImageSelected}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-32px)]">
      <div className="flex-1 overflow-y-auto pt-4 pb-4">
        <div className="flex flex-col py-10">
          {chats.map((chat, i) => (
            <ChatMessage
              key={i}
              content={chat.prompt}
              role={chat.user === "user" ? "user" : "assistant"}
              isLoading={
                loading && i === chats.length - 1 && chat.user === "bot"
              }
              userName={userName}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="sticky bottom-0 left-0 right-0">
        <ChatInput
          prompt={prompt}
          loading={loading}
          setPrompt={setPrompt}
          onSubmit={handleSubmit}
          onStop={handleStop}
          onImageSelected={handleImageSelected}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
