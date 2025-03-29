import {
  FaInbox,
  FaPlus,
  FaSignOutAlt,
  FaTrashAlt,
  FaEllipsisH,
} from "react-icons/fa";
import type { Conversation } from "../type";
import { useCallback, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { cn } from "../utils/cn";
import { Button } from "./ui/button";
import {
  Search,
  PanelLeft,
  Image as ImageIcon,
  Code2,
  Grid3x3,
  MoreHorizontal,
  Trash2,
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

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
    <div className="h-screen py-2 w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
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
        <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={onNewChat}
        >
          <FaPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* Model Selection */}
      {/* <div className="px-2 py-3">
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
      </div> */}

      {/* Divider */}
      <div className="border-t border-gray-800 my-2"></div>

      {/* Yesterday */}
      <div className="flex-1 px-2 py-1 overflow-y-auto">
        <h3 className="text-xs font-medium text-gray-500 px-3 mb-1">
          All conversations
        </h3>
        <div className="space-y-1">
          {conversations.map((cv) => (
            <div key={cv.id} className="group relative flex items-center">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm font-normal pr-10",
                  cv.id === currentId ? "bg-gray-800" : ""
                )}
                onClick={() => onSelectMessage(cv.id)}
              >
                <div className="truncate">{cv.name}</div>
              </Button>
              <div className="absolute right-2 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity">
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(cv.id);
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>

                  {activeDropdown === cv.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm font-normal text-red-500 hover:text-red-600 hover:bg-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMessage(cv.id);
                          setActiveDropdown(null);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-auto border-t border-gray-800 p-2 pb-12">
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
