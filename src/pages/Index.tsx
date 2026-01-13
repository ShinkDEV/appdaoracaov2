import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { usePrayers } from '@/hooks/usePrayers';
import { useAuth } from '@/contexts/AuthContext';
import { PrayerFilters, PrayerList } from '@/components/prayer';
import { BannerCarousel } from '@/components/banner';
import { TypewriterText } from '@/components/banner/TypewriterText';
import { UpdatesModal, useUpdatesModal } from '@/components/updates';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Search, LogIn } from 'lucide-react';

interface Banner {
  id: string;
  image_url: string;
  mobile_image_url: string | null;
  title: string | null;
  link: string | null;
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Sort prayers based on selected option (keep pinned items on top)
  const sortedPrayers = [...prayers].sort((a, b) => {
    // Pinned items always come first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    // Then sort by selected criteria
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
    <div className="space-y-4 sm:space-y-6">
      {/* Updates Modal */}
      <UpdatesModal open={showUpdates} onOpenChange={setShowUpdates} />

      {/* Hero Banner */}
      {banners.length > 0 ? (
        <BannerCarousel banners={banners} className="rounded-xl overflow-hidden" />
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-[hsl(217,91%,60%)] via-[hsl(199,89%,55%)] to-[hsl(190,90%,50%)]">
          <div className="relative py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 text-center">
            <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white leading-relaxed">
              <span className="text-[hsl(190,100%,85%)]">O primeiro app</span> que conecta
            </h1>
            <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-white leading-relaxed">
              propósito e oração por <TypewriterText />
            </h1>
          </div>
        </div>
      )}

      {/* Login Button for non-authenticated users */}
      {!user && (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => navigate('/auth')}
              className="gap-2"
              size="lg"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <LogIn className="h-5 w-5" />
              </motion.div>
              Entrar agora
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Pedidos de Oração</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {prayers.length} pedidos ativos
            </p>
          </div>
          
          {/* Search - Tablet/Desktop */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 lg:w-64 pl-10 pr-4 h-10 rounded-xl bg-card border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm"
              />
            </div>
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
