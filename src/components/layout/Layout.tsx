import React from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-4 sm:py-6 pb-24 sm:pb-28 md:pb-10 max-w-[1400px]">
        {children}
      </main>
      <footer className="hidden md:block border-t border-border/30 py-4 lg:py-6 mt-auto bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} App da Oração • Unindo pessoas em oração
          </p>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
};
