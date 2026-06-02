import { motion } from "motion/react";
import { FileText, Download, TrendingUp, BarChart3, Calendar } from "lucide-react";

export function Reports() {
  const stats = [
    { label: "Total Detections", value: "1,248", change: "+12%", color: "from-primary to-accent" },
    { label: "Session Time", value: "42h 15m", change: "+8%", color: "from-accent to-primary" },
    { label: "Accuracy Rate", value: "98.5%", change: "+2%", color: "from-[#10B981] to-[#059669]" },
    { label: "Objects Scanned", value: "876", change: "+15%", color: "from-primary via-accent to-primary" },
  ];

  const recentReports = [
    { date: "April 5, 2026", type: "Weekly Summary", size: "2.4 MB" },
    { date: "March 29, 2026", type: "Weekly Summary", size: "2.1 MB" },
    { date: "March 22, 2026", type: "Weekly Summary", size: "1.9 MB" },
    { date: "March 1, 2026", type: "Monthly Report", size: "8.7 MB" },
  ];

  return (
    <div className="space-y-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Logs</h1>
            <p className="text-muted-foreground">Usage analytics and activity reports</p>
          </div>
          <button className="btn-premium px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="glass-effect-strong rounded-3xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
          >
            <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
              {stat.value}
            </div>
            <div className="text-sm text-foreground mb-1">{stat.label}</div>
            <div className="flex items-center gap-1 text-xs text-[#10B981]">
              <TrendingUp className="w-3 h-3" />
              {stat.change} from last week
            </div>
          </motion.div>
        ))}
      </div>

      {/* Usage Chart */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Weekly Usage</h3>
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>

        {/* Simple bar chart */}
        <div className="flex items-end justify-between gap-3 h-48">
          {[65, 80, 45, 90, 75, 85, 70].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className="w-full bg-gradient-to-t from-primary to-accent rounded-t-xl"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              ></motion.div>
              <span className="text-xs text-muted-foreground">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature Breakdown */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-6">Feature Usage Breakdown</h3>
        
        <div className="space-y-4">
          {[
            { name: "Object Detection", percentage: 45, color: "bg-primary" },
            { name: "Currency Detection", percentage: 25, color: "bg-accent" },
            { name: "Text Reader", percentage: 20, color: "bg-[#10B981]" },
            { name: "Scene Summary", percentage: 10, color: "bg-primary/60" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">{feature.name}</span>
                <span className="text-sm font-medium text-primary">{feature.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${feature.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${feature.percentage}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                ></motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Activity Log */}
      <div className="glass-effect-strong rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Activity Log</h3>
          <Calendar className="w-5 h-5 text-primary" />
        </div>

        <div className="space-y-3">
          {[
            { action: "Object Detection Session", time: "Today at 2:30 PM", duration: "15 min" },
            { action: "Currency Scan", time: "Today at 12:15 PM", duration: "2 min" },
            { action: "Text Reading", time: "Today at 10:45 AM", duration: "8 min" },
            { action: "Scene Analysis", time: "Yesterday at 5:20 PM", duration: "12 min" },
            { action: "Safety Mode Activated", time: "Yesterday at 8:00 AM", duration: "All day" },
          ].map((log, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div>
                <p className="font-medium text-foreground">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.time}</p>
              </div>
              <span className="text-sm text-primary">{log.duration}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report Downloads */}
      <div className="glass-effect-strong rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Download Reports</h3>
        
        <div className="space-y-3">
          {recentReports.map((report, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{report.type}</p>
                  <p className="text-xs text-muted-foreground">{report.date} • {report.size}</p>
                </div>
              </div>
              <button className="btn-premium p-2 rounded-xl bg-primary text-white">
                <Download className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
