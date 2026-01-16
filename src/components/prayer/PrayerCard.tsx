import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HandHeart, Pin, ChevronDown, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/ui/verified-badge';
import { trackPrayerInteraction } from '@/lib/analytics';
import type { PrayerRequest, PrayerTheme } from '@/hooks/usePrayers';

interface PrayerCardProps {
  prayer: PrayerRequest;
  theme?: PrayerTheme;
  onPray: (prayerId: string) => void;
}

export function PrayerCard({ prayer, theme, onPray }: PrayerCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const shouldTruncate = prayer.description.length > 80;
  const displayDescription = expanded || !shouldTruncate 
    ? prayer.description 
    : prayer.description.slice(0, 80) + '...';

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
      "bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-border/40 h-full flex flex-col",
      prayer.is_pinned && "ring-1 ring-rose-200 bg-gradient-to-br from-rose-50/50 to-transparent dark:from-rose-950/20"
    )}>
      {/* Badges row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {prayer.is_pinned && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800">
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
        <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
          há {timeAgo}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base text-foreground mb-2 leading-snug line-clamp-2">
        {prayer.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
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
      <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-background shadow-sm">
            {prayer.author?.photo_url ? (
              <AvatarImage src={prayer.author.photo_url} alt={prayer.author.display_name || 'Usuário'} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-xs font-medium">
              {prayer.is_anonymous ? '🙏' : getInitials(prayer.author?.display_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className={cn(
                "text-sm font-medium truncate",
                !prayer.is_anonymous && prayer.author?.is_supporter 
                  ? "text-[hsl(var(--supporter))]" 
                  : "text-foreground"
              )}>
                {prayer.is_anonymous ? 'Anônimo' : (prayer.author?.display_name || 'App da Oração')}
              </span>
              {!prayer.is_anonymous && prayer.author?.verified && (
                <VerifiedBadge size="sm" />
              )}
            </div>
            {!prayer.is_anonymous && prayer.author?.is_supporter && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium bg-[hsl(var(--supporter-light))] text-[hsl(var(--supporter))] border-[hsl(var(--supporter)/0.3)] gap-0.5 w-fit">
                <Heart className="h-2.5 w-2.5 fill-current" />
                Apoiador
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              trackPrayerInteraction(prayer.id, 'pray');
              onPray(prayer.id);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              prayer.has_prayed 
                ? "bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800" 
                : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-primary hover:bg-primary/5"
            )}
          >
            <HandHeart className={cn(
              "h-4 w-4",
              prayer.has_prayed && "fill-current"
            )} />
            {prayer.has_prayed ? 'Orando' : 'Orar'}
            {prayer.prayer_count > 0 && (
              <span className="text-xs">({prayer.prayer_count})</span>
            )}
          </button>
          
          <button className="p-1.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors rounded-full hover:bg-muted/50">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
