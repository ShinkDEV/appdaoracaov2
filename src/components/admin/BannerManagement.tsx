import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, Image, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Banner {
  id: string;
  image_url: string;
  mobile_image_url: string | null;
  title: string | null;
  link: string | null;
  is_active: boolean | null;
  display_order: number | null;
}

export function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    mobile_image_url: '',
    link: '',
    is_active: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order');

    if (error) {
      toast.error('Erro ao carregar banners');
      console.error(error);
    } else {
      setBanners(data || []);
    }
    setLoading(false);
  };

  const openDialog = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        image_url: banner.image_url,
        mobile_image_url: banner.mobile_image_url || '',
        link: banner.link || '',
        is_active: banner.is_active ?? true,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        image_url: '',
        mobile_image_url: '',
        link: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  // Validate URL to only allow http/https protocols (prevents javascript:, data:, etc.)
  const isValidUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  };

  const saveBanner = async () => {
    if (!formData.image_url) {
      toast.error('URL da imagem é obrigatória');
      return;
    }

    // Validate image URL
    if (!isValidUrl(formData.image_url)) {
      toast.error('URL da imagem inválida (deve usar http:// ou https://)');
      return;
    }

    // Validate mobile image URL if provided
    if (formData.mobile_image_url && !isValidUrl(formData.mobile_image_url)) {
      toast.error('URL da imagem mobile inválida (deve usar http:// ou https://)');
      return;
    }

    // Validate link URL if provided
    if (formData.link && !isValidUrl(formData.link)) {
      toast.error('Link inválido (deve usar http:// ou https://)');
      return;
    }

    const bannerData = {
      title: formData.title || null,
      image_url: formData.image_url,
      mobile_image_url: formData.mobile_image_url || null,
      link: formData.link || null,
      is_active: formData.is_active,
      display_order: editingBanner?.display_order ?? banners.length,
    };

    if (editingBanner) {
      const { error } = await supabase
        .from('banners')
        .update(bannerData)
        .eq('id', editingBanner.id);

      if (error) {
        toast.error('Erro ao atualizar banner');
        console.error(error);
      } else {
        toast.success('Banner atualizado com sucesso');
        setDialogOpen(false);
        fetchBanners();
      }
    } else {
      const { error } = await supabase
        .from('banners')
        .insert(bannerData);

      if (error) {
        toast.error('Erro ao criar banner');
        console.error(error);
      } else {
        toast.success('Banner criado com sucesso');
        setDialogOpen(false);
        fetchBanners();
      }
    }
  };

  const deleteBanner = async (bannerId: string) => {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', bannerId);

    if (error) {
      toast.error('Erro ao excluir banner');
      console.error(error);
    } else {
      toast.success('Banner excluído com sucesso');
      fetchBanners();
    }
  };

  const toggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id);

    if (error) {
      toast.error('Erro ao atualizar banner');
    } else {
      fetchBanners();
    }
  };

  const activeCount = banners.filter(b => b.is_active).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{banners.length}</p>
              <p className="text-sm text-muted-foreground">Total de banners</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10">
              <Image className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Banners ativos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gerenciamento de Banners</CardTitle>
            <CardDescription>Crie e gerencie os banners do carrossel</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Novo Banner</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Editar Banner' : 'Novo Banner'}</DialogTitle>
                <DialogDescription>
                  {editingBanner ? 'Atualize as informações do banner' : 'Preencha as informações do novo banner'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título (opcional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título do banner"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL da Imagem *</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile_image_url">URL da Imagem Mobile (opcional)</Label>
                  <Input
                    id="mobile_image_url"
                    value={formData.mobile_image_url}
                    onChange={(e) => setFormData({ ...formData, mobile_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Link (opcional)</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Banner ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={saveBanner}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum banner cadastrado</p>
              <p className="text-sm">Clique em "Novo Banner" para adicionar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title || 'Banner'}
                      className="h-16 w-28 object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{banner.title || 'Sem título'}</p>
                      {banner.is_active ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inativo</Badge>
                      )}
                    </div>
                    {banner.link && (
                      <a 
                        href={banner.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span className="truncate">{banner.link}</span>
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={banner.is_active ?? false}
                      onCheckedChange={() => toggleActive(banner)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir banner</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir este banner? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteBanner(banner.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
