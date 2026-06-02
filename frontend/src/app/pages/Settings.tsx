import { motion } from "motion/react";
import { Settings as SettingsIcon, Bell, Eye, Volume2, Smartphone, User, Lock } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your TRINAY experience</p>
      </motion.div>

      {/* User Profile */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl shadow-lg">
            R
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-foreground">Ramya</h3>
            <p className="text-xs text-muted-foreground mt-1">ramya.project@example.com</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] status-live"></div>
              <span className="text-xs text-muted-foreground">Camera Connected</span>
            </div>
          </div>
          <button className="btn-premium px-4 py-2 rounded-xl border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
            Edit Profile
          </button>
        </div>
      </motion.div>

      {/* Accessibility Settings */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Accessibility</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <div>
              <p className="font-medium text-foreground">High Contrast Mode</p>
              <p className="text-sm text-muted-foreground">Enhance visual clarity</p>
            </div>
            <input type="checkbox" className="toggle accent-primary w-12 h-6" />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <div>
              <p className="font-medium text-foreground">Large Text</p>
              <p className="text-sm text-muted-foreground">Increase font size</p>
            </div>
            <input type="checkbox" className="toggle accent-primary w-12 h-6" />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <div>
              <p className="font-medium text-foreground">Screen Reader Support</p>
              <p className="text-sm text-muted-foreground">Enable voice descriptions</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle accent-primary w-12 h-6" />
          </label>
        </div>
      </motion.div>

      {/* Voice & Audio */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Voice & Audio</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-foreground mb-2 block">Voice Speed</label>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1"
              defaultValue="1" 
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-foreground mb-2 block">Volume</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="80" 
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="text-sm text-foreground mb-2 block">Voice Gender</label>
            <select className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground">
              <option>Female</option>
              <option>Male</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#10B981]" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <div>
              <p className="font-medium text-foreground">Detection Alerts</p>
              <p className="text-sm text-muted-foreground">Get notified of important detections</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle accent-primary w-12 h-6" />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <div>
              <p className="font-medium text-foreground">Safety Alerts</p>
              <p className="text-sm text-muted-foreground">Emergency and fall detection alerts</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle accent-primary w-12 h-6" />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <div>
              <p className="font-medium text-foreground">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Receive usage summaries</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle accent-primary w-12 h-6" />
          </label>
        </div>
      </motion.div>

      {/* Device Settings */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Device</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-foreground mb-2 block">Camera Quality</label>
            <select className="w-full p-3 rounded-xl bg-secondary border border-border text-foreground">
              <option>High (1080p)</option>
              <option>Medium (720p)</option>
              <option>Low (480p)</option>
            </select>
          </div>

          <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <div>
              <p className="font-medium text-foreground">Battery Saver Mode</p>
              <p className="text-sm text-muted-foreground">Reduce power consumption</p>
            </div>
            <input type="checkbox" className="toggle accent-primary w-12 h-6" />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <div>
              <p className="font-medium text-foreground">Offline Mode</p>
              <p className="text-sm text-muted-foreground">Work without internet</p>
            </div>
            <input type="checkbox" className="toggle accent-primary w-12 h-6" />
          </label>
        </div>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div
        className="glass-effect-strong rounded-3xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left">
            <p className="font-medium text-foreground">Change Password</p>
            <p className="text-sm text-muted-foreground">Update your security credentials</p>
          </button>

          <button className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left">
            <p className="font-medium text-foreground">Privacy Policy</p>
            <p className="text-sm text-muted-foreground">View our privacy practices</p>
          </button>

          <button className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left">
            <p className="font-medium text-foreground">Data Management</p>
            <p className="text-sm text-muted-foreground">Control your data and storage</p>
          </button>
        </div>
      </motion.div>

      {/* About */}
      <div className="glass-effect-strong rounded-3xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl shadow-xl">
          👁️
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">TRINAY v1.0.0</h3>
        <p className="text-sm text-muted-foreground mb-4">
          AI-Powered Vision Assistance System for visually impaired users
        </p>
        <p className="text-xs text-muted-foreground">
          Major Final Year Project 2026 • Built for Social Impact
        </p>
      </div>
    </div>
  );
}