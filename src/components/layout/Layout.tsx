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
      <main className="flex-1 pb-24 md:pb-0">
        {children}
      </main>
      <footer className="hidden md:block border-t border-border/30 py-8 mt-auto bg-card/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} App da Oração
          </p>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
};
