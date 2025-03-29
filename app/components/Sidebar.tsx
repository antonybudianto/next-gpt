import { FaInbox, FaPlus, FaSignOutAlt, FaTrashAlt } from "react-icons/fa";
import type { Conversation } from "../type";
import { Dispatch, SetStateAction, useCallback } from "react";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "../utils/cn";
import { Button } from "./ui/button";
import {
  Search,
  PanelLeft,
  Image as ImageIcon,
  Code2,
  Grid3x3,
} from "lucide-react";

interface SidebarProps {
  name: string;
  currentId: string;
  conversations: Conversation[];
  onDeleteMessage: (id: string) => void;
  onSelectMessage: (id: string) => void;
  onClearChats: () => void;
  onNewChat: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({
  name,
  currentId,
  conversations,
  onDeleteMessage,
  onSelectMessage,
  onClearChats,
  onNewChat,
  collapsed = false,
  onToggle,
}: SidebarProps) => {
  const logout = useCallback(() => {
    signOut(getAuth());
  }, []);

  const handleNewChat = useCallback(() => {
    onNewChat();
  }, [onNewChat]);

  // Group conversations by date
  const yesterday = conversations.slice(0, 3); // Just for demo purposes
  const previousDays = conversations.slice(3); // Just for demo purposes

  return (
    <div
      className={cn(
        "h-screen py-2 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-0 opacity-0 overflow-hidden" : "w-64 opacity-100"
      )}
    >
      {/* Header */}
      <div className="p-2 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onToggle}>
          <PanelLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search"
              className="w-full bg-gray-800 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-700"
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" className="ml-2">
          <FaPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Model Selection */}
      <div className="px-2 py-3">
        <div className="flex flex-col space-y-1">
          <Button variant="ghost" className="justify-start font-medium text-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                <Search className="h-3.5 w-3.5" />
              </div>
              <span>ChatGPT</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800 my-2"></div>

      {/* Yesterday */}
      <div className="px-2 py-1">
        <h3 className="text-xs font-medium text-gray-500 px-3 mb-1">
          Yesterday
        </h3>
        <div className="space-y-1">
          {yesterday.map((cv) => (
            <Button
              key={cv.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm font-normal",
                cv.id === currentId ? "bg-gray-800" : ""
              )}
              onClick={() => onSelectMessage(cv.id)}
            >
              <div className="truncate">{cv.name}</div>
            </Button>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto border-t border-gray-800 p-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-normal"
          onClick={onClearChats}
        >
          <FaTrashAlt className="mr-2 h-4 w-4" />
          <span>Clear conversations</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm font-normal"
          onClick={logout}
        >
          <FaSignOutAlt className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
