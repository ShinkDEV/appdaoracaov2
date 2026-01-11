import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
});

const emailSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(searchParams.get('modo') === 'cadastro');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const validate = () => {
    try {
      if (isForgotPassword) {
        emailSchema.parse({ email });
      } else if (isSignUp) {
        signupSchema.parse({ email, password, displayName });
      } else {
        loginSchema.parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) newErrors[e.path[0] as string] = e.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      // Check if email exists in profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (!profile) {
        toast({
          variant: 'destructive',
          title: 'E-mail não encontrado',
          description: 'Não existe uma conta com este e-mail.',
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      
      if (error) throw error;
      setResetEmailSent(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message || 'Erro ao enviar e-mail de recuperação',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        setEmailSent(true);
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: 'Bem-vindo de volta!' });
        navigate('/');
      }
    } catch (error: any) {
      const message = error.message?.includes('Invalid login')
        ? 'E-mail ou senha incorretos'
        : error.message?.includes('Email not confirmed')
        ? 'Confirme seu e-mail antes de entrar'
        : error.message?.includes('already registered')
        ? 'Este e-mail já está cadastrado'
        : error.message || 'Ocorreu um erro';
      toast({ variant: 'destructive', title: 'Erro', description: message });
    } finally {
      setLoading(false);
    }
  };

  if (resetEmailSent) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md shadow-elevated text-center">
            <CardHeader>
              <div className="text-5xl mb-4">📧</div>
              <CardTitle className="font-display text-2xl">Verifique seu e-mail</CardTitle>
              <CardDescription className="text-base mt-2">
                Enviamos um link de recuperação para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Clique no link do e-mail para redefinir sua senha. Verifique também a pasta de spam.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setResetEmailSent(false);
                  setIsForgotPassword(false);
                }}
                className="w-full"
              >
                Voltar para login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (emailSent) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md shadow-elevated text-center">
            <CardHeader>
              <div className="text-5xl mb-4">📧</div>
              <CardTitle className="font-display text-2xl">Verifique seu e-mail</CardTitle>
              <CardDescription className="text-base mt-2">
                Enviamos um link de confirmação para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Clique no link do e-mail para ativar sua conta. Verifique também a pasta de spam.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setIsSignUp(false);
                }}
                className="w-full"
              >
                Já confirmei, fazer login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isForgotPassword) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md shadow-elevated">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">🔑</div>
              <CardTitle className="font-display text-2xl">Recuperar Senha</CardTitle>
              <CardDescription>
                Digite seu e-mail para receber o link de recuperação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <LoadingSpinner /> : 'Enviar Link'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setErrors({}); }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Voltar para login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🙏</div>
            <CardTitle className="font-display text-2xl">
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? 'Junte-se à nossa comunidade de oração'
                : 'Entre na sua conta para continuar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Seu nome</Label>
                  <Input
                    id="displayName"
                    placeholder="Como você quer ser chamado"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  {errors.displayName && <p className="text-xs text-destructive">{errors.displayName}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setErrors({}); }}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <LoadingSpinner /> : isSignUp ? 'Criar Conta' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrors({}); }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp
                  ? 'Já tem uma conta? Entre aqui'
                  : 'Não tem conta? Cadastre-se'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
