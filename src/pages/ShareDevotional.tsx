import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { ArrowLeft, Download, Share2, Loader2, Instagram, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevotionals } from '@/hooks/useDevotionals';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import bgStream from '@/assets/story-bg-stream.jpg';
import bgSunset from '@/assets/story-bg-sunset.jpg';
import bgMountains from '@/assets/story-bg-mountains.jpg';
import bgWheat from '@/assets/story-bg-wheat.jpg';
import bgForest from '@/assets/story-bg-forest.jpg';

type Theme = {
  id: string;
  name: string;
  background: string;
  textColor: string;
  accentColor: string;
  mutedColor: string;
  borderColor: string;
  glow1: string;
  glow2: string;
  fontFamily?: string;
  image?: string;
  overlay?: string;
};

const THEMES: Theme[] = [
  {
    id: 'midnight',
    name: 'Meia-noite',
    background: 'linear-gradient(160deg, #1e3a8a 0%, #0f172a 50%, #0c4a6e 100%)',
    textColor: '#ffffff',
    accentColor: '#93c5fd',
    mutedColor: 'rgba(255,255,255,0.7)',
    borderColor: 'rgba(255,255,255,0.15)',
    glow1: 'rgba(96,165,250,0.35)',
    glow2: 'rgba(20,184,166,0.25)',
  },
  {
    id: 'sunrise',
    name: 'Amanhecer',
    background: 'linear-gradient(160deg, #f59e0b 0%, #ea580c 50%, #be123c 100%)',
    textColor: '#ffffff',
    accentColor: '#fef3c7',
    mutedColor: 'rgba(255,255,255,0.85)',
    borderColor: 'rgba(255,255,255,0.25)',
    glow1: 'rgba(254,243,199,0.4)',
    glow2: 'rgba(251,113,133,0.3)',
  },
  {
    id: 'sage',
    name: 'Oliveira',
    background: 'linear-gradient(160deg, #064e3b 0%, #065f46 50%, #1e3a2b 100%)',
    textColor: '#ffffff',
    accentColor: '#86efac',
    mutedColor: 'rgba(255,255,255,0.75)',
    borderColor: 'rgba(255,255,255,0.15)',
    glow1: 'rgba(134,239,172,0.3)',
    glow2: 'rgba(250,204,21,0.2)',
  },
  {
    id: 'paper',
    name: 'Papel',
    background: 'linear-gradient(160deg, #fafaf9 0%, #f5f5f4 50%, #e7e5e4 100%)',
    textColor: '#1c1917',
    accentColor: '#9a3412',
    mutedColor: 'rgba(28,25,23,0.65)',
    borderColor: 'rgba(28,25,23,0.12)',
    glow1: 'rgba(251,191,36,0.18)',
    glow2: 'rgba(180,83,9,0.12)',
    fontFamily: '"DM Sans", "Inter", system-ui, serif',
  },
  {
    id: 'royal',
    name: 'Real',
    background: 'linear-gradient(160deg, #4c1d95 0%, #1e1b4b 50%, #312e81 100%)',
    textColor: '#ffffff',
    accentColor: '#fcd34d',
    mutedColor: 'rgba(255,255,255,0.75)',
    borderColor: 'rgba(252,211,77,0.25)',
    glow1: 'rgba(252,211,77,0.25)',
    glow2: 'rgba(167,139,250,0.3)',
  },
  {
    id: 'ocean',
    name: 'Oceano',
    background: 'linear-gradient(160deg, #0c4a6e 0%, #0e7490 50%, #134e4a 100%)',
    textColor: '#ffffff',
    accentColor: '#a5f3fc',
    mutedColor: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(255,255,255,0.18)',
    glow1: 'rgba(165,243,252,0.3)',
    glow2: 'rgba(94,234,212,0.25)',
  },
  // Naturais (foto de fundo)
  {
    id: 'riacho',
    name: 'Riacho',
    background: '#0a1a14',
    image: bgStream,
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.75) 100%)',
    textColor: '#ffffff',
    accentColor: '#bbf7d0',
    mutedColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(255,255,255,0.25)',
    glow1: 'transparent',
    glow2: 'transparent',
  },
  {
    id: 'por-do-sol',
    name: 'Pôr do sol',
    background: '#2a1410',
    image: bgSunset,
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.8) 100%)',
    textColor: '#ffffff',
    accentColor: '#fed7aa',
    mutedColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(255,255,255,0.3)',
    glow1: 'transparent',
    glow2: 'transparent',
  },
  {
    id: 'montanha',
    name: 'Montanha',
    background: '#1a1a2e',
    image: bgMountains,
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.8) 100%)',
    textColor: '#ffffff',
    accentColor: '#fde68a',
    mutedColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(255,255,255,0.3)',
    glow1: 'transparent',
    glow2: 'transparent',
  },
  {
    id: 'trigal',
    name: 'Trigal',
    background: '#2a1f10',
    image: bgWheat,
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.82) 100%)',
    textColor: '#ffffff',
    accentColor: '#fde68a',
    mutedColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(255,255,255,0.3)',
    glow1: 'transparent',
    glow2: 'transparent',
  },
  {
    id: 'floresta',
    name: 'Floresta',
    background: '#0e1a0e',
    image: bgForest,
    overlay: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.8) 100%)',
    textColor: '#ffffff',
    accentColor: '#bbf7d0',
    mutedColor: 'rgba(255,255,255,0.95)',
    borderColor: 'rgba(255,255,255,0.3)',
    glow1: 'transparent',
    glow2: 'transparent',
  },
];

