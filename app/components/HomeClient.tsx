"use client";

import { generate as generateUUID } from "short-uuid";
import "@/app/utils/initFirebase";
import { UserInfo, getAuth } from "firebase/auth";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { isWhitelisted } from "../utils/whitelist";
import type { Chat, Conversation } from "../type";
import Sidebar from "./Sidebar";
import ChatContainer from "./ChatContainer";
import ChatHeader from "./ChatHeader";

const HomeClient = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authUser, setAuthUser] = useState<UserInfo | null>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [convId, setConvId] = useState("");
  const lsRef = useRef(false);

  const resetConv = useCallback(() => {
    const uuid = generateUUID();
    setConversations([
      {
        id: uuid,
        name: "New Chat 1",
      },
    ]);
    setConvId(uuid);
    setChats([]);
  }, []);

  useEffect(() => {
    console.log("checking..");
    const auth = getAuth();
    auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified && isWhitelisted(user.email || "")) {
        setAuthUser(user);
        setAuthLoading(false);
      } else {
        window.location.replace("/login");
      }
    });

    const chatKeysStr = localStorage.getItem("ngpt-chat-keys") || "[]";
    const chatKeys = JSON.parse(chatKeysStr);
    if (!chatKeys.length) {
      resetConv();
    } else {
      setConversations(chatKeys);
      setConvId(chatKeys[0].id);
    }
  }, [resetConv]);

  useEffect(() => {
    if (!lsRef.current) {
      lsRef.current = true;
      return;
    }
    if (!conversations.length) {
      resetConv();
      return;
    }
    localStorage.setItem("ngpt-chat-keys", JSON.stringify(conversations));
  }, [conversations, resetConv]);

  useEffect(() => {
    if (!convId) {
      setChats([]);
      return;
    }
    const _chatsStr = localStorage.getItem(`ngpt-chat-${convId}`) || "[]";
    const _chats = JSON.parse(_chatsStr);
    setChats(_chats);
  }, [convId]);

  const handleNewChat = useCallback(() => {
    const newUUID = generateUUID();
    setConversations((cv) => {
      return [
        {
          id: newUUID,
          name: `New Chat ${cv.length + 1}`,
        },
        ...cv,
      ];
    });
    setConvId(newUUID);
  }, [setConversations]);

  const handleDelChat = useCallback(
    (deletedId: string) => {
      if (!window.confirm("Are you sure to DELETE this chat?")) {
        return;
      }
      setConversations((cv) => {
        let newConv = cv.filter((c) => c.id !== deletedId);
        if (newConv.length && newConv[newConv.length - 1].id !== convId) {
          setConvId(newConv[newConv.length - 1].id);
        } else {
          setConvId("");
        }
        return newConv;
      });
      localStorage.removeItem(`ngpt-chat-${deletedId}`);
    },
    [convId]
  );

  const handleSelectChat = useCallback((id: string) => {
    setConvId(id);
  }, []);

  const handleDone = useCallback(
    (_chats: Chat[]) => {
      localStorage.setItem(`ngpt-chat-${convId}`, JSON.stringify(_chats));
    },
    [convId]
  );

  const handleSubmit = useCallback(
    (prompt: string | Record<string, unknown>[]) => {
      const tmpConvs = [...conversations];
      const idx = tmpConvs.findIndex((c) => c.id === convId);

      if (
        idx !== -1 &&
        tmpConvs[idx] &&
        tmpConvs[idx].name &&
        tmpConvs[idx].name.indexOf("New Chat") !== -1
      ) {
        tmpConvs[idx].name =
          typeof prompt === "object" ? (prompt[0].text as string) : prompt;
        setConversations(tmpConvs);
      }
    },
    [conversations, convId]
  );

  const handleClearChat = useCallback(() => {
    if (!window.confirm("Are you sure to DELETE ALL chats?")) {
      return;
    }
    conversations.forEach((c) => {
      localStorage.removeItem(`ngpt-chat-${c.id}`);
    });
    resetConv();
  }, [conversations, resetConv]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        name={authUser?.displayName || "Guest"}
        currentId={convId}
        conversations={conversations}
        onDeleteMessage={handleDelChat}
        onSelectMessage={handleSelectChat}
        onNewChat={handleNewChat}
        onClearChats={handleClearChat}
      />

      {/* Main Content */}
      <div className="flex-1 relative overflow-auto">
        <ChatHeader userName={authUser?.displayName || "Guest"} />

        {authLoading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="space-y-3">
                  <div className="h-5 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ChatContainer
            convId={convId}
            convChats={chats}
            loading={loading}
            setLoading={setLoading}
            prompt={prompt}
            setPrompt={setPrompt}
            onDone={handleDone}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default HomeClient;
