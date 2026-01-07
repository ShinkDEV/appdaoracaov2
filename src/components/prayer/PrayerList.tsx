import { useEffect, useRef, useCallback } from 'react';
import { PrayerCard } from './PrayerCard';
import { Loading } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { BookHeart, RefreshCw } from 'lucide-react';
import type { PrayerRequest, PrayerTheme } from '@/hooks/usePrayers';

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
      <div className="flex flex-col items-center justify-center py-16">
        <Loading text="Carregando pedidos de oração..." />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
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
        <div className="flex justify-center py-8">
          <Loading text="Carregando mais..." />
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
