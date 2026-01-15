import { useEffect, useRef, useCallback } from 'react';
import { PrayerCard } from './PrayerCard';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookHeart, RefreshCw } from 'lucide-react';
import type { PrayerRequest, PrayerTheme } from '@/hooks/usePrayers';

function PrayerCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

interface PrayerListProps {
  prayers: PrayerRequest[];
  themes: PrayerTheme[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onPray: (prayerId: string) => void;
}

export function PrayerList({
  prayers,
  themes,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onRefresh,
  onPray
}: PrayerListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const getThemeById = useCallback((themeId: string) => {
    return themes.find(t => t.id === themeId);
  }, [themes]);

  // Infinite scroll
  useEffect(() => {
    if (loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
            <PrayerCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (prayers.length === 0) {
    return (
      <EmptyState
        icon={<BookHeart className="h-16 w-16" />}
        title="Nenhum pedido encontrado"
        description="Não há pedidos de oração no momento. Seja o primeiro a compartilhar!"
        action={
          <Button onClick={onRefresh} variant="outline" className="gap-2 rounded-full">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        }
        className="py-16"
      />
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {prayers.map((prayer, index) => (
          <div 
            key={prayer.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <PrayerCard
              prayer={prayer}
              theme={getThemeById(prayer.theme_id)}
              onPray={onPray}
            />
          </div>
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-4 mt-6" />

      {loadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PrayerCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}

      {!hasMore && prayers.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">
          Você chegou ao fim! 🙏
        </p>
      )}
    </div>
  );
}
