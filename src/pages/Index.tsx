import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  PieChart,
  Users,
  Receipt,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-finance.jpg";
import ExpenseForm from "@/components/ExpenseForm";
import DebtManager from "@/components/DebtManager";
import FinancialSummary from "@/components/FinancialSummary";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "expenses" | "debts" | "summary">("dashboard");


  // Auth + family data
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [members, setMembers] = useState<Array<{ id: string; full_name: string | null; email: string | null }>>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  useEffect(() => {
    // Basic SEO
    document.title = "Dashboard | Family Finance";
    const desc = "Family finance dashboard with member invites and summaries.";
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
  }, []);

  const generateToken = () => {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .maybeSingle();
      const display = profile?.full_name || user.email || 'Member';
      setUserName(display || '');

      const { data: fmList } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id);

      let famId = fmList && fmList.length > 0 ? (fmList[0] as any).family_id as string : null;

      if (!famId) {
        const defaultName = `Family of ${display}`;
        const { data: fam, error: famErr } = await supabase
          .from('families')
          .insert({ owner_id: user.id, name: defaultName })
          .select('id')
          .single();
        if (!famErr && fam) {
          famId = (fam as any).id as string;
          await supabase.from('family_members').insert({ family_id: famId, user_id: user.id, role: 'owner' });
        }
      }

      if (famId) {
        setFamilyId(famId);
        const { data: memberRows } = await supabase
          .from('family_members')
          .select('user_id')
          .eq('family_id', famId);
        const ids = (memberRows || []).map((r: any) => r.user_id);
        if (ids.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', ids);
          setMembers(profiles || []);
        } else {
          setMembers([]);
        }
      }
    };
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyId || !inviteEmail) return;
    const token = generateToken();
    const { data: userData } = await supabase.auth.getUser();
    const inviterId = userData.user?.id;
    const { error } = await supabase
      .from('invites')
      .insert({ family_id: familyId, email: inviteEmail, token, invited_by: inviterId });
    if (error) {
      toast({ title: 'Invite failed', description: error.message, variant: 'destructive' as any });
      return;
    }
    const url = `${window.location.origin}/auth?invite=${token}`;
    setInviteUrl(url);
    toast({ title: 'Invite created', description: 'Share the link with the invited member.' });
    setInviteEmail('');
  };
  const financialQuotes = [
    { quote: "A budget is telling your money where to go instead of wondering where it went.", author: "Dave Ramsey" },
    { quote: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
    { quote: "The real measure of your wealth is how much you'd be worth if you lost all your money.", author: "Bernard Meltzer" },
    { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { quote: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", author: "Dave Ramsey" }
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % financialQuotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Hero Section with Quote Slider */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient p-8 text-white">
        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Family Financial Hub
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Track expenses, manage debts, and build financial transparency together.
            </p>
            
            {/* Financial Quote Slider */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 min-h-[100px] flex items-center">
              <div className="text-center animate-fade-in">
                <p className="text-lg italic mb-2">"{financialQuotes[currentQuoteIndex].quote}"</p>
                <p className="text-sm opacity-80">— {financialQuotes[currentQuoteIndex].author}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setActiveTab("expenses")}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Expense
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setActiveTab("summary")}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <PieChart className="h-5 w-5 mr-2" />
                View Summary
              </Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <img 
              src={heroImage} 
              alt="Financial Dashboard" 
              className="rounded-xl shadow-[var(--shadow-large)] opacity-80"
            />
          </div>
        </div>
        
        {/* Quote indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {financialQuotes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuoteIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentQuoteIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Financial Overview - Real data available in Summary tab */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            View your complete financial summary with real-time data including expenses, debts, and family spending patterns.
          </p>
          <Button 
            onClick={() => setActiveTab("summary")}
            className="w-full"
          >
            <PieChart className="h-4 w-4 mr-2" />
            View Detailed Financial Summary
          </Button>
        </CardContent>
      </Card>

      {/* Family & Invites */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Welcome, {userName || 'Member'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Family members</h3>
              <ul className="space-y-2">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center justify-between rounded-md bg-accent/50 px-3 py-2">
                    <span className="font-medium">{m.full_name || m.email}</span>
                    <Badge variant="secondary">member</Badge>
                  </li>
                ))}
                {members.length === 0 && (
                  <p className="text-sm text-muted-foreground">No members yet.</p>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Invite a member</h3>
              <form onSubmit={handleInvite} className="flex gap-2">
                <Label htmlFor="inviteEmail" className="sr-only">Email</Label>
                <Input id="inviteEmail" type="email" placeholder="email@family.com" value={inviteEmail} onChange={(e)=>setInviteEmail(e.target.value)} required />
                <Button type="submit">Invite</Button>
              </form>
              {inviteUrl && (
                <p className="text-xs text-muted-foreground mt-2 break-all">
                  Invite link: <a href={inviteUrl} className="text-primary underline">{inviteUrl}</a>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setActiveTab("expenses")}
              className="h-20 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <Plus className="h-6 w-6" />
              <span>Add New Expense</span>
            </Button>
            <Button 
              onClick={() => setActiveTab("debts")}
              className="h-20 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <CreditCard className="h-6 w-6" />
              <span>Manage Debts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "expenses":
        return <ExpenseForm />;
      case "debts":
        return <DebtManager />;
      case "summary":
        return <FinancialSummary />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Quick Access Toolbar */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex gap-2 bg-card/90 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
          <Button size="sm" variant="ghost" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={async () => {
              await supabase.auth.signOut();
              // Auth state change will redirect automatically
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gradient">FamilyFinance</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === "expenses" ? "default" : "ghost"}
                onClick={() => setActiveTab("expenses")}
              >
                Expenses
              </Button>
              <Button
                variant={activeTab === "debts" ? "default" : "ghost"}
                onClick={() => setActiveTab("debts")}
              >
                Debts
              </Button>
              <Button
                variant={activeTab === "summary" ? "default" : "ghost"}
                onClick={() => setActiveTab("summary")}
              >
                Summary
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;