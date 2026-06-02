import { motion } from "motion/react";
import { Shield, AlertTriangle, Phone, User, MapPin } from "lucide-react";
import { useState } from "react";

export function SafetyMode() {
  const [isActive, setIsActive] = useState(true);
  const [fallDetected, setFallDetected] = useState(false);

  const emergencyContacts = [
    { name: "Emergency Services", number: "108", type: "Emergency" },
    { name: "Ramesh (Father)", number: "+91 98765 43210", type: "Family" },
    { name: "Priya (Sister)", number: "+91 98765 43211", type: "Family" },
  ];

  return (
    <div className="space-y-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Safety Mode</h1>
        <p className="text-muted-foreground">Fall detection with emergency assistance</p>
      </motion.div>

      {/* Status Card */}
      <motion.div
        className={`glass-effect-strong rounded-3xl p-6 border-2 ${
          isActive ? "border-[#10B981]/50" : "border-border"
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isActive
                  ? "bg-gradient-to-br from-[#10B981] to-[#059669]"
                  : "bg-secondary"
              }`}
              animate={isActive ? {
                scale: [1, 1.05, 1],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Shield className={`w-8 h-8 ${isActive ? "text-white" : "text-muted-foreground"}`} />
            </motion.div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {isActive ? "Safety Mode Active" : "Safety Mode Inactive"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isActive ? "Fall detection is monitoring" : "Enable to start monitoring"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`btn-premium px-6 py-3 rounded-2xl ${
              isActive
                ? "bg-red-500 text-white"
                : "bg-gradient-to-r from-[#10B981] to-[#059669] text-white"
            }`}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>

        {isActive && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-secondary/50 text-center">
              <p className="text-2xl font-bold text-[#10B981]">24/7</p>
              <p className="text-xs text-muted-foreground mt-1">Monitoring</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 text-center">
              <p className="text-2xl font-bold text-[#10B981]">3</p>
              <p className="text-xs text-muted-foreground mt-1">Contacts</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 text-center">
              <p className="text-2xl font-bold text-[#10B981]">GPS</p>
              <p className="text-xs text-muted-foreground mt-1">Enabled</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 text-center">
              <p className="text-2xl font-bold text-[#10B981]">0</p>
              <p className="text-xs text-muted-foreground mt-1">Alerts Today</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Fall Alert Demo */}
      {fallDetected && (
        <motion.div
          className="glass-effect-strong rounded-3xl p-6 border-2 border-red-500 bg-red-500/5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <AlertTriangle className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-semibold text-red-600">Fall Detected!</h3>
              <p className="text-sm text-muted-foreground">Emergency alert will be sent in 10 seconds</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setFallDetected(false)}
              className="btn-premium flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg"
            >
              I'm OK - Cancel Alert
            </button>
            <button className="btn-premium px-6 py-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
              Send SOS Now
            </button>
          </div>
        </motion.div>
      )}

      {/* Demo Button */}
      {!fallDetected && (
        <button
          onClick={() => setFallDetected(true)}
          className="w-full btn-premium py-4 rounded-2xl bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 inline mr-2" />
          Test Fall Detection Alert
        </button>
      )}

      {/* Emergency Contacts */}
      <div className="glass-effect-strong rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Emergency Contacts</h3>
        <div className="space-y-3">
          {emergencyContacts.map((contact, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  contact.type === "Emergency"
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : "bg-gradient-to-br from-primary to-accent"
                }`}>
                  {contact.type === "Emergency" ? (
                    <Phone className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.number}</p>
                </div>
              </div>
              <button className="p-2 rounded-xl bg-[#10B981] text-white hover:bg-[#059669] transition-colors">
                <Phone className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>
        <button className="w-full mt-4 py-3 rounded-2xl border-2 border-dashed border-primary text-primary hover:bg-primary hover:text-white transition-colors">
          + Add Contact
        </button>
      </div>

      {/* Location Sharing */}
      <div className="glass-effect-strong rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Location Sharing</h3>
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        
        <div className="p-4 rounded-2xl bg-secondary/50 mb-4">
          <p className="text-sm text-foreground mb-2">Current Location:</p>
          <p className="text-xs text-muted-foreground">
            📍 123 Main Street, Bangalore, Karnataka 560001
          </p>
        </div>

        <label className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 cursor-pointer">
          <span className="text-foreground">Auto-share location in emergency</span>
          <input type="checkbox" defaultChecked className="toggle accent-primary w-12 h-6" />
        </label>
      </div>

      {/* Settings */}
      <div className="glass-effect-strong rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detection Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-foreground mb-2 block">Fall Sensitivity</label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              defaultValue="3" 
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-foreground mb-2 block">Alert Delay (seconds)</label>
            <input 
              type="range" 
              min="5" 
              max="30" 
              defaultValue="10" 
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5s</span>
              <span>10s</span>
              <span>30s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
