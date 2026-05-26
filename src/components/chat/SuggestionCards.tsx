import { motion } from "framer-motion";
import { Sparkles, Calendar, Clock, Users, Sun } from "lucide-react";
import { useChat } from "@/context/ChatContext";

const suggestions = [
  {
    icon: Calendar,
    text: "Ngày mai tôi còn rảnh lúc nào?",
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    icon: Clock,
    text: "Sắp xếp giúp tôi lịch học tuần này",
    gradient: "from-purple-400 to-pink-400",
  },
  {
    icon: Users,
    text: "Tìm khoảng trống 2 tiếng để họp nhóm",
    gradient: "from-emerald-400 to-teal-400",
  },
  {
    icon: Sun,
    text: "Kiểm tra lịch cuối tuần giúp tôi",
    gradient: "from-amber-400 to-orange-400",
  },
];

export default function SuggestionCards() {
  const { sendMessage } = useChat();

  return (
    <div className="px-4 pt-4 pb-2 w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className="text-xs font-medium text-gray-500">
          Gợi ý nhanh
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {suggestions.map((s, i) => (
          <motion.button
            key={s.text}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => sendMessage(s.text)}
            className="group relative overflow-hidden rounded-xl p-3.5 text-left bg-white/65 backdrop-blur-md border border-white/30 hover:border-indigo-300/40 shadow-sm hover:shadow-md hover:shadow-indigo-200/20 transition-all duration-200"
          >
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${s.gradient}`}
            />
            <div className="relative z-[1]">
              <s.icon
                className={`w-5 h-5 mb-2 bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent group-hover:-rotate-6 transition-transform duration-300`}
              />
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                {s.text}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
