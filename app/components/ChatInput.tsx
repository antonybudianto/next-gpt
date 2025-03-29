import React, { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Plus,
  Search,
  LightbulbIcon,
  Mic,
  Send,
  StopCircle,
} from "lucide-react";
import { FaImage } from "react-icons/fa";
import Compressor from "compressorjs";

interface ChatInputProps {
  prompt: string;
  loading: boolean;
  setPrompt: (str: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onImageUpload?: () => void;
  onImageSelected?: (imageUrl: string) => void;
}

const ChatInput = ({
  prompt,
  loading,
  setPrompt,
  onSubmit,
  onStop,
  onImageUpload,
  onImageSelected,
}: ChatInputProps) => {
  const [rows, setRows] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = (e.target?.files || [])[0];
    if (!file) return;

    const reader = new FileReader();

    new Compressor(file, {
      quality: 0.6,
      maxWidth: 720,
      maxHeight: 480,
      convertSize: 500000,
      convertTypes: "image/png,image/webp",
      success(_file) {
        reader.readAsDataURL(_file);
        reader.onload = function () {
          const imageUrl = reader.result as string;
          setSelectedImage(imageUrl);
          if (onImageSelected) {
            onImageSelected(imageUrl);
          }
        };
        reader.onerror = function (error) {
          console.log("Error: ", error);
        };
      },
      error(err) {
        console.log(err.message);
      },
    });
  };

  const handleImageUploadClick = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
    if (onImageUpload) {
      onImageUpload();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    const numberOfLineBreaks = (e.target.value.match(/\n/g) || []).length;
    setRows(Math.min(numberOfLineBreaks + 1, 5)); // Max 5 rows
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="bg-background border-t border-gray-800 p-4 w-full">
      <div className="max-w-3xl mx-auto">
        <input
          ref={fileRef}
          type="file"
          accept="image/png, image/gif, image/jpeg, image/jpg"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="relative flex items-center rounded-lg border border-gray-700 bg-gray-800 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2"
            onClick={handleImageUploadClick}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected"
                className="h-5 w-5 object-cover rounded"
              />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </Button>

          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={rows}
            className="min-h-[60px] border-0 resize-none pl-12 pr-20 py-3 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={loading}
            style={{ paddingTop: "18px" }}
          />

          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {/* <Button variant="ghost" size="icon" disabled={loading}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" disabled={loading}>
              <LightbulbIcon className="h-5 w-5" />
            </Button> */}
            <Button variant="ghost" size="icon" disabled={loading}>
              <Mic className="h-5 w-5" />
            </Button>

            {loading ? (
              <Button
                variant="ghost"
                size="icon"
                className="bg-gray-700"
                onClick={onStop}
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={prompt.trim() ? "bg-blue-600" : "bg-gray-700"}
                disabled={!prompt.trim()}
                onClick={onSubmit}
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-xs text-center text-gray-500 mt-2">
          ChatGPT can make mistakes. Check important info.
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
