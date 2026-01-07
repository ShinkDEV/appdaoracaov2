import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile/Tablet Header */}
        <Header />
        
        <main className="flex-1 w-full mx-auto px-4 sm:px-6 md:px-8 xl:px-10 py-4 sm:py-6 pb-24 xl:pb-10 max-w-[1400px]">
          {children}
        </main>
        
        <footer className="hidden xl:block border-t border-border/30 py-4 lg:py-6 mt-auto bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © {new Date().getFullYear()} App da Oração • Unindo pessoas em oração
            </p>
          </div>
        </footer>
      </div>
      
      {/* Mobile/Tablet Bottom Nav */}
      <BottomNav />
    </div>
  );
};
