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
  displayName: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .refine(
      (name) => !name.includes('@') && !/\S+@\S+\.\S+/.test(name),
      'Nome não pode conter endereço de e-mail'
    ),
});

const emailSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
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
  const [googleLoading, setGoogleLoading] = useState(false);
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

              <Button type="submit" className="w-full" size="lg" disabled={loading || googleLoading}>
                {loading ? <LoadingSpinner /> : isSignUp ? 'Criar Conta' : 'Entrar'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              size="lg"
              disabled={loading || googleLoading}
              onClick={async () => {
                setGoogleLoading(true);
                const { error } = await signInWithGoogle();
                if (error) {
                  toast({
                    variant: 'destructive',
                    title: 'Erro',
                    description: error.message || 'Erro ao entrar com Google',
                  });
                  setGoogleLoading(false);
                }
              }}
            >
              {googleLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </>
              )}
            </Button>

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
