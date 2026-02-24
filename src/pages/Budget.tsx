import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PieChart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useAwardXP } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const DEFAULT_CATEGORIES = [
  { name: "Essentials", planned: 0, color: "bg-primary" },
  { name: "Fun", planned: 0, color: "gradient-accent" },
  { name: "Savings", planned: 0, color: "bg-success" },
];

export default function Budget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const awardXP = useAwardXP();
  const [searchParams] = useSearchParams();
  const [showSetup, setShowSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [income, setIncome] = useState("");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [addExpenseOpen, setAddExpenseOpen] = useState(searchParams.get("add") === "1");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState("");
  const [expNote, setExpNote] = useState("");

  const month = new Date().toISOString().slice(0, 7);

  const { data: budget, isLoading } = useQuery({
    queryKey: ["budget", user?.id, month],
    queryFn: async () => {
      const { data } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user!.id)
        .eq("month", month)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const { data: expenses } = useQuery({
    queryKey: ["expenses", user?.id, month],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user!.id)
        .gte("expense_date", startOfMonth.toISOString().split("T")[0])
        .order("expense_date", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const saveBudget = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("budgets").upsert({
        user_id: user!.id,
        month,
        monthly_income: Number(income),
        categories: categories.map((c) => ({ name: c.name, planned: c.planned })),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget"] });
      qc.invalidateQueries({ queryKey: ["current-budget"] });
      setShowSetup(false);
      toast.success("Budget saved!");
      awardXP.mutate({ amount: 30, reason: "Budget set up" });
    },
  });

  const addExpense = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("expenses").insert({
        user_id: user!.id,
        amount: Number(expAmount),
        category: expCategory,
        note: expNote || null,
        expense_date: new Date().toISOString().split("T")[0],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["monthly-spent"] });
      setAddExpenseOpen(false);
      setExpAmount("");
      setExpCategory("");
      setExpNote("");
      toast.success("Expense added!");
    },
  });

  const budgetCategories = budget?.categories as { name: string; planned: number }[] | undefined;
  const totalSpent = expenses?.reduce((s, e) => s + Number(e.amount), 0) ?? 0;
  const remaining = budget ? Number(budget.monthly_income) - totalSpent : 0;

  const getSpentByCategory = (catName: string) =>
    expenses?.filter((e) => e.category === catName).reduce((s, e) => s + Number(e.amount), 0) ?? 0;

  if (isLoading) return <AppLayout><div className="pt-20 text-center text-muted-foreground">Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="pt-8 pb-4">
        <h1 className="text-2xl font-display font-bold">Budget</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </p>
      </div>

      {!budget && !showSetup ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
            <PieChart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display font-semibold text-lg">No budget yet</h2>
          <p className="text-sm text-muted-foreground">Set up a simple budget in 3 easy steps</p>
          <Button onClick={() => setShowSetup(true)} className="gradient-primary text-primary-foreground border-0 rounded-xl h-12 px-8">
            Set up your budget
          </Button>
        </motion.div>
      ) : showSetup ? (
        <BudgetSetup
          step={setupStep}
          setStep={setSetupStep}
          income={income}
          setIncome={setIncome}
          categories={categories}
          setCategories={setCategories}
          onSave={() => saveBudget.mutate()}
          saving={saveBudget.isPending}
        />
      ) : (
        <>
          {/* Overview */}
          <div className="gradient-primary rounded-2xl p-5 text-primary-foreground mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs opacity-80">Planned</p>
                <p className="text-xl font-display font-bold">£{Number(budget!.monthly_income).toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Spent</p>
                <p className="text-xl font-display font-bold">£{totalSpent.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-xs opacity-80">Left</p>
                <p className={`text-xl font-display font-bold ${remaining < 0 ? "text-destructive" : ""}`}>
                  £{remaining.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Categories */}
          <section className="mb-6">
            <h2 className="font-display font-semibold text-base mb-3">Categories</h2>
            <div className="space-y-3">
              {budgetCategories?.map((cat) => {
                const spent = getSpentByCategory(cat.name);
                const pct = cat.planned > 0 ? Math.min((spent / cat.planned) * 100, 100) : 0;
                return (
                  <div key={cat.name} className="bg-card rounded-xl p-4 border border-border/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">
                        £{spent.toFixed(0)} / £{cat.planned}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Add expense */}
          <Dialog open={addExpenseOpen} onOpenChange={setAddExpenseOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gradient-accent text-accent-foreground border-0 rounded-xl h-12 font-semibold">
                <Plus className="w-4 h-4 mr-2" /> Add expense
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display">Add expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  type="number"
                  placeholder="Amount (£)"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="h-12 rounded-xl"
                />
                <Select value={expCategory} onValueChange={setExpCategory}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetCategories?.map((c) => (
                      <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Note (optional)"
                  value={expNote}
                  onChange={(e) => setExpNote(e.target.value)}
                  className="h-12 rounded-xl"
                />
                <Button
                  onClick={() => addExpense.mutate()}
                  disabled={!expAmount || !expCategory || addExpense.isPending}
                  className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0"
                >
                  Save expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Recent expenses */}
          {expenses && expenses.length > 0 && (
            <section className="mt-6">
              <h2 className="font-display font-semibold text-base mb-3">Recent expenses</h2>
              <div className="space-y-2">
                {expenses.slice(0, 5).map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border/50">
                    <div>
                      <p className="text-sm font-medium">{exp.category}</p>
                      {exp.note && <p className="text-xs text-muted-foreground">{exp.note}</p>}
                    </div>
                    <span className="font-display font-semibold text-sm">-£{Number(exp.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <Button
            variant="outline"
            className="w-full mt-4 rounded-xl"
            onClick={() => { setShowSetup(true); setSetupStep(0); setIncome(String(budget!.monthly_income)); setCategories((budget!.categories as any[]).map(c => ({ ...c, color: "bg-primary" }))); }}
          >
            Edit budget
          </Button>
        </>
      )}
    </AppLayout>
  );
}

function BudgetSetup({
  step, setStep, income, setIncome, categories, setCategories, onSave, saving,
}: {
  step: number; setStep: (s: number) => void; income: string; setIncome: (v: string) => void;
  categories: typeof DEFAULT_CATEGORIES; setCategories: (c: typeof DEFAULT_CATEGORIES) => void;
  onSave: () => void; saving: boolean;
}) {
  const updatePlanned = (idx: number, val: number) => {
    const updated = [...categories];
    updated[idx] = { ...updated[idx], planned: val };
    setCategories(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-1.5 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "gradient-primary" : "bg-muted"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold">Monthly income</h2>
              <p className="text-sm text-muted-foreground">How much do you earn or receive each month?</p>
              <Input
                type="number"
                placeholder="£"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="h-14 rounded-xl text-lg"
                autoFocus
              />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold">Allocate your money</h2>
              <p className="text-sm text-muted-foreground">Split £{income} across categories</p>
              {categories.map((cat, i) => (
                <div key={cat.name} className="space-y-1">
                  <label className="text-sm font-medium">{cat.name}</label>
                  <Input
                    type="number"
                    placeholder="£"
                    value={cat.planned || ""}
                    onChange={(e) => updatePlanned(i, Number(e.target.value))}
                    className="h-12 rounded-xl"
                  />
                </div>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-display font-bold">Looking good! 🎉</h2>
              <p className="text-sm text-muted-foreground">Here's your budget summary</p>
              <div className="bg-card rounded-xl p-4 border border-border/50 space-y-2">
                <p className="font-medium">Monthly income: £{income}</p>
                {categories.map((cat) => (
                  <div key={cat.name} className="flex justify-between text-sm">
                    <span>{cat.name}</span>
                    <span className="font-medium">£{cat.planned}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                  <span>Total allocated</span>
                  <span>£{categories.reduce((s, c) => s + c.planned, 0)}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button
          className="flex-1 h-12 rounded-xl gradient-primary text-primary-foreground border-0"
          onClick={() => (step < 2 ? setStep(step + 1) : onSave())}
          disabled={step === 0 && !income || saving}
        >
          {step === 2 ? (saving ? "Saving..." : "Save budget") : "Continue"}
        </Button>
      </div>
    </div>
  );
}
