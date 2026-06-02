import { Camera, Scan, Banknote, BookOpen, Clock } from "lucide-react";
import { motion } from "motion/react";

interface Activity {
  id: number;
  type: string;
  description: string;
  time: string;
  icon: typeof Camera;
}

const activities: Activity[] = [
  {
    id: 1,
    type: "Object Detection",
    description: "Detected: Chair, Table, Door",
    time: "2 min ago",
    icon: Scan,
  },
  {
    id: 2,
    type: "Currency Check",
    description: "₹500 Note - Genuine",
    time: "5 min ago",
    icon: Banknote,
  },
  {
    id: 3,
    type: "Text Reader",
    description: "Read 3 paragraphs successfully",
    time: "12 min ago",
    icon: BookOpen,
  },
  {
    id: 4,
    type: "Live Camera",
    description: "Session started",
    time: "15 min ago",
    icon: Camera,
  },
];

export function ActivityTimeline() {
  return (
    <div className="glass-effect-strong rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Clock className="w-5 h-5 text-primary" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              className="flex gap-4 group cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:from-primary group-hover:to-accent transition-all duration-300">
                  <Icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/30 to-transparent mt-2" style={{ minHeight: '20px' }}></div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-4">
                <p className="text-sm font-medium text-foreground">{activity.type}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                <p className="text-xs text-primary mt-1">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
