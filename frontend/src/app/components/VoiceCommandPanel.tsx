import { motion } from "motion/react";
import { Mic, Volume2 } from "lucide-react";
import { useState } from "react";

export function VoiceCommandPanel() {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="glass-effect-strong rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Voice Commands</h3>
        <Volume2 className="w-5 h-5 text-primary" />
      </div>
      
      {/* Microphone button */}
      <div className="flex flex-col items-center py-6">
        <motion.button
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isListening ? 'mic-active' : 'btn-premium'
          }`}
          onClick={() => setIsListening(!isListening)}
          whileTap={{ scale: 0.95 }}
        >
          <Mic className="w-10 h-10 text-white" />
        </motion.button>
        
        <p className="mt-4 text-sm font-medium text-foreground">
          {isListening ? "Listening..." : "Speak now"}
        </p>
        
        {isListening && (
          <motion.div
            className="flex gap-1 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-primary rounded-full"
                animate={{
                  height: [8, 24, 8],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Voice commands list */}
      <div className="space-y-2 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Try saying:</p>
        {[
          "What's in front of me?",
          "Read the text",
          "Detect currency",
          "Describe the scene",
        ].map((command, i) => (
          <div
            key={i}
            className="text-sm text-foreground/70 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            "{command}"
          </div>
        ))}
      </div>
    </div>
  );
}
