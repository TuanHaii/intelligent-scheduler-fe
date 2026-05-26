import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";
import { useChat } from "@/context/ChatContext";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, state } = useChat();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || state.isTyping) return;
    setInput("");
    sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/20 p-4 bg-white/30 backdrop-blur-md">
      <div className="flex items-end gap-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl px-5 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all duration-150">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          rows={1}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-400 resize-none max-h-[120px] py-1"
        />
        <button
          onClick={state.isTyping ? undefined : handleSubmit}
          disabled={!input.trim() && !state.isTyping}
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
            input.trim() && !state.isTyping
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:brightness-110"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {state.isTyping ? (
            <Square className="w-4 h-4" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>
      </div>
      <p className="text-[10px] text-gray-400 text-center mt-2">
        AI Assistant có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
      </p>
    </div>
  );
}
