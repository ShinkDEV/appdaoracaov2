import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookHeart, HandHeart, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfileStatsProps {
  userId: string;
  createdAt: string;
}

interface Stats {
  prayerRequests: number;
  prayersOffered: number;
}

export function ProfileStats({ userId, createdAt }: ProfileStatsProps) {
  const [stats, setStats] = useState<Stats>({ prayerRequests: 0, prayersOffered: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get prayer requests count
        const { count: requestsCount } = await supabase
          .from('prayer_requests')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_deleted', false);

        // Get prayers offered count
        const { count: prayersCount } = await supabase
          .from('user_prayers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        setStats({
          prayerRequests: requestsCount || 0,
          prayersOffered: prayersCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [userId]);

  const memberSince = formatDistanceToNow(new Date(createdAt), {
    addSuffix: false,
    locale: ptBR
  });

  const statItems = [
    {
      icon: BookHeart,
      value: stats.prayerRequests,
      label: 'Pedidos',
      color: 'text-primary'
    },
    {
      icon: HandHeart,
      value: stats.prayersOffered,
      label: 'Orações',
      color: 'text-green-600'
    },
    {
      icon: Calendar,
      value: memberSince,
      label: 'Membro há',
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {statItems.map((item, index) => (
        <Card key={index} className="text-center">
          <CardContent className="p-4">
            <item.icon className={`h-5 w-5 mx-auto mb-2 ${item.color}`} />
            <p className="text-lg font-bold">
              {loading ? '...' : item.value}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
