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
    return <Loading text="Carregando pedidos de oração..." />;
  }

  if (prayers.length === 0) {
    return (
      <EmptyState
        icon={<BookHeart className="h-12 w-12" />}
        title="Nenhum pedido encontrado"
        description="Não há pedidos de oração no momento. Seja o primeiro a compartilhar!"
        action={
          <Button onClick={onRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {prayers.map((prayer) => (
        <PrayerCard
          key={prayer.id}
          prayer={prayer}
          theme={getThemeById(prayer.theme_id)}
          onPray={onPray}
        />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-4" />

      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loading text="Carregando mais..." />
        </div>
      )}

      {!hasMore && prayers.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Você chegou ao fim 🙏
        </p>
      )}
    </div>
  );
}
