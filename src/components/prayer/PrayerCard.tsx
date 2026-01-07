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

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      prayer.is_pinned && "border-primary/50 bg-primary/5"
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10 shrink-0">
              {prayer.author?.photo_url ? (
                <AvatarImage src={prayer.author.photo_url} alt={prayer.author.display_name || 'Usuário'} />
              ) : null}
              <AvatarFallback className="bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">
                {prayer.is_anonymous ? 'Anônimo' : (prayer.author?.display_name || 'Usuário')}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {prayer.is_pinned && (
              <Pin className="h-4 w-4 text-primary" />
            )}
            {theme && (
              <Badge variant="secondary" className="text-xs">
                {theme.icon} {theme.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <h3 className="font-semibold text-base leading-tight">{prayer.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {displayDescription}
          </p>
          
          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-auto p-0 text-xs text-primary hover:bg-transparent"
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
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-sm text-muted-foreground">
            {prayer.prayer_count} {prayer.prayer_count === 1 ? 'pessoa orou' : 'pessoas oraram'}
          </span>
          
          <Button
            variant={prayer.has_prayed ? "default" : "outline"}
            size="sm"
            onClick={() => onPray(prayer.id)}
            className={cn(
              "gap-2 transition-all",
              prayer.has_prayed && "bg-primary hover:bg-primary/90"
            )}
          >
            <HandHeart className={cn(
              "h-4 w-4",
              prayer.has_prayed && "fill-current"
            )} />
            {prayer.has_prayed ? 'Orei' : 'Orar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
