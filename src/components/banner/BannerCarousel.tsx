import { useRef, useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

interface Banner {
  id: string;
  image_url: string;
  mobile_image_url: string | null;
  title: string | null;
  link: string | null;
}

interface BannerCarouselProps {
  banners: Banner[];
  className?: string;
}

export function BannerCarousel({ banners, className }: BannerCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleBannerClick = (link: string | null) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (banners.length === 0) {
    // Default hero banner when no banners from database
    return (
      <div className={cn("relative w-full rounded-2xl overflow-hidden", className)}>
        <div className="relative bg-gradient-to-r from-[hsl(217,91%,60%)] via-[hsl(199,89%,55%)] to-[hsl(190,90%,50%)] py-12 md:py-20 px-6 text-center">
          <h1 className="text-xl md:text-4xl font-bold text-white leading-tight">
            <span className="text-[hsl(190,100%,80%)]">O primeiro app</span> que conecta<br />
            oração e propósito
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Carousel
        setApi={setApi}
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
                className={cn(
                  "relative aspect-[16/7] md:aspect-[3/1] rounded-2xl overflow-hidden",
                  banner.link && "cursor-pointer"
                )}
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
                    loading="lazy"
                  />
                </picture>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                current === index 
                  ? "bg-white w-4" 
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
