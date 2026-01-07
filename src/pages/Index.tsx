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

  return (
    <div className="space-y-6">
      {/* Updates Modal */}
      <UpdatesModal open={showUpdates} onOpenChange={setShowUpdates} />

      {/* Banners Carousel */}
      <BannerCarousel banners={banners} />

      {/* Filters */}
      <PrayerFilters
        themes={themes}
        selectedTheme={selectedTheme}
        onThemeChange={setSelectedTheme}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Prayer List */}
      <PrayerList
        prayers={prayers}
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
