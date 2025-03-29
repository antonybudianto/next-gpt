import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  content: string | Array<Record<string, unknown>>;
  role: "user" | "assistant";
  isLoading?: boolean;
  userName?: string;
}

const ChatMessage = ({
  content,
  role,
  isLoading = false,
  userName = "Guest",
}: ChatMessageProps) => {
  return (
    <div
      className={`chat-message py-6 ${
        role === "assistant" ? "bg-gray-950" : ""
      }`}
    >
      <div
        className={`max-w-3xl mx-auto flex gap-4 px-4 md:px-0 ${
          role === "user" ? "flex-row-reverse" : ""
        }`}
      >
        <Avatar className="h-8 w-8 mt-1">
          {role === "user" ? (
            <AvatarFallback className="bg-indigo-900">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          ) : (
            <AvatarImage src="/icons/favicon-32x32.png" alt="Assistant" />
          )}
        </Avatar>

        <div
          className={`chat-message-content ${
            role === "user"
              ? "bg-indigo-900 text-white rounded-lg p-3 max-w-[80%]"
              : "flex-1"
          }`}
        >
          {isLoading && content === "..." ? (
            <div className="animate-pulse h-4 w-8 bg-gray-700 rounded"></div>
          ) : (
            <ReactMarkdown
              children={
                typeof content === "object"
                  ? `${(content[0] as any).text as string}
                    ![Image](${(content[1] as any).image_url.url as string})
                    `
                  : (content as string)
              }
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
      </div>
    </div>
  );
};

export default ChatMessage;
