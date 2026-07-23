import React from 'react';
import { Link } from 'react-router-dom';
import logoAppDaOracao from '@/assets/logo-app-da-oracao.png';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 pt-safe">
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logoAppDaOracao}
              alt="App da Oração"
              width={160}
              height={40}
              fetchPriority="high"
              decoding="async"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};
