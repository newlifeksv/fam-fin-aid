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
  Filter
} from "lucide-react";

const FinancialSummary = () => {
  // Mock data for charts and summaries
  const monthlyData = [
    { month: "Jan", income: 5200, expenses: 3800, debt: 200 },
    { month: "Feb", income: 4800, expenses: 4200, debt: 150 },
    { month: "Mar", income: 5500, expenses: 3600, debt: 300 },
    { month: "Apr", income: 5100, expenses: 3900, debt: 250 },
    { month: "May", income: 5800, expenses: 4100, debt: 100 },
    { month: "Jun", income: 6200, expenses: 3500, debt: 200 }
  ];

  const categoryBreakdown = [
    { category: "Groceries", amount: 850, percentage: 25, color: "bg-primary" },
    { category: "Utilities", amount: 420, percentage: 12, color: "bg-secondary" },
    { category: "Transportation", amount: 680, percentage: 20, color: "bg-debt" },
    { category: "Entertainment", amount: 340, percentage: 10, color: "bg-expense" },
    { category: "Healthcare", amount: 510, percentage: 15, color: "bg-income" },
    { category: "Other", amount: 600, percentage: 18, color: "bg-accent" }
  ];

  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const totalDebt = monthlyData.reduce((sum, month) => sum + month.debt, 0);
  const netSavings = totalIncome - totalExpenses - totalDebt;

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
              <TrendingUp className="h-4 w-4 text-income" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income mb-1">
              ${totalIncome.toFixed(2)}
            </div>
            <Badge variant="outline" className="text-xs">
              +8.2% vs last period
            </Badge>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-expense" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense mb-1">
              ${totalExpenses.toFixed(2)}
            </div>
            <Badge variant="outline" className="text-xs">
              -2.1% vs last period
            </Badge>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-debt" />
              Debt Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-debt mb-1">
              ${totalDebt.toFixed(2)}
            </div>
            <Badge variant="outline" className="text-xs">
              -15.3% vs last period
            </Badge>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Net Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold mb-1 ${netSavings >= 0 ? 'text-income' : 'text-expense'}`}>
              ${netSavings.toFixed(2)}
            </div>
            <Badge variant={netSavings >= 0 ? "default" : "destructive"} className="text-xs">
              {netSavings >= 0 ? 'Surplus' : 'Deficit'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month, index) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{month.month}</span>
                    <span className="text-muted-foreground">
                      Net: ${(month.income - month.expenses - month.debt).toFixed(0)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-accent rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-income rounded-full"
                      style={{ width: `${(month.income / 7000) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Income: ${month.income}</span>
                    <span>Expenses: ${month.expenses}</span>
                  </div>
                </div>
              ))}
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
              {categoryBreakdown.map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-muted-foreground">${category.amount}</span>
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
              <h3 className="font-semibold text-income">Positive Trends</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-income mt-0.5" />
                  <span>Income increased by 8.2% compared to last period</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-income mt-0.5" />
                  <span>Debt payments reduced by 15.3%</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-income mt-0.5" />
                  <span>Consistent savings over the last 3 months</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-primary">Recommendations</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                  <span>Consider increasing emergency fund contributions</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                  <span>Review transportation expenses for potential savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-primary mt-0.5" />
                  <span>Set up automatic savings for surplus months</span>
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