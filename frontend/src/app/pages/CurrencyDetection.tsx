import { motion } from "motion/react";
import { Banknote, CheckCircle, AlertTriangle, Scan } from "lucide-react";
import { useState } from "react";

export function CurrencyDetection() {
  const [scanResult, setScanResult] = useState<{
    denomination: string;
    status: "genuine" | "fake" | "unknown";
    confidence: string;
  } | null>({
    denomination: "₹500",
    status: "genuine",
    confidence: "99.2%",
  });

  const recentScans = [
    { denomination: "₹500", status: "genuine", time: "2 min ago" },
    { denomination: "₹200", status: "genuine", time: "5 min ago" },
    { denomination: "₹100", status: "genuine", time: "8 min ago" },
    { denomination: "₹50", status: "genuine", time: "12 min ago" },
  ];

  return (
    <div className="space-y-6 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Currency Detection</h1>
        <p className="text-muted-foreground">Indian currency identification with authenticity check</p>
      </motion.div>

      {/* Scan Area */}
      <motion.div
        className="border-glow glass-effect-strong p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="aspect-video bg-gradient-to-br from-secondary/50 via-primary/10 to-accent/20 rounded-3xl flex items-center justify-center relative overflow-hidden">
          <div className="text-center z-10">
            <motion.div
              className="w-32 h-32 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl"
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Banknote className="w-16 h-16 text-white" />
            </motion.div>
            <p className="text-lg font-semibold text-foreground">Place Currency Note</p>
            <p className="text-sm text-muted-foreground mt-2">Position note within frame</p>
          </div>

          {/* Scanning frame */}
          <div className="absolute inset-[10%] border-2 border-dashed border-primary rounded-2xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-sm rounded-full">
              Scanning Area
            </div>
          </div>
        </div>

        <button className="btn-premium w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-lg flex items-center justify-center gap-2">
          <Scan className="w-5 h-5" />
          Scan Currency Note
        </button>
      </motion.div>

      {/* Result Card */}
      {scanResult && (
        <motion.div
          className={`glass-effect-strong rounded-3xl p-6 border-2 ${
            scanResult.status === "genuine"
              ? "border-[#10B981]/50"
              : "border-red-500/50"
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground">{scanResult.denomination} Note Detected</h3>
              <p className="text-sm text-muted-foreground mt-1">Confidence: {scanResult.confidence}</p>
            </div>
            {scanResult.status === "genuine" ? (
              <CheckCircle className="w-12 h-12 text-[#10B981]" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-red-500" />
            )}
          </div>

          <div className={`p-4 rounded-2xl ${
            scanResult.status === "genuine"
              ? "bg-[#10B981]/10 border border-[#10B981]/30"
              : "bg-red-500/10 border border-red-500/30"
          }`}>
            <div className="flex items-center gap-3">
              {scanResult.status === "genuine" ? (
                <CheckCircle className="w-6 h-6 text-[#10B981]" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
              <div>
                <p className={`font-semibold ${
                  scanResult.status === "genuine" ? "text-[#10B981]" : "text-red-500"
                }`}>
                  {scanResult.status === "genuine" ? "Genuine Currency" : "Potential Fake Note"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {scanResult.status === "genuine" 
                    ? "All security features verified successfully"
                    : "Please verify with authorities"
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-foreground">Security Features Checked</h4>
            {[
              { feature: "Watermark", status: true },
              { feature: "Security Thread", status: true },
              { feature: "Micro Text", status: true },
              { feature: "Color Shifting Ink", status: true },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <span className="text-sm text-foreground">{item.feature}</span>
                {item.status ? (
                  <CheckCircle className="w-5 h-5 text-[#10B981]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Scans */}
      <div className="glass-effect-strong rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Scans</h3>
        <div className="space-y-3">
          {recentScans.map((scan, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{scan.denomination}</p>
                  <p className="text-xs text-muted-foreground">{scan.time}</p>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-[#10B981]" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
