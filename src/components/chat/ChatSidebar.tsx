import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Conversation } from "@/types/chat.type";

function LoadingSkeleton() {
  return (
    <div className="p-1.5 space-y-1.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-xl">
          <div className="w-3.5 h-3.5 rounded bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded" />
            <div className="h-2 w-1/2 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-3 py-6 text-center">
      <p className="text-xs text-gray-400">No conversations yet</p>
    </div>
  );
}

export default function ChatSidebar() {
  const { state, createConversation, selectConversation } = useChat();
  const {
    conversations,
    activeConversationId,
    showSidebar,
    isLoadingConversations,
  } = state;

  const safeConversations: Conversation[] = Array.isArray(conversations)
    ? conversations
    : [];

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {showSidebar && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 160, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-shrink-0 overflow-hidden border-r border-white/20 bg-white/30 backdrop-blur-xl"
        >
          <div className="flex flex-col h-full w-[160px]">
            <div className="p-2 border-b border-white/20">
              <button
                onClick={createConversation}
                disabled={isLoadingConversations}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-medium hover:brightness-110 transition-all duration-200 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Chat</span>
              </button>
            </div>

            <ScrollArea className="flex-1">
              {isLoadingConversations ? (
                <LoadingSkeleton />
              ) : safeConversations.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="p-1.5 space-y-0.5">
                  {safeConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all duration-150 group",
                        conv.id === activeConversationId
                          ? "bg-white/70 backdrop-blur-sm border border-white/50 shadow-sm"
                          : "hover:bg-white/40 border border-transparent",
                      )}
                    >
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-gray-700 truncate">
                          {conv.title || "New Conversation"}
                        </p>
                        <p className="text-[9px] text-gray-400 mt-0.5">
                          {formatTime(conv.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
