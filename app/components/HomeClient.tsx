"use client";

import "@/app/utils/initFirebase";
import { encode } from "@nem035/gpt-3-encoder";
import { UserInfo, getAuth, signOut } from "firebase/auth";
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isWhitelisted } from "../utils/whitelist";

interface Chat {
  user: string;
  prompt: string;
}

const MAX_TOKEN = 4096;

export default function HomeClient() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<UserInfo | null>();
  const [idToken, setIdToken] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [rows, setRows] = useState(1);

  useEffect(() => {
    const auth = getAuth();
    auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified && isWhitelisted(user.email || "")) {
        setAuthUser(user);
        user.getIdToken(true).then((idToken) => {
          if (idToken) {
            setAuthLoading(false);
            setIdToken(idToken);
          }
        });
      } else {
        window.location.replace("/login");
      }
    });
  }, []);

  const generate = useCallback(
    async (promptText: string) => {
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
          content: promptText,
        },
      ];

      let tokenOk = false;
      let finalPayload = [];

      let tokenCount = 0;
      for (let i = payload.length - 1; i >= 0; i--) {
        tokenCount += encode(payload[i].content).length;
        tokenOk = tokenCount < MAX_TOKEN;
        if (tokenOk) {
          finalPayload.push(payload[i]);
        } else {
          console.warn("Token limit reached: ", tokenCount);
          break;
        }
      }
      finalPayload.reverse();

      try {
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
          window.scrollTo(0, document.body.scrollHeight);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [chats, prompt, idToken]
  );

  const handleChange = useCallback((e: any) => {
    setPrompt(e.target.value);
    let numberOfLineBreaks = (e.target.value.match(/\n/g) || []).length;
    setRows(numberOfLineBreaks || 1);
  }, []);

  const handleSubmit = useCallback(
    (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      generate(prompt);
      setPrompt("");
    },
    [prompt, generate]
  );

  const handleKey = useCallback(
    (evt: KeyboardEvent<HTMLTextAreaElement>) => {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        generate(prompt);
        setPrompt("");
      }
    },
    [prompt, generate]
  );

  const logout = useCallback(() => {
    signOut(getAuth());
  }, []);

  return (
    <div className="flex flex-col px-3 lg:px-0 mb-16 lg:mb-36">
      <h1 className="font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-cyan-400 to-green-600">
        NextGPT
      </h1>

      {authLoading ? (
        <div className="mt-1">
          <div className="max-w-sm w-full">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="space-y-3">
                  <div className="h-5 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-1 flex flex-row justify-between">
            <div>Welcome, {authUser?.displayName}</div>
            <a
              href="#"
              onClick={logout}
              className="text-blue-300 hover:underline text-sm"
            >
              Logout
            </a>
          </div>
          <div className="my-5">
            {chats.map((chat, i) => (
              <div
                className={`px-3 py-2 rounded ${
                  chat.user === "bot"
                    ? "bg-gray-800 text-gray-300 mt-0"
                    : "bg-gray-900 mt-3"
                }`}
                key={i}
              >
                {/* eslint-disable */}
                <ReactMarkdown
                  children={chat.prompt}
                  remarkPlugins={[remarkGfm]}
                />
              </div>
            ))}
          </div>
          <form noValidate onSubmit={handleSubmit}>
            <div className="flex justify-center items-end px-3 fixed pb-4 lg:pb-5 bottom-0 left-0 right-0 lg:px-0">
              <textarea
                className="px-4 py-3 bg-gray-700 text-gray-50 w-full lg:w-2/4 rounded rounded-r-none"
                rows={rows}
                style={{
                  maxHeight: "200px",
                  resize: "none",
                }}
                placeholder="Input your prompt"
                onChange={handleChange}
                onKeyDown={handleKey}
                value={prompt}
                disabled={loading}
              ></textarea>
              <button
                type="submit"
                className="px-5 h-12 py-0 bg-gray-800 font-bold rounded rounded-l-none text-gray-100 text-2xl hover:bg-gray-600 disabled:bg-gray-500"
                disabled={loading || !prompt}
              >
                {">"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
