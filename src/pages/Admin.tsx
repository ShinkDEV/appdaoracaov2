import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingPage } from '@/components/ui/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/UserManagement';
import { PrayerManagement } from '@/components/admin/PrayerManagement';
import { BannedIPs } from '@/components/admin/BannedIPs';
import { BannerManagement } from '@/components/admin/BannerManagement';
import { Button } from '@/components/ui/button';
import { Shield, Users, BookOpen, Globe, Image, ArrowLeft } from 'lucide-react';

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8 lg:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/configuracoes')} className="rounded-full shrink-0 h-10 w-10">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="p-2.5 md:p-3 rounded-xl bg-primary/10">
          <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Gerencie usuários, pedidos e configurações</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6 md:space-y-8">
        <div className="flex justify-center">
          <TabsList className="inline-flex w-auto bg-muted/50 rounded-full p-1 h-auto flex-wrap justify-center gap-1">
            <TabsTrigger value="users" className="rounded-full gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 px-3 md:px-4">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="prayers" className="rounded-full gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 px-3 md:px-4">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="rounded-full gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 px-3 md:px-4">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
            <TabsTrigger value="ips" className="rounded-full gap-1.5 md:gap-2 text-xs md:text-sm py-2 md:py-2.5 px-3 md:px-4">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">IPs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="prayers" className="mt-6">
          <PrayerManagement />
        </TabsContent>

        <TabsContent value="banners" className="mt-6">
          <BannerManagement />
        </TabsContent>

        <TabsContent value="ips" className="mt-6">
          <BannedIPs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
