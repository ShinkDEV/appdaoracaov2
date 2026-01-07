import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePrayers } from '@/hooks/usePrayers';
import { PrayerFilters, PrayerList } from '@/components/prayer';
import { BannerCarousel } from '@/components/banner';
import { UpdatesModal, useUpdatesModal } from '@/components/updates';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  image_url: string;
  mobile_image_url: string | null;
  title: string | null;
  link: string | null;
}

export default function Index() {
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_prayed'>('newest');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [banners, setBanners] = useState<Banner[]>([]);
  
  const { showUpdates, setShowUpdates } = useUpdatesModal();

  const {
    prayers,
    themes,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    togglePrayer
  } = usePrayers({
    themeFilter: selectedTheme,
    searchQuery: debouncedSearch
  });

  useEffect(() => {
    async function fetchBanners() {
      const { data } = await supabase
        .from('banners')
        .select('id, image_url, mobile_image_url, title, link')
        .eq('is_active', true)
        .order('display_order');
      
      if (data) {
        setBanners(data);
      }
    }
    
    fetchBanners();
  }, []);

  // Sort prayers based on selected option
  const sortedPrayers = [...prayers].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'most_prayed':
        return b.prayer_count - a.prayer_count;
      case 'newest':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Updates Modal */}
      <UpdatesModal open={showUpdates} onOpenChange={setShowUpdates} />

      {/* Hero Banner */}
      {banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : (
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[hsl(217,91%,60%)] via-[hsl(199,89%,55%)] to-[hsl(190,90%,50%)]">
          <div className="relative py-12 md:py-20 px-6 text-center">
            <h1 className="text-xl md:text-4xl font-bold text-white leading-tight">
              <span className="text-[hsl(190,100%,80%)]">O primeiro app</span> que conecta<br />
              oração e propósito
            </h1>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pedidos de Oração</h2>
          <p className="text-sm text-muted-foreground">
            {prayers.length} pedidos ativos
          </p>
        </div>
        
        {/* Search - Desktop */}
        <div className="hidden md:block w-72">
          <div className="relative">
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 h-11 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <PrayerFilters
        themes={themes}
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Prayer List */}
      <PrayerList
        prayers={sortedPrayers}
        themes={themes}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRefresh={refresh}
        onPray={togglePrayer}
      />
    </div>
  );
}
