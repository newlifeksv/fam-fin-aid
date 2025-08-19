import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, Plus, Check, X, AlertCircle, IndianRupee } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

interface Debt {
  id: string;
  creditor: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const DebtManager = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    creditor: "",
    amount: "",
    purpose: "",
    notes: ""
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadDebts();
      }
    });

    const channel = supabase
      .channel('debts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts' }, () => {
        loadDebts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDebts = async () => {
    if (!session?.user) return;

    try {
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (!familyMembers?.length) return;

      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('family_id', familyMembers[0].family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDebts(data || []);
    } catch (error) {
      console.error('Error loading debts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.creditor || !formData.amount || !formData.purpose) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!session?.user) return;
    setIsSubmitting(true);

    try {
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', session.user.id)
        .limit(1);

      if (!familyMembers?.length) return;

      const { error } = await supabase
        .from('debts')
        .insert({
          user_id: session.user.id,
          family_id: familyMembers[0].family_id,
          creditor: formData.creditor,
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
        });

      if (error) throw error;

      toast.success("Debt submitted for approval!");
      setFormData({ creditor: "", amount: "", purpose: "", notes: "" });
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to submit debt request");
    } finally {
      setIsSubmitting(false);
    }
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
          <p className="text-muted-foreground">Track and manage family debts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Debt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-debt">
              ₹{totalApprovedDebt.toLocaleString()}
            </div>
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
          </CardContent>
        </Card>

        <Card className="financial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ₹{debts.filter(d => d.status === "approved").length > 0 
                ? Math.round(totalApprovedDebt / debts.filter(d => d.status === "approved").length).toLocaleString()
                : "0"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Add New Debt</CardTitle>
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
                  <Label htmlFor="amount">Amount (₹) *</Label>
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
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="financial-card">
        <CardHeader>
          <CardTitle>All Debts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading debts...</div>
          ) : debts.length > 0 ? (
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
                      <p className="text-sm text-muted-foreground mb-1">{debt.purpose}</p>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(debt.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-debt mb-2">
                        ₹{debt.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No debts recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebtManager;