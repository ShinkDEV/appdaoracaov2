import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoAppDaOracao from '@/assets/logo-app-da-oracao.png';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
      <div className="px-4 sm:px-6 md:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={logoAppDaOracao}
              alt="App da Oração"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </Link>

          {/* Donate Button */}
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link to="/doar">
              <Heart className="h-4 w-4 text-primary" />
              Doar
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
