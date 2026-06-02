import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  gradient?: string;
  onClick?: () => void;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  badge, 
  badgeColor = "bg-accent",
  gradient = "from-primary to-accent",
  onClick 
}: FeatureCardProps) {
  return (
    <motion.div
      className="card-3d glass-effect-strong rounded-3xl p-6 cursor-pointer relative overflow-hidden group"
      whileHover={{ 
        y: -8,
        rotateY: 5,
        rotateX: 5,
      }}
      transition={{ 
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1]
      }}
      onClick={onClick}
    >
      {/* Background gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Badge */}
      {badge && (
        <div className={`absolute top-4 right-4 ${badgeColor} text-white text-xs font-medium px-3 py-1 rounded-full`}>
          {badge}
        </div>
      )}
      
      {/* Icon container with 3D effect */}
      <motion.div
        className="relative mb-4"
        whileHover={{ 
          scale: 1.1,
          rotateY: 15,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-primary/30 float-animation`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      
      {/* Bottom accent line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
    </motion.div>
  );
}
