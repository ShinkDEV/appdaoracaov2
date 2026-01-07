import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, X, Clock, ArrowUpDown, HandHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PrayerTheme } from '@/hooks/usePrayers';

interface PrayerFiltersProps {
  themes: PrayerTheme[];
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy?: 'newest' | 'oldest' | 'most_prayed';
  onSortChange?: (sort: 'newest' | 'oldest' | 'most_prayed') => void;
}

export function PrayerFilters({
  themes,
  selectedTheme,
  onThemeChange,
  searchQuery,
  onSearchChange,
  sortBy = 'newest',
  onSortChange
}: PrayerFiltersProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search - Mobile only */}
      <div className="relative md:hidden">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 h-11 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
        {searchQuery && (
          <button
            className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Theme filters */}
      <ScrollArea className="w-full whitespace-nowrap -mx-1 px-1">
        <div className="flex gap-1.5 sm:gap-2 pb-2">
          <button
            onClick={() => onThemeChange('all')}
            className={cn(
              "shrink-0 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border",
              selectedTheme === 'all' 
                ? "bg-primary/10 text-primary border-primary/30" 
                : "bg-card text-muted-foreground border-border/50 hover:border-primary/30 hover:text-primary"
            )}
          >
            Todos
          </button>
          
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={cn(
                "shrink-0 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 border",
                selectedTheme === theme.id 
                  ? "bg-primary/10 text-primary border-primary/30" 
                  : "bg-card text-muted-foreground border-border/50 hover:border-primary/30 hover:text-primary"
              )}
            >
              {theme.name}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      {/* Sort buttons */}
      {onSortChange && (
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => onSortChange('newest')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200",
              sortBy === 'newest' 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30"
            )}
          >
            <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
            + Novos
          </button>
          
          <button
            onClick={() => onSortChange('oldest')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200",
              sortBy === 'oldest' 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30"
            )}
          >
            <ArrowUpDown className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
            + Antigos
          </button>
          
          <button
            onClick={() => onSortChange('most_prayed')}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200",
              sortBy === 'most_prayed' 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-card text-muted-foreground border border-border/50 hover:border-primary/30"
            )}
          >
            <HandHeart className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
            + Orados
          </button>
        </div>
      )}
    </div>
  );
}
