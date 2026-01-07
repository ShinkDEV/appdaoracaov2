import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HandHeart, Pin, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { PrayerRequest, PrayerTheme } from '@/hooks/usePrayers';

interface PrayerCardProps {
  prayer: PrayerRequest;
  theme?: PrayerTheme;
  onPray: (prayerId: string) => void;
}

export function PrayerCard({ prayer, theme, onPray }: PrayerCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const shouldTruncate = prayer.description.length > 100;
  const displayDescription = expanded || !shouldTruncate 
    ? prayer.description 
    : prayer.description.slice(0, 100) + '...';

  const timeAgo = formatDistanceToNow(new Date(prayer.created_at), {
    addSuffix: false,
    locale: ptBR
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={cn(
      "bg-card rounded-2xl p-5 shadow-card transition-all duration-300 animate-fade-in border border-border/30",
      prayer.is_pinned && "ring-1 ring-primary/20"
    )}>
      {/* Badges row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {prayer.is_pinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-600 border border-rose-200">
              <Pin className="h-3 w-3" />
              Fixado
            </span>
          )}
          {theme && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              {theme.name}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">
          há {timeAgo}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base text-foreground mb-2 leading-tight">
        {prayer.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {displayDescription}
        {shouldTruncate && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-primary hover:text-primary/80 ml-1 font-medium"
          >
            Ver mais
          </button>
        )}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            {prayer.author?.photo_url ? (
              <AvatarImage src={prayer.author.photo_url} alt={prayer.author.display_name || 'Usuário'} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-medium">
              {prayer.is_anonymous ? '🙏' : getInitials(prayer.author?.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">
            {prayer.is_anonymous ? 'Anônimo' : (prayer.author?.display_name || 'App da Oração')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPray(prayer.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              prayer.has_prayed 
                ? "bg-rose-100 text-rose-600 border border-rose-200" 
                : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-primary"
            )}
          >
            <HandHeart className={cn(
              "h-4 w-4",
              prayer.has_prayed && "fill-current"
            )} />
            {prayer.has_prayed ? 'Orando' : 'Orar'}
            {prayer.prayer_count > 0 && (
              <span className="ml-0.5">({prayer.prayer_count})</span>
            )}
          </button>
          
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
