import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, Bug, Zap } from 'lucide-react';
import { APP_VERSION } from '@/lib/constants';

interface UpdatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Update {
  version: string;
  date: string;
  changes: {
    type: 'feature' | 'improvement' | 'fix';
    text: string;
  }[];
}

const UPDATES: Update[] = [
  {
    version: '1.1.0',
    date: '2025-01-13',
    changes: [
      { type: 'feature', text: 'Instalação como app (PWA) - adicione à tela inicial!' },
      { type: 'feature', text: 'Sistema de doações via PIX e cartão' },
      { type: 'feature', text: 'Links para redes sociais (Instagram e YouTube)' },
      { type: 'feature', text: 'Seção de contato por e-mail' },
      { type: 'improvement', text: 'Menu "Mais" redesenhado' },
      { type: 'improvement', text: 'Melhorias visuais na interface' },
    ]
  },
  {
    version: '1.0.0',
    date: '2024-01-01',
    changes: [
      { type: 'feature', text: 'Lançamento do App da Oração!' },
      { type: 'feature', text: 'Crie e compartilhe pedidos de oração' },
      { type: 'feature', text: 'Ore pelos pedidos de outras pessoas' },
      { type: 'feature', text: 'Filtros por temas de oração' },
      { type: 'feature', text: 'Sistema de autenticação seguro' },
      { type: 'improvement', text: 'Interface otimizada para dispositivos móveis' },
    ]
  }
];

const STORAGE_KEY = 'app_last_seen_version';

export function UpdatesModal({ open, onOpenChange }: UpdatesModalProps) {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Gift className="h-4 w-4 text-green-600" />;
      case 'improvement':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'fix':
        return <Bug className="h-4 w-4 text-orange-600" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getChangeBadge = (type: string) => {
    switch (type) {
      case 'feature':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Novo</Badge>;
      case 'improvement':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Melhoria</Badge>;
      case 'fix':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Correção</Badge>;
      default:
        return null;
    }
  };

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Novidades
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {UPDATES.map((update, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Versão {update.version}</h3>
                  <span className="text-xs text-muted-foreground">{update.date}</span>
                </div>
                
                <ul className="space-y-2">
                  {update.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="flex items-start gap-2 text-sm">
                      {getChangeIcon(change.type)}
                      <span className="flex-1">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <Button onClick={handleClose} className="w-full">
            Entendi!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if should show updates
export function useUpdatesModal() {
  const [showUpdates, setShowUpdates] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem(STORAGE_KEY);
    if (lastSeenVersion !== APP_VERSION) {
      // Small delay to not show immediately on load
      const timer = setTimeout(() => setShowUpdates(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    showUpdates,
    setShowUpdates,
    markAsSeen: () => {
      localStorage.setItem(STORAGE_KEY, APP_VERSION);
      setShowUpdates(false);
    }
  };
}
