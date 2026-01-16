import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - Only visible on screens >= 1280px */}
      <div className="hidden xl:block fixed left-0 top-0 h-full z-40">
        <Sidebar />
      </div>
      
      {/* Main Content Wrapper */}
      <div className="xl:pl-64">
        {/* Mobile/Tablet Header - Hidden on desktop */}
        <div className="xl:hidden">
          <Header />
        </div>
        
        {/* Main Content */}
        <main className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 pb-28 xl:pb-8 max-w-[1200px] mx-auto">
          {children}
        </main>
        
        {/* Desktop Footer */}
        <footer className="hidden xl:block border-t border-border/30 py-6 bg-muted/30">
          <div className="max-w-[1200px] mx-auto px-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} App da Oração • Unindo pessoas em oração
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <a href="/termos" className="hover:text-foreground transition-colors">Termos de Uso</a>
              <span>•</span>
              <a href="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</a>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Mobile/Tablet Bottom Nav - Hidden on desktop */}
      <div className="xl:hidden">
        <BottomNav />
      </div>
    </div>
  );
};
