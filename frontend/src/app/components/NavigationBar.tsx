import { Menu } from "lucide-react";
import { RotatingGlobe } from "./RotatingGlobe";
import trinayLogo from "figma:asset/20e45a4dfcbedc09743df66eb823e247f91f0274.png";

interface NavigationBarProps {
  onMenuToggle: () => void;
}

export function NavigationBar({ onMenuToggle }: NavigationBarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 glass-effect-strong z-50 border-b border-border">
      <div className="h-full px-6 flex items-center justify-between max-w-[1920px] mx-auto">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl hover:bg-secondary transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          
          <div className="flex items-center gap-4">
            <img 
              src={trinayLogo} 
              alt="TRINAY Logo" 
              className="h-[240px] w-auto object-contain"
            />
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-tight">AI-Powered Assistive Vision System</h1>
              <p className="text-sm text-muted-foreground italic">From Darkness to Divine Insight</p>
            </div>
          </div>
        </div>

        {/* Right: Globe & User */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:block">
            <RotatingGlobe size="sm" />
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-secondary/50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
              R
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">Ramya</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}