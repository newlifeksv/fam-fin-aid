import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Receipt, Upload, DollarSign } from "lucide-react";

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "",
    category: "",
    notes: ""
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Mock submission
    toast.success("Expense submitted for approval!");
    setFormData({
      description: "",
      amount: "",
      type: "",
      category: "",
      notes: ""
    });
    setReceiptFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      toast.success("Receipt uploaded successfully");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Add New Expense</h1>
        <p className="text-muted-foreground">
          Submit an expense for family approval
        </p>
      </div>

      <Card className="financial-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Expense Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="What was this expense for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expense type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Regular Expense</SelectItem>
                    <SelectItem value="contribution">Income/Contribution</SelectItem>
                    <SelectItem value="debt-payment">Debt Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt/Invoice</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="receipt"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="receipt" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {receiptFile ? receiptFile.name : "Click to upload receipt or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional details or context..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Submit for Approval
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormData({
                  description: "",
                  amount: "",
                  type: "",
                  category: "",
                  notes: ""
                })}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="financial-card bg-accent/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-primary">Need Approval</h3>
            <p className="text-sm text-muted-foreground">
              All expenses require approval from another family member before being added to your financial records.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;