const imageDataUrlCache = new Map<string, string>();

async function imageUrlToDataUrl(src: string) {
  if (src.startsWith('data:')) return src;
  const absoluteSrc = new URL(src, window.location.href).href;
  const cached = imageDataUrlCache.get(absoluteSrc);
  if (cached) return cached;

  const response = await fetch(absoluteSrc, { cache: 'force-cache' });
  if (!response.ok) throw new Error('Não foi possível carregar a imagem de fundo');

  const blob = await response.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  imageDataUrlCache.set(absoluteSrc, dataUrl);
  return dataUrl;
}

async function waitForImage(img: HTMLImageElement) {
  if (img.complete && img.naturalWidth > 0) return;
  if (img.decode) {
    await img.decode().catch(() => undefined);
    return;
  }
  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

export default function ShareDevotional() {
  const navigate = useNavigate();
  const { daily, loading } = useDevotionals();
  const storyRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [theme, setTheme] = useState<Theme>(THEMES[0]);

  useEffect(() => {
    if (!loading && !daily) {
      toast.error('Nenhum devocional disponível para hoje');
    }
  }, [loading, daily]);

  const generateImage = async () => {
    if (!storyRef.current) return null;

    const imgs = Array.from(storyRef.current.querySelectorAll('img'));
    const restoreImages = await Promise.all(
      imgs.map(async (img) => {
        const originalSrc = img.getAttribute('src');
        if (!originalSrc) return () => undefined;
        const dataUrl = await imageUrlToDataUrl(originalSrc);
        img.setAttribute('src', dataUrl);
        await waitForImage(img);
        return () => img.setAttribute('src', originalSrc);
      }),
    );

    try {
      await Promise.all(imgs.map(waitForImage));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      // Roda duas vezes — primeira render pode falhar em inlinar fontes/imagens
      await toPng(storyRef.current, { cacheBust: true, pixelRatio: 1, width: 1080, height: 1920 });
      return await toPng(storyRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1080,
        height: 1920,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
      });
    } finally {
      restoreImages.forEach((restore) => restore());
    }
  };

  const handleDownload = async () => {
    try {
      setGenerating(true);
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `palavra-do-dia-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Imagem baixada! Compartilhe nos seus stories 🙌');
    } catch (e) {
      toast.error('Erro ao gerar imagem');
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      setGenerating(true);
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'palavra-do-dia.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Palavra do dia — @appdaoracao',
          text: 'Leia a palavra do dia em https://apdaoracao.com',
        });
      } else {
        handleDownload();
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') toast.error('Erro ao compartilhar');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <SEO
        title="Compartilhar Palavra do Dia | App da Oração"
        description="Compartilhe o devocional do dia nos seus stories do Instagram."
        path="/palavra/compartilhar"
      />

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Instagram className="h-4 w-4" />
            Story 9:16
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Compartilhar nos Stories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha um tema, baixe e marque <span className="font-semibold text-primary">@appdaoracao</span>
          </p>
        </div>

        {loading ? (
          <div className="aspect-[9/16] rounded-2xl bg-muted animate-pulse" />
        ) : daily ? (
          <>
            {/* Preview escalado */}
            <div className="rounded-2xl overflow-hidden shadow-2xl mx-auto" style={{ width: '100%', maxWidth: 360 }}>
              <div style={{ width: 360, height: 640 }}>
                <StoryCard
                  title={daily.title}
                  verseText={daily.verse_text}
                  verseRef={daily.verse_reference}
                  scale={360 / 1080}
                  theme={theme}
                />
              </div>
            </div>

            {/* Seletor de temas */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Tema</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all',
                      theme.id === t.id
                        ? 'border-primary ring-2 ring-primary/30 scale-105'
                        : 'border-border hover:border-primary/50',
                    )}
                    style={{
                      backgroundColor: t.background.startsWith('#') ? t.background : '#000',
                      backgroundImage: t.image ? `url(${t.image})` : t.background.startsWith('linear') ? t.background : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    aria-label={`Tema ${t.name}`}
                  >
                    {theme.id === t.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Check className="h-4 w-4 text-white drop-shadow" />
                      </div>
                    )}
                    <span
                      className="absolute bottom-0 inset-x-0 text-[9px] font-medium py-0.5 text-center"
                      style={{
                        color: t.textColor,
                        background: 'rgba(0,0,0,0.25)',
                      }}
                    >
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas oculto em tamanho real */}
            <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
              <div ref={storyRef} style={{ width: 1080, height: 1920 }}>
                <StoryCard
                  title={daily.title}
                  verseText={daily.verse_text}
                  verseRef={daily.verse_reference}
                  scale={1}
                  theme={theme}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleShare} disabled={generating} className="gap-2" size="lg">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                Compartilhar
              </Button>
              <Button onClick={handleDownload} disabled={generating} variant="outline" className="gap-2" size="lg">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Baixar PNG
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Dica: no Instagram, abra os Stories, escolha a imagem da galeria e marque <strong>@appdaoracao</strong>.
            </p>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum devocional disponível.
          </div>
        )}
      </div>
    </div>
  );
}

function StoryCard({
  title,
  verseText,
  verseRef,
  scale,
  theme,
}: {
  title: string;
  verseText: string | null;
  verseRef: string | null;
  scale: number;
  theme: Theme;
}) {
  const s = (n: number) => `${n * scale}px`;
  return (
    <div
      style={{
        width: 1080 * scale,
        height: 1920 * scale,
        position: 'relative',
        overflow: 'hidden',
        background: theme.background,
        color: theme.textColor,
        fontFamily: theme.fontFamily || '"Inter", "DM Sans", system-ui, sans-serif',
      }}
    >
      {theme.image && (
        <>
          <img
            src={theme.image}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {theme.overlay && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: theme.overlay,
              }}
            />
          )}
        </>
      )}
      {!theme.image && (
        <>
          <div
            style={{
              position: 'absolute',
              top: -200 * scale,
              right: -200 * scale,
              width: 700 * scale,
              height: 700 * scale,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.glow1}, transparent 70%)`,
              filter: `blur(${60 * scale}px)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -250 * scale,
              left: -150 * scale,
              width: 800 * scale,
              height: 800 * scale,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.glow2}, transparent 70%)`,
              filter: `blur(${80 * scale}px)`,
            }}
          />
        </>
      )}
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: `${120 * scale}px ${90 * scale}px`,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: s(28), fontWeight: 600 }}>App da Oração</div>
          <div style={{ fontSize: s(22), color: theme.mutedColor }}>Palavra do dia</div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: s(40),
          }}
        >
          <div
            style={{
              fontSize: s(64),
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: s(-1),
            }}
          >
            {title}
          </div>

          {verseText && (
            <div
              style={{
                fontSize: s(42),
                lineHeight: 1.4,
                fontStyle: 'italic',
                fontWeight: 300,
                color: theme.mutedColor,
              }}
            >
              "{verseText}"
              {verseRef && (
                <div
                  style={{
                    marginTop: s(24),
                    fontSize: s(32),
                    fontStyle: 'normal',
                    fontWeight: 600,
                    color: theme.accentColor,
                  }}
                >
                  {verseRef}
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: s(40),
            borderTop: `${1 * scale}px solid ${theme.borderColor}`,
          }}
        >
          <div style={{ fontSize: s(30), fontWeight: 700 }}>@appdaoracao</div>
          <div style={{ fontSize: s(24), color: theme.mutedColor }}>appdaoracao.com</div>
        </div>
      </div>
    </div>
  );
}
