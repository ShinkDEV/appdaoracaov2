import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { LoadingPage } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { HandHeart, FileText, Plus, ArrowLeft } from 'lucide-react';

const MyPrayers = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    setLoading(false);
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <Layout>
        <LoadingPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minhas Orações</h1>
            <p className="text-muted-foreground text-sm">Acompanhe seus pedidos e orações</p>
          </div>
        </div>

        <Tabs defaultValue="prayers" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 rounded-full p-1">
            <TabsTrigger value="prayers" className="rounded-full gap-2">
              <HandHeart className="h-4 w-4" />
              Orando
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-full gap-2">
              <FileText className="h-4 w-4" />
              Meus Pedidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prayers">
            <EmptyState
              icon={<HandHeart className="h-16 w-16" />}
              title="Nenhuma oração ainda"
              description="Você ainda não está orando por nenhum pedido. Explore os pedidos e comece a orar!"
              action={<Button onClick={() => navigate('/')} className="rounded-full px-6">Ver Pedidos</Button>}
            />
          </TabsContent>

          <TabsContent value="requests">
            <EmptyState
              icon={<FileText className="h-16 w-16" />}
              title="Nenhum pedido ainda"
              description="Você ainda não criou nenhum pedido de oração."
              action={
                <Button onClick={() => navigate('/novo-pedido')} className="rounded-full px-6 gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Pedido
                </Button>
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MyPrayers;
