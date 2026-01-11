import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const sizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function VerifiedBadge({ className, size = 'md', showTooltip = true }: VerifiedBadgeProps) {
  const badge = (
    <BadgeCheck 
      className={cn(
        sizeClasses[size],
        'text-primary fill-primary/20 shrink-0',
        className
      )} 
    />
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{badge}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>Perfil verificado</p>
      </TooltipContent>
    </Tooltip>
  );
}
