import { useState } from "react";
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

const Index = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "expenses" | "debts" | "summary">("dashboard");

  // Mock data for demonstration
  const financialStats = {
    totalIncome: 8450.00,
    totalExpenses: 3280.50,
    totalDebts: 1200.00,
    pendingApprovals: 3
  };

  const recentTransactions = [
    { id: 1, description: "Grocery Shopping", amount: 85.43, type: "expense", status: "approved", date: "2024-01-10" },
    { id: 2, description: "Salary", amount: 3200.00, type: "income", status: "approved", date: "2024-01-09" },
    { id: 3, description: "Utility Bills", amount: 145.30, type: "expense", status: "pending", date: "2024-01-08" },
    { id: 4, description: "Freelance Income", amount: 850.00, type: "income", status: "approved", date: "2024-01-07" }
  ];

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