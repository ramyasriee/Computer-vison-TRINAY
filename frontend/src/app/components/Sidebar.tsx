import { NavLink } from "react-router";
import { 
  Home, 
  Camera, 
  Scan, 
  Banknote, 
  BookOpen, 
  Sparkles, 
  Shield, 
  FileText, 
  Settings as SettingsIcon 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/live-camera", label: "Live Camera", icon: Camera },
  { path: "/object-detection", label: "Object Detection", icon: Scan },
  { path: "/currency-detection", label: "Currency Detection", icon: Banknote },
  { path: "/text-reader", label: "Text Reader (OCR)", icon: BookOpen },
  { path: "/scene-summary", label: "Scene Summary", icon: Sparkles },
  { path: "/safety-mode", label: "Safety Mode", icon: Shield },
  { path: "/reports", label: "Reports & Logs", icon: FileText },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => {}}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 glass-effect-strong border-r border-border transition-transform duration-300 z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : 'text-foreground hover:bg-secondary/70 hover:translate-x-1'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'scale-110' : ''
                      }`} 
                    />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
