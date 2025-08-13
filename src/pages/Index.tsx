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
  Receipt
} from "lucide-react";
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

  // Mock data for demonstration
  const financialStats = {
    totalIncome: 8450.0,
    totalExpenses: 3280.5,
    totalDebts: 1200.0,
    pendingApprovals: 3,
  };

  const recentTransactions = [
    { id: 1, description: "Grocery Shopping", amount: 85.43, type: "expense", status: "approved", date: "2024-01-10" },
    { id: 2, description: "Salary", amount: 3200.0, type: "income", status: "approved", date: "2024-01-09" },
    { id: 3, description: "Utility Bills", amount: 145.3, type: "expense", status: "pending", date: "2024-01-08" },
    { id: 4, description: "Freelance Income", amount: 850.0, type: "income", status: "approved", date: "2024-01-07" },
  ];

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
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl hero-gradient p-8 text-white">
        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Family Financial Hub
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Track expenses, manage debts, and build financial transparency together.
            </p>
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
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">
              ${financialStats.totalIncome.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">
              ${financialStats.totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              -3.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Debts</CardTitle>
            <CreditCard className="h-4 w-4 text-debt" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-debt">
              ${financialStats.totalDebts.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              2 active debts
            </p>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {financialStats.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting family approval
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Recent Transactions */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                  }`}>
                    <DollarSign className={`h-4 w-4 ${
                      transaction.type === 'income' ? 'text-income' : 'text-expense'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-income' : 'text-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  <Badge variant={transaction.status === 'approved' ? 'default' : 'secondary'}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
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
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
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