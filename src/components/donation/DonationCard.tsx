import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface DonationCardProps {
  onDonate: () => void;
}

export function DonationCard({ onDonate }: DonationCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
      <CardContent className="p-6 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
          <Heart className="h-6 w-6 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Apoie o App da Oração</h3>
          <p className="text-sm text-muted-foreground">
            Sua contribuição ajuda a manter o aplicativo gratuito e disponível para todos.
          </p>
        </div>
        
        <Button onClick={onDonate} className="w-full gap-2">
          <Heart className="h-4 w-4" />
          Fazer uma doação
        </Button>
      </CardContent>
    </Card>
  );
}
