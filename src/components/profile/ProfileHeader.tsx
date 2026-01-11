import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, User, Pencil, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ImageCropper } from './ImageCropper';
import { VerifiedBadge } from '@/components/ui/verified-badge';

interface ProfileHeaderProps {
  userId: string;
  displayName: string | null;
  photoUrl: string | null;
  email: string;
  verified?: boolean;
  onUpdate: () => void;
}

export function ProfileHeader({ userId, displayName, photoUrl, email, verified, onUpdate }: ProfileHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(displayName || '');
  const [uploading, setUploading] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = async () => {
    if (!newName.trim()) {
      toast.error('Nome não pode estar vazio');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: newName.trim() })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Nome atualizado!');
      setIsEditingName(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Erro ao atualizar nome');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }

    // Create object URL for cropper
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setPhotoDialogOpen(false);
    setCropperOpen(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropperOpen(false);
    setUploading(true);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return;
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', croppedBlob, 'avatar.jpg');

      // Upload via edge function to Cloudflare R2
      const uploadUrl = `https://iwjhfwyvabcerqlsjogu.supabase.co/functions/v1/upload-avatar`;
      console.log('Uploading to R2 via:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });
      
      console.log('Upload response status:', response.status);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer upload');
      }

      toast.success('Foto atualizada!');
      onUpdate();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ photo_url: null })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Foto removida!');
      setPhotoDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Erro ao remover foto');
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Avatar with edit */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogTrigger asChild>
          <button className="relative group">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={displayName || 'Usuário'} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar foto de perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                {photoUrl ? (
                  <AvatarImage src={photoUrl} alt={displayName || 'Usuário'} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? 'Enviando...' : 'Escolher nova foto'}
              </Button>
              
              {photoUrl && (
                <Button
                  variant="outline"
                  onClick={handleRemovePhoto}
                  className="w-full text-destructive hover:text-destructive"
                >
                  Remover foto
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Name with edit */}
      <div className="space-y-1">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-center"
              autoFocus
            />
            <Button size="icon" variant="ghost" onClick={handleNameSave}>
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => {
              setIsEditingName(false);
              setNewName(displayName || '');
            }}>
              <X className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{displayName || 'Usuário'}</h2>
            {verified && <VerifiedBadge size="lg" />}
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditingName(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      {/* Image Cropper Modal */}
      {selectedImage && (
        <ImageCropper
          open={cropperOpen}
          onOpenChange={(open) => {
            setCropperOpen(open);
            if (!open && selectedImage) {
              URL.revokeObjectURL(selectedImage);
              setSelectedImage(null);
            }
          }}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}
