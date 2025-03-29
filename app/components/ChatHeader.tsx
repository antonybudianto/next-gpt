import React from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChevronDown } from "lucide-react";

interface ChatHeaderProps {
  userName: string;
}

const ChatHeader = ({ userName }: ChatHeaderProps) => {
  return (
    <div className="fixed top-0 right-0 left-64 z-10 bg-background border-b border-gray-800 flex justify-between items-center px-4 py-2">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold">ChatGPT</h1>
        <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="text-sm">
          Temporary
        </Button>

        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-blue-600">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default ChatHeader;
