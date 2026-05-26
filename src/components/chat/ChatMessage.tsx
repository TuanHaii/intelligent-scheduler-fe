import { motion } from "framer-motion";
import type { Message } from "@/types/chat.type";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "USER";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex items-start gap-3 px-5 py-2 ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 mt-1">
          <span className="text-white text-[10px] font-bold">AI</span>
        </div>
      )}

      <div
        className={`text-[13px] leading-relaxed break-words whitespace-pre-wrap tracking-normal ${
          isUser
            ? "max-w-[78%] px-4 py-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl rounded-tr-md shadow-lg shadow-blue-500/20"
            : "max-w-[85%] px-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/40 text-gray-800 rounded-2xl rounded-tl-md shadow-sm"
        }`}
      >
        {message.content ?? ""}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
          <span className="text-white text-[10px] font-bold">U</span>
        </div>
      )}
    </motion.div>
  );
}
