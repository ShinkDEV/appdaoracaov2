import React from 'react';
import { Link } from 'react-router-dom';
import logoAppDaOracao from '@/assets/logo-app-da-oracao.png';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 xl:hidden">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logoAppDaOracao}
              alt="App da Oração"
              className="h-9 sm:h-10 w-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};
