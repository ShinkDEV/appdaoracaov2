import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  className,
  size = 'md',
  text = 'Carregando...'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className={cn(
        "animate-spin rounded-full border-2 border-primary/20 border-t-primary",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

export const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading size="lg" />
    </div>
  );
};

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn(
      "animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent",
      className
    )} />
  );
};
