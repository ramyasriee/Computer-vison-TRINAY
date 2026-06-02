import { motion } from "motion/react";
import { Sparkles, Navigation, AlertCircle, Volume2 } from "lucide-react";

export function SceneSummary() {
  const currentScene = {
    summary: "Door 2.3m ahead, Chair on left – Navigate safely",
    objects: ["Door", "Chair", "Table", "Window"],
    hazards: ["Low clearance ahead"],
    suggestions: ["Turn slightly right to avoid chair", "Clear path to door"],
  };

  return (
    <div className="space-y-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Scene Summary</h1>
        <p className="text-muted-foreground">AI-powered environment understanding</p>
      </motion.div>

      {/* Camera View */}
      <motion.div
        className="border-glow glass-effect-strong p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="aspect-video bg-gradient-to-br from-secondary/50 via-primary/10 to-accent/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <motion.div
            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>

          {/* Object markers */}
          <div className="absolute top-[20%] left-[50%] w-16 h-16 border-2 border-primary rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-primary">Door</span>
          </div>
          <div className="absolute top-[50%] left-[20%] w-16 h-16 border-2 border-accent rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-accent">Chair</span>
          </div>
        </div>

        <button className="btn-premium w-full mt-4 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-lg flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" />
          Analyze Scene
        </button>
      </motion.div>

      {/* Current Scene Summary */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6 border-2 border-primary/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Scene Analysis</h3>
          <button className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all">
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 mb-6">
          <p className="text-lg font-medium text-foreground leading-relaxed">
            {currentScene.summary}
          </p>
        </div>

        {/* Objects Detected */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Objects Detected</h4>
          <div className="flex flex-wrap gap-2">
            {currentScene.objects.map((obj, i) => (
              <motion.span
                key={i}
                className="px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                {obj}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Hazards */}
        {currentScene.hazards.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Potential Hazards
            </h4>
            <div className="space-y-2">
              {currentScene.hazards.map((hazard, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm"
                >
                  ⚠️ {hazard}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Suggestions */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#10B981]" />
            Navigation Suggestions
          </h4>
          <div className="space-y-2">
            {currentScene.suggestions.map((suggestion, i) => (
              <motion.div
                key={i}
                className="p-3 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-sm text-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                ✓ {suggestion}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-effect-strong rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detail Level</h3>
          <div className="space-y-2">
            {["Brief", "Standard", "Detailed"].map((level, i) => (
              <label key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                <input 
                  type="radio" 
                  name="detail" 
                  defaultChecked={i === 1}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-foreground">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="glass-effect-strong rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Auto-Refresh</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-foreground">Enable Auto-Refresh</span>
              <input type="checkbox" defaultChecked className="toggle accent-primary w-12 h-6" />
            </label>
            <div>
              <label className="text-sm text-foreground mb-2 block">Refresh Interval</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                defaultValue="5" 
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1s</span>
                <span>5s</span>
                <span>10s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
