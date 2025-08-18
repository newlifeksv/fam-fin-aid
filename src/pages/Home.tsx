import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home as HomeIcon,
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  PieChart,
  Users,
  Receipt,
  Shield,
  Smartphone,
  BarChart3,
  Target,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-finance.jpg";

const Home = () => {
  useEffect(() => {
    // SEO for home page
    document.title = "Family Finance - Manage Your Family's Financial Future Together";
    const desc = "Complete family financial management solution. Track expenses, manage debts, invite family members, and build financial transparency together.";
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

  const features = [
    {
      icon: Receipt,
      title: "Expense Tracking",
      description: "Log and categorize all your family expenses with detailed tracking and approval workflows.",
      color: "text-expense"
    },
    {
      icon: TrendingUp,
      title: "Income Management",
      description: "Track multiple income sources and monitor your family's financial growth over time.",
      color: "text-income"
    },
    {
      icon: CreditCard,
      title: "Debt Management",
      description: "Monitor and manage family debts with payment tracking and payoff strategies.",
      color: "text-debt"
    },
    {
      icon: PieChart,
      title: "Financial Analytics",
      description: "Comprehensive reports and visualizations to understand your financial patterns.",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Family Collaboration",
      description: "Invite family members to collaborate on financial decisions with role-based access.",
      color: "text-secondary"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Bank-level security with encrypted data storage and privacy protection.",
      color: "text-primary"
    }
  ];

  const benefits = [
    "Real-time expense tracking and categorization",
    "Family member invitations and collaboration",
    "Debt payoff planning and monitoring",
    "Budget creation and spending insights",
    "Financial goal setting and tracking",
    "Secure data with privacy protection"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Quick Access Toolbar */}
      <div className="fixed top-4 right-4 z-50">
        <div className="flex gap-2 bg-card/90 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
          <Button size="sm" variant="ghost" asChild>
            <Link to="/auth">
              <DollarSign className="h-4 w-4 mr-1" />
              Login
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient text-white">
          <div className="container mx-auto px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-white/20 text-white border-white/20">
                  Family Financial Management
                </Badge>
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  Take Control of Your
                  <span className="block text-gradient bg-white text-transparent bg-clip-text">
                    Family's Finances
                  </span>
                </h1>
                <p className="text-xl opacity-90 mb-8 leading-relaxed">
                  The complete solution for modern families to track expenses, manage debts, 
                  and build financial transparency together. Start your journey to financial freedom today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                    <Link to="/auth">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <img 
                  src={heroImage} 
                  alt="Family using financial dashboard together" 
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial tools designed specifically for families who want to build wealth together.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="financial-card hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose Family Finance?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Built for families who want to achieve financial goals together with transparency and collaboration.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-income/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-income" />
                    </div>
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Card className="financial-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Smart Analytics</CardTitle>
                    <p className="text-muted-foreground">Understand your spending patterns</p>
                  </div>
                </CardHeader>
              </Card>
              <Card className="financial-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Smartphone className="h-8 w-8 text-secondary" />
                  <div>
                    <CardTitle>Mobile Ready</CardTitle>
                    <p className="text-muted-foreground">Access anywhere, anytime</p>
                  </div>
                </CardHeader>
              </Card>
              <Card className="financial-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Target className="h-8 w-8 text-debt" />
                  <div>
                    <CardTitle>Goal Tracking</CardTitle>
                    <p className="text-muted-foreground">Achieve financial milestones</p>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 hero-gradient text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Family's Finances?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of families who have taken control of their financial future. 
            Get started today and see the difference organized finances can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/auth">
                Start Your Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gradient">FamilyFinance</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              Building stronger financial futures for families everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;