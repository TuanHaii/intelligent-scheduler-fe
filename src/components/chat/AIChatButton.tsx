import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function AIChatButton() {
  const { toggleOpen, state } = useChat();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleOpen}
          className="relative w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/30 hover:shadow-xl hover:shadow-purple-500/30 transition-shadow duration-300"
        >
          <Sparkles className="w-4.5 h-4.5 text-white" />
          <motion.span
            animate={{
              boxShadow: [
                "0 0 0px rgba(139, 92, 246, 0.4)",
                "0 0 16px rgba(139, 92, 246, 0.6)",
                "0 0 0px rgba(139, 92, 246, 0.4)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full"
          />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent className="glass-card text-gray-800">
        <p>{state.isOpen ? "Đóng AI Assistant" : "Mở AI Assistant"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
