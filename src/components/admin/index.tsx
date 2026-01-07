import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';

export function UserManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Funcionalidade de gerenciamento de usuários disponível em breve.</p>
      </CardContent>
    </Card>
  );
}

export function PrayerManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Funcionalidade de gerenciamento de pedidos disponível em breve.</p>
      </CardContent>
    </Card>
  );
}

export function BannedIPs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>IPs Banidos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Funcionalidade de gerenciamento de IPs disponível em breve.</p>
      </CardContent>
    </Card>
  );
}

export function BannerManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Banners</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Funcionalidade de gerenciamento de banners disponível em breve.</p>
      </CardContent>
    </Card>
  );
}
