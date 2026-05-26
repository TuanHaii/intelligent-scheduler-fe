import { motion } from "framer-motion";

const dotVariants = {
  animate: (i: number) => ({
    y: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      delay: i * 0.15,
      ease: "easeInOut",
    },
  }),
};

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
        <span className="text-white text-[10px] font-bold">AI</span>
      </div>
      <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">
            AI đang suy nghĩ
          </span>
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                custom={i}
                variants={dotVariants}
                animate="animate"
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
