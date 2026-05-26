import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MessageSquarePlus,
  PanelLeft,
  Sparkles,
} from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import SuggestionCards from "./SuggestionCards";

export default function ChatWindow() {
  const { state, toggleOpen, toggleSidebar, createConversation } = useChat();
  const { isOpen, activeConversationId, messagesByConversation, isTyping, isLoadingDetail } =
    state;
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeConversationId != null
    ? messagesByConversation?.[activeConversationId] ?? []
    : [];
  const messages = Array.isArray(activeMessages) ? activeMessages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={
            isMobile
              ? { opacity: 0, scale: 0.95 }
              : { opacity: 0, scale: 0.9, y: 40, x: 0 }
          }
          animate={
            isMobile
              ? { opacity: 1, scale: 1 }
              : { opacity: 1, scale: 1, y: 0, x: 0 }
          }
          exit={
            isMobile
              ? { opacity: 0, scale: 0.95 }
              : { opacity: 0, scale: 0.9, y: 40, x: 0 }
          }
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`${
            isMobile
              ? "fixed inset-0 z-50 rounded-none"
              : "fixed bottom-4 right-4 z-50"
          } flex flex-col overflow-hidden`}
          style={!isMobile ? { width: "clamp(580px, 42vw, 720px)", maxWidth: "90vw", height: 680 } : undefined}
        >
          {/* Glass container */}
          <div className="flex flex-col h-full bg-white/60 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-blue-500/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 bg-white/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <PanelLeft className="w-4 h-4 text-gray-500" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 leading-tight">
                    Scheduler AI Assistant
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-gray-500">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={createConversation}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  title="New Chat"
                >
                  <MessageSquarePlus className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={toggleOpen}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Body: Sidebar + Main */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar */}
              <ChatSidebar />

              {/* Main chat area */}
              <div className="flex flex-col flex-1 min-w-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto py-3 space-y-1 smooth-scroll">
                  {isLoadingDetail && activeConversationId ? (
                    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs text-gray-500">Đang tải...</p>
                    </div>
                  ) : messages.length === 0 && !isTyping ? (
                    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-500/20 border border-white/40 flex items-center justify-center mb-4">
                        <Sparkles className="w-7 h-7 text-purple-500" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Chào bạn! 👋
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-[300px]">
                        Tôi là AI Assistant. Hãy hỏi tôi về lịch trình, thời
                        gian rảnh hoặc bất cứ điều gì!
                      </p>
                      <SuggestionCards />
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                      ))}
                      {isTyping && <TypingIndicator />}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <ChatInput />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
