import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingPage, LoadingSpinner } from "@/components/ui/loading";
import { ArrowLeft, CreditCard, Calendar, AlertCircle, CheckCircle2, XCircle, Heart } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
} from "@/components/ui/alert-dialog";

interface Subscription {
  id: string;
  mercadopago_subscription_id: string;
  amount: number;
  status: string;
  payer_email: string | null;
  created_at: string;
  next_payment_date: string | null;
  cancelled_at: string | null;
}

const Subscription = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchSubscription();
    }
  }, [user, authLoading, navigate]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching subscription:", error);
      }

      setSubscription(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    setCancelling(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await fetch(
        "https://iwjhfwyvabcerqlsjogu.supabase.co/functions/v1/cancel-subscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({
            subscriptionId: subscription.mercadopago_subscription_id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cancelar assinatura");
      }

      toast.success("Assinatura cancelada com sucesso");
      fetchSubscription();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao cancelar assinatura");
    } finally {
      setCancelling(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingPage />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Ativa
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelada
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pausada
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Minha Assinatura</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {subscription ? (
          <>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Apoio Mensal
                  </CardTitle>
                  {getStatusBadge(subscription.status)}
                </div>
                <CardDescription>
                  Obrigado por apoiar o App da Oração!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      Valor mensal
                    </p>
                    <p className="text-lg font-semibold">
                      R$ {subscription.amount.toFixed(2).replace(".", ",")}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Início
                    </p>
                    <p className="text-lg font-semibold">
                      {format(new Date(subscription.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {subscription.status === "active" && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Próxima cobrança</p>
                    <p className="font-medium">
                      {(() => {
                        // Calcular próxima cobrança: 1 mês após a criação da assinatura
                        const createdDate = new Date(subscription.created_at);
                        const nextPayment = new Date(createdDate);
                        nextPayment.setMonth(nextPayment.getMonth() + 1);
                        
                        // Se já passou, adicionar mais meses até ser no futuro
                        const now = new Date();
                        while (nextPayment <= now) {
                          nextPayment.setMonth(nextPayment.getMonth() + 1);
                        }
                        
                        return format(nextPayment, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
                      })()}
                    </p>
                  </div>
                )}

                {subscription.cancelled_at && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Cancelada em</p>
                    <p className="font-medium">
                      {format(new Date(subscription.cancelled_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}

                {subscription.payer_email && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">E-mail de cobrança</p>
                    <p className="font-medium">{subscription.payer_email}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {subscription.status === "active" && (
              <Card className="border-destructive/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-destructive flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Cancelar assinatura
                  </CardTitle>
                  <CardDescription>
                    Ao cancelar, você não será mais cobrado nos próximos meses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full" disabled={cancelling}>
                        {cancelling ? (
                          <>
                            <LoadingSpinner className="mr-2" />
                            Cancelando...
                          </>
                        ) : (
                          "Cancelar assinatura"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja cancelar sua assinatura mensal de R$ {subscription.amount.toFixed(2).replace(".", ",")}? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelSubscription}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sim, cancelar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}

            {subscription.status === "cancelled" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <Heart className="h-10 w-10 text-primary mx-auto" />
                    <h3 className="font-semibold">Sentiremos sua falta!</h3>
                    <p className="text-sm text-muted-foreground">
                      Você pode voltar a apoiar o App da Oração a qualquer momento.
                    </p>
                    <Button onClick={() => navigate("/apoio")} className="mt-2">
                      Apoiar novamente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Nenhuma assinatura ativa</h3>
                  <p className="text-sm text-muted-foreground">
                    Você ainda não possui uma assinatura mensal. Considere apoiar o App da Oração!
                  </p>
                </div>
                <Button onClick={() => navigate("/apoio")} className="mt-2">
                  <Heart className="h-4 w-4 mr-2" />
                  Apoiar agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Subscription;
