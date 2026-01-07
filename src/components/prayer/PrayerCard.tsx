import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { HandHeart, Pin, User, ChevronDown, ChevronUp } from 'lucide-react';
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
  
  const shouldTruncate = prayer.description.length > 150;
  const displayDescription = expanded || !shouldTruncate 
    ? prayer.description 
    : prayer.description.slice(0, 150) + '...';

  const timeAgo = formatDistanceToNow(new Date(prayer.created_at), {
    addSuffix: true,
    locale: ptBR
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className={cn(
      "shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in overflow-hidden",
      prayer.is_pinned && "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
    )}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-11 w-11 shrink-0 ring-2 ring-border/50">
              {prayer.author?.photo_url ? (
                <AvatarImage src={prayer.author.photo_url} alt={prayer.author.display_name || 'Usuário'} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-medium">
                {prayer.is_anonymous ? '🙏' : getInitials(prayer.author?.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate text-foreground">
                {prayer.is_anonymous ? 'Anônimo' : (prayer.author?.display_name || 'Usuário')}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {prayer.is_pinned && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0 gap-1">
                <Pin className="h-3 w-3" />
                Fixado
              </Badge>
            )}
          </div>
        </div>

        {/* Theme badge */}
        {theme && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs font-medium bg-secondary/50 border-border/50">
              {theme.icon} {theme.name}
            </Badge>
          </div>
        )}

        {/* Content */}
        <div className="space-y-2 mb-4">
          <h3 className="font-display font-semibold text-lg leading-tight text-foreground">
            {prayer.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {displayDescription}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-auto p-0 text-xs text-primary hover:bg-transparent hover:text-primary/80 font-medium"
            >
              {expanded ? (
                <>
                  Ver menos <ChevronUp className="h-3 w-3 ml-1" />
                </>
              ) : (
                <>
                  Ver mais <ChevronDown className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HandHeart className="h-4 w-4" />
            <span className="text-sm font-medium">
              {prayer.prayer_count} {prayer.prayer_count === 1 ? 'pessoa orou' : 'pessoas oraram'}
            </span>
          </div>
          
          <Button
            variant={prayer.has_prayed ? "default" : "outline"}
            size="sm"
            onClick={() => onPray(prayer.id)}
            className={cn(
              "gap-2 rounded-full px-5 transition-all duration-300 font-medium",
              prayer.has_prayed 
                ? "bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg" 
                : "hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            )}
          >
            <HandHeart className={cn(
              "h-4 w-4 transition-transform",
              prayer.has_prayed && "fill-current scale-110"
            )} />
            {prayer.has_prayed ? 'Orei! 🙏' : 'Orar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
