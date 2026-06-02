import { motion } from "motion/react";
import { Scan, Ruler, Target, Zap } from "lucide-react";
import { FeatureCard } from "../components/FeatureCard";

export function ObjectDetection() {
  const detectedObjects = [
    { name: "Chair", distance: "2.3m", confidence: "96%", position: "Front-Left" },
    { name: "Table", distance: "1.8m", confidence: "98%", position: "Center" },
    { name: "Door", distance: "3.5m", confidence: "94%", position: "Front" },
    { name: "Plant", distance: "1.2m", confidence: "91%", position: "Right" },
  ];

  return (
    <div className="space-y-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Object Detection</h1>
        <p className="text-muted-foreground">YOLO-powered real-time object tracking</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FeatureCard
          icon={Scan}
          title="Active Scan"
          description="YOLO v8 Model"
          gradient="from-primary to-accent"
        />
        <FeatureCard
          icon={Ruler}
          title="Distance"
          description="Depth Enabled"
          gradient="from-accent to-primary"
        />
        <FeatureCard
          icon={Target}
          title="Accuracy"
          description="98.5% Average"
          gradient="from-[#10B981] to-[#059669]"
        />
        <FeatureCard
          icon={Zap}
          title="Speed"
          description="60 FPS"
          gradient="from-primary via-accent to-primary"
        />
      </div>

      {/* Detection View */}
      <motion.div
        className="border-glow glass-effect-strong p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Live Detection Feed</h3>
        
        <div className="aspect-video bg-gradient-to-br from-secondary/50 via-primary/10 to-accent/20 rounded-2xl flex items-center justify-center relative overflow-hidden mb-6">
          <Scan className="w-32 h-32 text-primary/30" />
          
          {/* Detection boxes */}
          <div className="absolute top-[20%] left-[15%] w-32 h-32 border-2 border-primary rounded-lg">
            <div className="absolute -top-7 left-0 px-2 py-1 bg-primary text-white text-xs rounded">
              Chair 96%
            </div>
          </div>
          
          <div className="absolute top-[30%] right-[20%] w-40 h-40 border-2 border-accent rounded-lg">
            <div className="absolute -top-7 left-0 px-2 py-1 bg-accent text-white text-xs rounded">
              Table 98%
            </div>
          </div>
        </div>

        {/* Detected Objects List */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Detected Objects</h4>
          {detectedObjects.map((obj, i) => (
            <motion.div
              key={i}
              className="glass-effect rounded-2xl p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Scan className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{obj.name}</p>
                  <p className="text-sm text-muted-foreground">{obj.position}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-primary">{obj.distance}</p>
                <p className="text-sm text-muted-foreground">{obj.confidence}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <div className="glass-effect-strong rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detection Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-foreground">Confidence Threshold</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="85" 
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>85%</span>
              <span>100%</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-foreground">Detection Range</label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              defaultValue="5" 
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0m</span>
              <span>5m</span>
              <span>10m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
