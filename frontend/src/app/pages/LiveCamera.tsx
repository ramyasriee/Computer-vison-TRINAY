import { motion } from "motion/react";
import { Camera, Mic, Square, Circle, Video } from "lucide-react";
import { useState } from "react";
import { RotatingBrain } from "../components/RotatingBrain";

export function LiveCamera() {
  const [isRecording, setIsRecording] = useState(false);
  const [features, setFeatures] = useState({
    objectDetection: true,
    distance: true,
    voice: false,
  });

  return (
    <div className="space-y-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Live Camera Mode</h1>
        <p className="text-muted-foreground">Real-time TRINAY AI assistance</p>
      </motion.div>

      {/* Main Camera View */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="aspect-video bg-gradient-to-br from-secondary/50 via-primary/10 to-accent/20 rounded-3xl border-2 border-primary/20 overflow-hidden relative">
          {/* Camera feed placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-32 h-32 text-primary/30" />
          </div>
          
          {/* Overlay controls */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex gap-2">
              {isRecording && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-effect-strong"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Circle className="w-3 h-3 fill-red-500 text-red-500" />
                  <span className="text-sm font-medium text-foreground">Recording</span>
                </motion.div>
              )}
              
              <div className="px-4 py-2 rounded-xl glass-effect-strong text-sm font-medium text-foreground">
                00:00:00
              </div>
            </div>
            
            <div className="absolute top-6 right-6">
              <RotatingBrain />
            </div>
          </div>
          
          {/* Detection overlays */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="glass-effect-strong rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Real-time Detection</span>
                <span className="text-xs text-primary">Active</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">Chair detected</span>
                  <span className="text-muted-foreground">2.3m away</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">Table detected</span>
                  <span className="text-muted-foreground">1.8m away</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">Door detected</span>
                  <span className="text-muted-foreground">3.5m away</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="mt-6 glass-effect-strong rounded-3xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Toggle buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFeatures(f => ({ ...f, objectDetection: !f.objectDetection }))}
                className={`px-4 py-2 rounded-xl transition-all ${
                  features.objectDetection
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'bg-secondary text-foreground'
                }`}
              >
                Object Detection
              </button>
              <button
                onClick={() => setFeatures(f => ({ ...f, distance: !f.distance }))}
                className={`px-4 py-2 rounded-xl transition-all ${
                  features.distance
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'bg-secondary text-foreground'
                }`}
              >
                Distance
              </button>
              <button
                onClick={() => setFeatures(f => ({ ...f, voice: !f.voice }))}
                className={`px-4 py-2 rounded-xl transition-all ${
                  features.voice
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'bg-secondary text-foreground'
                }`}
              >
                <Mic className="w-4 h-4 inline mr-2" />
                Voice
              </button>
            </div>

            {/* Record button */}
            <motion.button
              onClick={() => setIsRecording(!isRecording)}
              className={`btn-premium flex items-center gap-2 px-6 py-3 rounded-2xl ${
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-gradient-to-r from-primary to-accent text-white'
              } shadow-lg`}
              whileTap={{ scale: 0.95 }}
            >
              {isRecording ? (
                <>
                  <Square className="w-5 h-5" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  Start Recording
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Objects Detected", value: "23", color: "from-primary to-accent" },
          { label: "Session Time", value: "15:32", color: "from-accent to-primary" },
          { label: "Frames Processed", value: "1,024", color: "from-primary via-accent to-primary" },
          { label: "Accuracy", value: "98.5%", color: "from-[#10B981] to-[#059669]" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="glass-effect-strong rounded-2xl p-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}