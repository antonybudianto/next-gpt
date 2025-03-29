import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  isLoading?: boolean;
}

const ChatMessage = ({
  content,
  role,
  isLoading = false,
}: ChatMessageProps) => {
  return (
    <div
      className={`chat-message py-6 ${
        role === "assistant" ? "bg-gray-900" : ""
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        <Avatar className="h-8 w-8 mt-1">
          {role === "user" ? (
            <AvatarFallback className="bg-blue-600">U</AvatarFallback>
          ) : (
            <AvatarImage src="/icons/favicon-32x32.png" alt="Assistant" />
          )}
        </Avatar>

        <div className="chat-message-content flex-1">
          {isLoading && content === "..." ? (
            <div className="animate-pulse h-4 w-8 bg-gray-700 rounded"></div>
          ) : (
            <ReactMarkdown
              children={content}
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
