import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePrayers } from '@/hooks/usePrayers';
import { PrayerFilters, PrayerList } from '@/components/prayer';
import { supabase } from '@/integrations/supabase/client';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

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
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

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

  const handleBannerClick = (link: string | null) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banners Carousel */}
      {banners.length > 0 && (
        <Carousel
          plugins={[autoplayPlugin.current]}
          className="w-full"
          opts={{
            loop: true,
            align: 'start'
          }}
        >
          <CarouselContent>
            {banners.map((banner) => (
              <CarouselItem key={banner.id}>
                <div 
                  className={`relative aspect-[21/9] md:aspect-[3/1] rounded-lg overflow-hidden ${banner.link ? 'cursor-pointer' : ''}`}
                  onClick={() => handleBannerClick(banner.link)}
                >
                  <picture>
                    {banner.mobile_image_url && (
                      <source media="(max-width: 768px)" srcSet={banner.mobile_image_url} />
                    )}
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Banner'}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}

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
