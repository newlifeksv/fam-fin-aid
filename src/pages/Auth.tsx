import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Basic SEO for auth page
    document.title = isSignUp ? "Create account | Family Finance" : "Login | Family Finance";
    const desc = isSignUp ? "Create your Family Finance account." : "Login to your Family Finance dashboard.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
  }, [isSignUp]);

  // Keep session in sync
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // After login/signup, try to process invite if present
        processInviteIfAny().then(() => navigate("/"));
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const processInviteIfAny = async () => {
    try {
      const token = searchParams.get("invite");
      if (!token) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).maybeSingle();
      if (!profile?.email) return;

      // Fetch invite (RLS allows when invite.email == profile.email)
      const { data: invite } = await supabase
        .from('invites')
        .select('id, family_id, accepted, expires_at')
        .eq('token', token)
        .maybeSingle();

      if (!invite) {
        toast({ title: 'Invite not found', description: 'Ensure you used the correct invite link.', variant: 'destructive' as any });
        return;
      }

      // Mark as accepted
      await supabase.from('invites').update({ accepted: true }).eq('id', (invite as any).id);
      // Add membership for this user
      await supabase.from('family_members').insert({ family_id: (invite as any).family_id, user_id: user.id, role: 'member' });
      toast({ title: 'Invite accepted', description: 'You now have access to the family dashboard.' });
    } catch (e: any) {
      // Non-fatal; user might already be a member
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/auth`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast({ title: 'Check your email', description: 'Confirm your email to complete sign up.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange will navigate
      }
    } catch (err: any) {
      toast({ title: 'Auth error', description: err.message, variant: 'destructive' as any });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Create your account' : 'Sign in to Family Finance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button className="text-primary underline" onClick={() => setIsSignUp((v) => !v)}>
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
