import { useNavigate } from "react-router";
import { FeatureCard } from "../components/FeatureCard";
import { VoiceCommandPanel } from "../components/VoiceCommandPanel";
import { ActivityTimeline } from "../components/ActivityTimeline";
import { RotatingGlobe } from "../components/RotatingGlobe";
import { Scan, Banknote, BookOpen, Shield, Play, Pause } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function Dashboard() {
  const navigate = useNavigate();
  const [isLive, setIsLive] = useState(true);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Your TRINAY AI assistant is ready to help
            </p>
          </div>
          <div className="hidden lg:block">
            <RotatingGlobe size="lg" />
          </div>
        </div>
      </motion.div>

      {/* Live Camera Feed */}
      <motion.div
        className="border-glow glass-effect-strong p-8 relative overflow-hidden group"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {/* Camera feed placeholder */}
        <div className="aspect-video bg-gradient-to-br from-secondary/50 via-primary/10 to-accent/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
          {/* Animated grid overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(var(--lavender-accent) 1px, transparent 1px),
                linear-gradient(90deg, var(--lavender-accent) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          {/* Center icon */}
          <div className="relative z-10 text-center">
            <motion.div
              className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Scan className="w-12 h-12 text-white" />
            </motion.div>
            <p className="text-lg font-semibold text-foreground">Live Camera View</p>
            <p className="text-sm text-muted-foreground mt-2">
              Detecting objects • Distance enabled
            </p>
          </div>
          
          {/* Detection overlays */}
          <div className="absolute top-6 left-6 px-4 py-2 rounded-xl glass-effect text-sm font-medium text-foreground">
            📍 Distance: 2.3m
          </div>
          <div className="absolute top-6 right-6 px-4 py-2 rounded-xl glass-effect text-sm font-medium text-foreground">
            🎯 3 Objects
          </div>
        </div>
        
        {/* Control buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setIsLive(!isLive)}
            className="btn-premium flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-lg"
          >
            {isLive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isLive ? "Pause" : "Start"} Detection
          </button>
          <button className="btn-premium px-6 py-3 rounded-2xl bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
            Full Screen
          </button>
        </div>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <FeatureCard
          icon={Scan}
          title="Object Tracking"
          description="Real-time YOLO detection with distance measurement"
          badge="YOLO"
          badgeColor="bg-[#10B981]"
          gradient="from-primary to-accent"
          onClick={() => navigate("/object-detection")}
        />
        <FeatureCard
          icon={Banknote}
          title="Currency Detection"
          description="Indian currency identification with fake note alerts"
          badge="₹"
          badgeColor="bg-accent"
          gradient="from-accent to-primary"
          onClick={() => navigate("/currency-detection")}
        />
        <FeatureCard
          icon={BookOpen}
          title="OCR Text Reader"
          description="Extract and read text from images instantly"
          badge="OCR"
          badgeColor="bg-primary"
          gradient="from-primary via-accent to-primary"
          onClick={() => navigate("/text-reader")}
        />
        <FeatureCard
          icon={Shield}
          title="Safety Mode"
          description="Fall detection with emergency SOS alerts"
          badge="SOS"
          badgeColor="bg-red-500"
          gradient="from-red-400 to-red-600"
          onClick={() => navigate("/safety-mode")}
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityTimeline />
        </div>
        <div>
          <VoiceCommandPanel />
        </div>
      </div>
    </div>
  );
}