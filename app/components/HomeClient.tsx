"use client";

import { generate as generateUUID } from "short-uuid";
import "@/app/utils/initFirebase";
import { UserInfo, getAuth } from "firebase/auth";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { isWhitelisted } from "../utils/whitelist";
import type { Chat, Conversation } from "../type";
import Menu from "./Menu";
import HomeChat from "./HomeChat";
import { FaPlus } from "react-icons/fa";

export default function HomeClient() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<UserInfo | null>();
  const [active, setActive] = useState(false);
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
    (prompt: string) => {
      const tmpConvs = [...conversations];
      const idx = tmpConvs.findIndex((c) => c.id === convId);

      if (tmpConvs[idx].name.indexOf("New Chat") !== -1) {
        tmpConvs[idx].name = prompt;
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
    <div className="flex flex-col px-3 lg:px-0 mb-16 lg:mb-36">
      <div className="flex items-center">
        <div
          className="text-4xl pb-2 mr-2 rounded cursor-pointer hover:bg-gray-700"
          onClick={() => {
            const modal = document.querySelector(
              "#modalmenu"
            ) as HTMLDivElement;
            if (modal) {
              modal.style.display = "flex";
            }
            setTimeout(() => {
              setActive((ac) => !ac);
            }, 0);
          }}
        >
          {" "}
          &#9776;
        </div>
        <h1 className="grow font-extrabold text-transparent text-4xl bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          NextGPT
        </h1>
        <div
          onClick={handleNewChat}
          className="text-blue-300 flex justify-between items-center cursor-pointer gap-2 px-3 py-2 text-md border border-gray-500 rounded hover:bg-gray-700"
        >
          <FaPlus />
          <span className="truncate hidden lg:inline-block overflow-hidden grow text-ellipsis select-none">
            New chat
          </span>
        </div>
      </div>
      <Menu
        name={authUser?.displayName || "Guest"}
        currentId={convId}
        active={active}
        conversations={conversations}
        setActive={setActive}
        onDeleteMessage={handleDelChat}
        onSelectMessage={handleSelectChat}
        onNewChat={handleNewChat}
        onClearChats={handleClearChat}
      />

      {authLoading ? (
        <div className="mt-1">
          <div className="w-full">
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
          <HomeChat
            convId={convId}
            convChats={chats}
            loading={loading}
            setLoading={setLoading}
            prompt={prompt}
            setPrompt={setPrompt}
            onDone={handleDone}
            onSubmit={handleSubmit}
          />
        </>
      )}
    </div>
  );
}
