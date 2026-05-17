import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Devotional {
  id: string;
  title: string;
  verse_text: string | null;
  verse_reference: string | null;
  content: string;
  is_system: boolean;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
  featured_date?: string | null;
  author_display_name: string | null;
  author_photo_url: string | null;
  author_verified: boolean;
  author_is_supporter: boolean;
}

export function useDevotionals() {
  const { user } = useAuth();
  const [daily, setDaily] = useState<Devotional | null>(null);
  const [list, setList] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [d, l] = await Promise.all([
      supabase.rpc('get_daily_devotional'),
      supabase.rpc('get_approved_devotionals', { p_limit: 30, p_offset: 0 }),
    ]);
    setDaily((d.data?.[0] as any) || null);
    setList((l.data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const submit = async (input: {
    title: string;
    verse_reference?: string;
    verse_text?: string;
    content: string;
    is_anonymous: boolean;
  }) => {
    if (!user) {
      toast.error('Faça login para enviar uma palavra');
      return false;
    }
    const { error } = await supabase.from('devotionals').insert({
      user_id: user.id,
      title: input.title,
      verse_reference: input.verse_reference || null,
      verse_text: input.verse_text || null,
      content: input.content,
      is_anonymous: input.is_anonymous,
      status: 'pending',
      is_system: false,
    });
    if (error) {
      toast.error('Erro ao enviar palavra');
      return false;
    }
    toast.success('Palavra enviada! Aguardando aprovação 🙏');
    return true;
  };

  return { daily, list, loading, refetch: fetchAll, submit };
}
