import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Chat } from "../type";
import { encode } from "@nem035/gpt-3-encoder";
import { getAuth } from "firebase/auth";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaInfoCircle, FaRegComment, FaStopCircle } from "react-icons/fa";

const MAX_TOKEN = 4096;

interface HomeChatProps {
  convId: string;
  convChats: Chat[];
  prompt: string;
  loading: boolean;
  setPrompt: (str: string) => void;
  setLoading: (bool: boolean) => void;
  onSubmit: (prompt: string) => void;
  onDone: (chats: Chat[]) => void;
}

export default function HomeChat({
  convId,
  convChats,
  prompt,
  loading,
  setPrompt,
  setLoading,
  onSubmit,
  onDone,
}: HomeChatProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [rows, setRows] = useState(1);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array>>();

  useEffect(() => {
    setChats([...convChats]);
  }, [convChats]);

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

      const idToken = (await getAuth().currentUser?.getIdToken()) || "";

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
          window.scrollTo(0, document.body.scrollHeight);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [chats, prompt, onDone, setLoading]
  );

  const handleSubmit = useCallback(
    (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(prompt);
      generate(prompt);
      setPrompt("");
    },
    [prompt, generate, onSubmit, setPrompt]
  );
  const handleChange = useCallback(
    (e: any) => {
      setPrompt(e.target.value);
      let numberOfLineBreaks = (e.target.value.match(/\n/g) || []).length;
      setRows(numberOfLineBreaks || 1);
    },
    [setPrompt]
  );

  const handleKey = useCallback(
    (evt: KeyboardEvent<HTMLTextAreaElement>) => {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        onSubmit(prompt);
        generate(prompt);
        setPrompt("");
      }
    },
    [prompt, generate, onSubmit, setPrompt]
  );

  const handleStop = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
    }
  }, []);

  return (
    <>
      <div className="mb-5">
        {chats.map((chat, i) => (
          <div
            className={`overflow-auto px-3 py-2 rounded ${
              chat.user === "bot"
                ? "bg-gray-800 text-gray-300 mt-0"
                : "bg-gray-900 mt-3"
            }`}
            key={i}
          >
            {!(loading && i === chats.length - 1) &&
            chat.user === "bot" &&
            chat.prompt.indexOf("```") !== -1 &&
            /reply with markdown format/i.test(chats[0].prompt) ? (
              <>
                <iframe
                  src={`https://codesandbox.io/embed/tailwind-preview-ghzd6l?autoresize=1&fontsize=14&codemirror=1&hidenavigation=1&theme=dark&view=preview&initialpath=/?hx=${encodeURIComponent(
                    (chat.prompt.match(/`{3}([^`]*)`{3}/g) || [])
                      .map((s) =>
                        s.replace(/```/g, "").replace(/^(html|markdown)/, "")
                      )
                      .join("")
                      .replace(/\n/g, "")
                      .replace(/\#/g, "!!") // hash cannot be send over as a query param
                  )}`}
                  style={{
                    width: "100%",
                    height: "50vh",
                  }}
                  className="rounded w-full overflow-none rounded-md"
                  title="tailwind-preview"
                  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                ></iframe>
                <div className="flex items-center px-3 py-2 rounded bg-cyan-900 border-cyan-50 border-1">
                  <FaInfoCircle />{" "}
                  <span className="ml-2">Code Preview is still in Beta</span>
                </div>
              </>
            ) : (
              <ReactMarkdown
                children={chat.prompt}
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, "")}
                        // @ts-ignore
                        style={dracula}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            )}
          </div>
        ))}
      </div>
      <form noValidate onSubmit={handleSubmit}>
        <div className="flex justify-center items-end px-3 pb-3 pt-2 backdrop-blur-lg fixed bottom-0 left-0 right-0 lg:pb-5 lg:px-0">
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
          {loading ? (
            <button
              type="button"
              title="Stop generating"
              className="animate-pulse px-5 h-12 py-0 bg-cyan-800 font-bold rounded rounded-l-none text-gray-100 text-2xl hover:bg-gray-600 disabled:bg-gray-500"
              onClick={handleStop}
            >
              <FaStopCircle />
            </button>
          ) : (
            <button
              type="submit"
              title="Send chat"
              className="px-5 h-12 py-0 bg-gray-800 font-bold rounded rounded-l-none text-gray-100 text-2xl hover:bg-gray-600 disabled:bg-gray-500"
              disabled={loading || !prompt}
            >
              <FaRegComment />
            </button>
          )}
        </div>
      </form>
    </>
  );
}
