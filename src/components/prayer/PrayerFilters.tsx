import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PrayerTheme } from '@/hooks/usePrayers';

interface PrayerFiltersProps {
  themes: PrayerTheme[];
  selectedTheme: string;
  onThemeChange: (themeId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PrayerFilters({
  themes,
  selectedTheme,
  onThemeChange,
  searchQuery,
  onSearchChange
}: PrayerFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pedidos de oração..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 pr-11 h-12 rounded-2xl bg-card shadow-card border-border/50 focus:shadow-elevated transition-shadow"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Theme filters */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          <Button
            variant={selectedTheme === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onThemeChange('all')}
            className={cn(
              "shrink-0 rounded-full px-5 font-medium transition-all duration-300",
              selectedTheme === 'all' 
                ? "bg-primary shadow-md hover:shadow-lg" 
                : "bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/50"
            )}
          >
            ✨ Todos
          </Button>
          
          {themes.map((theme) => (
            <Button
              key={theme.id}
              variant={selectedTheme === theme.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onThemeChange(theme.id)}
              className={cn(
                "shrink-0 rounded-full px-4 gap-1.5 font-medium transition-all duration-300",
                selectedTheme === theme.id 
                  ? "bg-primary shadow-md hover:shadow-lg" 
                  : "bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/50"
              )}
            >
              {theme.icon && <span>{theme.icon}</span>}
              {theme.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
