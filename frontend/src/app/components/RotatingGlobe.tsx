import { motion } from "motion/react";

interface RotatingGlobeProps {
  size?: "sm" | "md" | "lg";
}

export function RotatingGlobe({ size = "md" }: RotatingGlobeProps) {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <motion.div
      className={`${sizes[size]} perspective-container`}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full h-full relative rotate-slow"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Outer sphere */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary opacity-80 shadow-2xl shadow-primary/50">
          {/* Neural network lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            
            {/* Meridian lines */}
            <ellipse cx="50" cy="50" rx="40" ry="40" fill="none" stroke="url(#lineGradient)" strokeWidth="0.5" />
            <ellipse cx="50" cy="50" rx="30" ry="40" fill="none" stroke="url(#lineGradient)" strokeWidth="0.5" />
            <ellipse cx="50" cy="50" rx="15" ry="40" fill="none" stroke="url(#lineGradient)" strokeWidth="0.5" />
            
            {/* Latitude lines */}
            <line x1="10" y1="50" x2="90" y2="50" stroke="url(#lineGradient)" strokeWidth="0.5" />
            <ellipse cx="50" cy="50" rx="40" ry="20" fill="none" stroke="url(#lineGradient)" strokeWidth="0.5" />
            <ellipse cx="50" cy="50" rx="40" ry="10" fill="none" stroke="url(#lineGradient)" strokeWidth="0.5" />
            
            {/* Neural nodes */}
            <circle cx="50" cy="15" r="2" fill="#ffffff" opacity="0.8" />
            <circle cx="20" cy="35" r="2" fill="#ffffff" opacity="0.8" />
            <circle cx="80" cy="35" r="2" fill="#ffffff" opacity="0.8" />
            <circle cx="50" cy="50" r="3" fill="#ffffff" opacity="1" />
            <circle cx="20" cy="65" r="2" fill="#ffffff" opacity="0.8" />
            <circle cx="80" cy="65" r="2" fill="#ffffff" opacity="0.8" />
            <circle cx="50" cy="85" r="2" fill="#ffffff" opacity="0.8" />
          </svg>
        </div>
        
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-white/20 blur-sm"></div>
      </motion.div>
    </motion.div>
  );
}
