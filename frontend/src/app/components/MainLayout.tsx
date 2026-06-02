import { Outlet } from "react-router";
import { NavigationBar } from "./NavigationBar";
import { Sidebar } from "./Sidebar";
import { useState } from "react";

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background relative">
      <NavigationBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex pt-20">
        <Sidebar isOpen={sidebarOpen} />
        
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'ml-0'
          } p-6 lg:p-8`}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border-t border-border z-10">
        Major Final Year Project 2026 • Built for Social Impact
      </footer>
    </div>
  );
}