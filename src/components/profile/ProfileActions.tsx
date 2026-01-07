import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, BookHeart, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ProfileActionsProps {
  isAdmin?: boolean;
}

export function ProfileActions({ isAdmin }: ProfileActionsProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const actions = [
    {
      icon: BookHeart,
      label: 'Meus Pedidos',
      description: 'Gerencie seus pedidos de oração',
      onClick: () => navigate('/minhas-oracoes'),
      color: 'text-primary'
    },
    {
      icon: Settings,
      label: 'Configurações',
      description: 'Preferências e notificações',
      onClick: () => navigate('/configuracoes'),
      color: 'text-muted-foreground'
    },
    ...(isAdmin ? [{
      icon: Shield,
      label: 'Administração',
      description: 'Painel de administração',
      onClick: () => navigate('/admin'),
      color: 'text-amber-600'
    }] : []),
    {
      icon: LogOut,
      label: 'Sair',
      description: 'Encerrar sessão',
      onClick: signOut,
      color: 'text-destructive',
      danger: true
    }
  ];

  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={cn(
              "w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left",
              action.danger && "hover:bg-destructive/5"
            )}
          >
            <div className={cn("p-2 rounded-full bg-muted", action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium", action.danger && "text-destructive")}>
                {action.label}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {action.description}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
