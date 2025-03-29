import React from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronDown, PanelLeft } from "lucide-react";
import { cn } from "../utils/cn";

interface ChatHeaderProps {
  userName: string;
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
}

const ChatHeader = ({
  userName,
  showSidebarToggle = false,
  onToggleSidebar,
}: ChatHeaderProps) => {
  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-10 bg-background    flex justify-between items-center px-4 py-2 transition-all duration-300",
        showSidebarToggle ? "left-0" : "left-64"
      )}
    >
      <div className="flex items-center">
        {showSidebarToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={onToggleSidebar}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg font-semibold">NextGPT</h1>
      </div>

      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-indigo-900">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default ChatHeader;
