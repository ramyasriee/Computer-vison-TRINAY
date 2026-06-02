import { motion } from "motion/react";
import { BookOpen, Copy, Volume2, Download, Scan } from "lucide-react";
import { useState } from "react";

export function TextReader() {
  const [extractedText] = useState(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 

Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
  };

  return (
    <div className="space-y-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">OCR Text Reader</h1>
        <p className="text-muted-foreground">Extract and read text from images</p>
      </motion.div>

      {/* Camera View */}
      <motion.div
        className="border-glow glass-effect-strong p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Camera View</h3>
        
        <div className="aspect-video bg-gradient-to-br from-secondary/50 via-primary/10 to-accent/20 rounded-2xl flex items-center justify-center relative overflow-hidden mb-4">
          <motion.div
            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <BookOpen className="w-16 h-16 text-white" />
          </motion.div>

          {/* Text detection overlay */}
          <div className="absolute inset-[10%] border-2 border-dashed border-accent rounded-2xl flex items-center justify-center">
            <p className="text-sm text-accent font-medium bg-white/90 px-4 py-2 rounded-xl">
              Point camera at text
            </p>
          </div>
        </div>

        <button className="btn-premium w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-lg flex items-center justify-center gap-2">
          <Scan className="w-5 h-5" />
          Capture & Extract Text
        </button>
      </motion.div>

      {/* Extracted Text */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Extracted Text</h3>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all"
              title="Copy to clipboard"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all" title="Read aloud">
              <Volume2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all" title="Download">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-2xl p-6 min-h-[200px] space-y-4">
          {extractedText.split('\n\n').map((paragraph, i) => (
            <p key={i} className="text-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-secondary/50">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Text Statistics</p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Words: 67</span>
              <span>Characters: 421</span>
              <span>Lines: 3</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-primary">98.5%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>
      </motion.div>

      {/* Language Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-effect-strong rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Language</h3>
          <select className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground">
            <option>English</option>
            <option>Hindi</option>
            <option>Tamil</option>
            <option>Telugu</option>
            <option>Kannada</option>
            <option>Malayalam</option>
          </select>
        </div>

        <div className="glass-effect-strong rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Reading Speed</h3>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1"
            defaultValue="1" 
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Slow (0.5x)</span>
            <span>Normal (1x)</span>
            <span>Fast (2x)</span>
          </div>
        </div>
      </div>

      {/* Recent Reads */}
      <div className="glass-effect-strong rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Reads</h3>
        <div className="space-y-3">
          {[
            { title: "Book excerpt - Chapter 5", words: 67, time: "5 min ago" },
            { title: "Restaurant menu", words: 124, time: "15 min ago" },
            { title: "Signboard text", words: 12, time: "30 min ago" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.words} words • {item.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
