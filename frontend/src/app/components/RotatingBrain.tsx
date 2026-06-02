import { motion } from "motion/react";
import { Brain } from "lucide-react";

export function RotatingBrain() {
  return (
    <motion.div
      className="w-20 h-20 perspective-container"
      animate={{
        rotateY: [0, 360],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }}>
        {/* Translucent orb */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-primary/40 backdrop-blur-md border-2 border-primary/30 shadow-2xl shadow-primary/50">
          {/* Brain icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary opacity-80" />
          </div>
          
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '3s' }}></div>
        </div>
        
        {/* Processing text */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs font-medium text-primary">Processing...</span>
        </div>
      </div>
    </motion.div>
  );
}
