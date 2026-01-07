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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar pedidos de oração..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
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
            className="shrink-0"
          >
            Todos
          </Button>
          
          {themes.map((theme) => (
            <Button
              key={theme.id}
              variant={selectedTheme === theme.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => onThemeChange(theme.id)}
              className={cn(
                "shrink-0 gap-1.5",
                selectedTheme === theme.id && "bg-primary"
              )}
            >
              {theme.icon && <span>{theme.icon}</span>}
              {theme.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
