import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { ArrowLeft, Download, Share2, Loader2, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDevotionals } from '@/hooks/useDevotionals';
import { SEO } from '@/components/SEO';
import { toast } from 'sonner';

export default function ShareDevotional() {
  const navigate = useNavigate();
  const { daily, loading } = useDevotionals();
  const storyRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !daily) {
      toast.error('Nenhum devocional disponível para hoje');
    }
  }, [loading, daily]);

  const generateImage = async () => {
    if (!storyRef.current) return null;
    return await toPng(storyRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      width: 1080,
      height: 1920,
      style: { transform: 'scale(1)', transformOrigin: 'top left' },
    });
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
            Baixe a imagem abaixo e poste no Instagram marcando <span className="font-semibold text-primary">@appdaoracao</span>
          </p>
        </div>

        {loading ? (
          <div className="aspect-[9/16] rounded-2xl bg-muted animate-pulse" />
        ) : daily ? (
          <>
            {/* Preview (escalado) */}
            <div className="rounded-2xl overflow-hidden shadow-2xl mx-auto" style={{ width: '100%', maxWidth: 360 }}>
              <div
                style={{
                  width: 360,
                  height: 640,
                  transform: 'scale(1)',
                  transformOrigin: 'top left',
                }}
              >
                <StoryCard
                  title={daily.title}
                  verseText={daily.verse_text}
                  verseRef={daily.verse_reference}
                  scale={360 / 1080}
                />
              </div>
            </div>

            {/* Canvas oculto em tamanho real para export */}
            <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}>
              <div ref={storyRef} style={{ width: 1080, height: 1920 }}>
                <StoryCard
                  title={daily.title}
                  verseText={daily.verse_text}
                  verseRef={daily.verse_reference}
                  scale={1}
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
}: {
  title: string;
  verseText: string | null;
  verseRef: string | null;
  scale: number;
}) {
  // Tamanho base: 1080 x 1920
  const s = (n: number) => `${n * scale}px`;
  return (
    <div
      style={{
        width: 1080 * scale,
        height: 1920 * scale,
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #1e3a8a 0%, #0f172a 50%, #0c4a6e 100%)',
        color: '#ffffff',
        fontFamily: '"Inter", "DM Sans", system-ui, sans-serif',
      }}
    >
      {/* Glows decorativos */}
      <div
        style={{
          position: 'absolute',
          top: -200 * scale,
          right: -200 * scale,
          width: 700 * scale,
          height: 700 * scale,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.35), transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(20,184,166,0.25), transparent 70%)',
          filter: `blur(${80 * scale}px)`,
        }}
      />

      {/* Conteúdo */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: `${120 * scale}px ${90 * scale}px`,
        }}
      >
        {/* Topo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: s(16) }}>
          <div
            style={{
              width: s(64),
              height: s(64),
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: `${2 * scale}px solid rgba(255,255,255,0.25)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: s(32),
            }}
          >
            ✝
          </div>
          <div>
            <div style={{ fontSize: s(28), fontWeight: 600, letterSpacing: s(0.5) }}>App da Oração</div>
            <div style={{ fontSize: s(22), opacity: 0.7 }}>Palavra do dia</div>
          </div>
        </div>

        {/* Centro */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: s(40) }}>
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
                borderLeft: `${6 * scale}px solid rgba(147,197,253,0.9)`,
                paddingLeft: s(32),
                fontSize: s(42),
                lineHeight: 1.4,
                fontStyle: 'italic',
                fontWeight: 300,
                opacity: 0.95,
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
                    color: '#93c5fd',
                  }}
                >
                  — {verseRef}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: s(40),
            borderTop: `${1 * scale}px solid rgba(255,255,255,0.15)`,
          }}
        >
          <div style={{ fontSize: s(30), fontWeight: 700, letterSpacing: s(0.5) }}>@appdaoracao</div>
          <div style={{ fontSize: s(24), opacity: 0.7 }}>appdaoracao.com</div>
        </div>
      </div>
    </div>
  );
}
