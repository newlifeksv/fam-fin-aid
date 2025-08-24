import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  Filter,
  IndianRupee
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Debt {
  id: string;
  amount: number;
  creditor: string;
  purpose: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

const FinancialSummary = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadFinancialData();
      }
    });

    // Set up real-time listeners for expenses and debts
    const expensesChannel = supabase
      .channel('financial-expenses-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        console.log('Expense change detected, reloading financial data');
        loadFinancialData();
      })
      .subscribe();

    const debtsChannel = supabase
      .channel('financial-debts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts' }, () => {
        console.log('Debt change detected, reloading financial data');
        loadFinancialData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(expensesChannel);
      supabase.removeChannel(debtsChannel);
    };
  }, []);

  const loadFinancialData = async () => {
    if (!session?.user) return;

    try {
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (!familyMembers?.length) return;

      const familyId = familyMembers[0].family_id;

      // Load expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (expensesError) throw expensesError;

      // Load debts
      const { data: debtsData, error: debtsError } = await supabase
        .from('debts')
        .select('*')
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (debtsError) throw debtsError;

      setExpenses((expensesData || []) as Expense[]);
      setDebts((debtsData || []) as Debt[]);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real financial metrics
  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const approvedDebts = debts.filter(d => d.status === 'approved');
  
  const totalExpenses = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalDebt = approvedDebts.reduce((sum, debt) => sum + debt.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
  const pendingDebts = debts.filter(d => d.status === 'pending').length;

  // Category breakdown from real data
  const categoryBreakdown = approvedExpenses.reduce((acc, expense) => {
    const existing = acc.find(cat => cat.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ 
        category: expense.category, 
        amount: expense.amount, 
        color: "bg-primary" 
      });
    }
    return acc;
  }, [] as Array<{ category: string; amount: number; color: string }>);

  // Calculate percentages
  const categoriesWithPercentage = categoryBreakdown.map(cat => ({
    ...cat,
    percentage: totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0
  }));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-8">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Summary</h1>
          <p className="text-muted-foreground">
            Complete overview of your family's financial health
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            This Year
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-expense" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense mb-1">
              ₹{totalExpenses.toLocaleString()}
            </div>
            <Badge variant="outline" className="text-xs">
              {approvedExpenses.length} approved
            </Badge>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-debt" />
              Total Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-debt mb-1">
              ₹{totalDebt.toLocaleString()}
            </div>
            <Badge variant="outline" className="text-xs">
              {approvedDebts.length} debts
            </Badge>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-1">
              {pendingExpenses + pendingDebts}
            </div>
            <Badge variant="outline" className="text-xs">
              {pendingExpenses} expenses, {pendingDebts} debts
            </Badge>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-1">
              {expenses.length + debts.length}
            </div>
            <Badge variant="outline" className="text-xs">
              All transactions
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvedExpenses.slice(0, 6).map((expense) => (
                <div key={expense.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{expense.category}</span>
                    <span className="text-muted-foreground">
                      ₹{expense.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {expense.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(expense.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {approvedExpenses.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No approved expenses yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Expense Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoriesWithPercentage.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">₹{category.amount.toLocaleString()}</span>
                  </div>
                  <div className="relative h-2 bg-accent rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full ${category.color} rounded-full`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.percentage}% of total</span>
                  </div>
                </div>
              ))}
              {categoriesWithPercentage.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No expense categories yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-income">Current Status</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-income mt-0.5" />
                  <span>Total approved expenses: ₹{totalExpenses.toLocaleString()}</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-debt mt-0.5" />
                  <span>Total approved debts: ₹{totalDebt.toLocaleString()}</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                  <span>Pending items: {pendingExpenses + pendingDebts} awaiting approval</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Quick Stats</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                  <span>Most common category: {categoriesWithPercentage[0]?.category || 'None'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                  <span>Recent transactions: {expenses.length + debts.length} total</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                  <span>Average expense: ₹{approvedExpenses.length > 0 ? Math.round(totalExpenses / approvedExpenses.length).toLocaleString() : '0'}</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummary;