import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Plus, Check, X, AlertCircle } from "lucide-react";

const DebtManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    creditor: "",
    amount: "",
    purpose: "",
    notes: ""
  });

  // Mock debt data
  const debts = [
    {
      id: 1,
      creditor: "Credit Card (Visa)",
      amount: 2500.00,
      purpose: "Home renovations",
      status: "approved",
      createdAt: "2024-01-15",
      approvedBy: "Jane Doe"
    },
    {
      id: 2,
      creditor: "Student Loan",
      amount: 15000.00,
      purpose: "Education expenses",
      status: "approved",
      createdAt: "2024-01-10",
      approvedBy: "John Doe"
    },
    {
      id: 3,
      creditor: "Personal Loan",
      amount: 5000.00,
      purpose: "Emergency medical expenses",
      status: "pending",
      createdAt: "2024-01-18",
      approvedBy: null
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.creditor || !formData.amount || !formData.purpose) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Debt submitted for approval!");
    setFormData({
      creditor: "",
      amount: "",
      purpose: "",
      notes: ""
    });
    setShowForm(false);
  };

  const handleApprove = (debtId: number) => {
    toast.success("Debt approved successfully");
  };

  const handleReject = (debtId: number) => {
    toast.success("Debt rejected and removed");
  };

  const totalApprovedDebt = debts
    .filter(debt => debt.status === "approved")
    .reduce((sum, debt) => sum + debt.amount, 0);

  const pendingDebts = debts.filter(debt => debt.status === "pending");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Debt Management</h1>
          <p className="text-muted-foreground">
            Track and manage family debts with transparency
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Debt
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-debt">
              ${totalApprovedDebt.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {debts.filter(d => d.status === "approved").length} approved debts
            </p>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {pendingDebts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting family approval
            </p>
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${debts.filter(d => d.status === "approved").length > 0 
                ? (totalApprovedDebt / debts.filter(d => d.status === "approved").length).toFixed(2)
                : "0.00"
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per approved debt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Debt Form */}
      {showForm && (
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add New Debt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditor">Creditor/Lender *</Label>
                  <Input
                    id="creditor"
                    placeholder="Bank name, credit card, etc."
                    value={formData.creditor}
                    onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Input
                  id="purpose"
                  placeholder="What is this debt for?"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Interest rate, payment terms, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit for Approval
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Debts List */}
      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            All Debts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debts.map((debt) => (
              <div key={debt.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{debt.creditor}</h3>
                      <Badge variant={debt.status === "approved" ? "default" : "secondary"}>
                        {debt.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">
                      {debt.purpose}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {debt.createdAt}</span>
                      {debt.approvedBy && (
                        <span>Approved by: {debt.approvedBy}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-debt mb-2">
                      ${debt.amount.toFixed(2)}
                    </div>
                    
                    {debt.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="btn-income h-8 px-3"
                          onClick={() => handleApprove(debt.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="btn-expense h-8 px-3"
                          onClick={() => handleReject(debt.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {debts.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No debts recorded</h3>
              <p className="text-muted-foreground">
                Add your first debt to start tracking your family's financial obligations.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtManager;