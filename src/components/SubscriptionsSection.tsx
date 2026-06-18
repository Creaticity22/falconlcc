import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function SubscriptionsSection() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const { data: subs } = useQuery({
    queryKey: ["subscriptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const addSub = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("subscriptions").insert({
        user_id: user!.id,
        name: name.trim(),
        amount: Number(amount),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      setName("");
      setAmount("");
      setOpen(false);
      toast.success("Subscription added");
    },
    onError: () => toast.error("Couldn't add subscription"),
  });

  const deleteSub = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscriptions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Subscription removed");
    },
  });

  const total = subs?.reduce((s, x) => s + Number(x.amount), 0) ?? 0;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display font-semibold text-base flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" /> Subscriptions
          </h2>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">£{total.toFixed(2)}</span>/month in subscriptions
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-xl h-9">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display">Add subscription</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Name (e.g. Spotify)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl"
              />
              <Input
                type="number"
                placeholder="Monthly amount (£)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 rounded-xl"
              />
              <Button
                onClick={() => addSub.mutate()}
                disabled={!name.trim() || !amount || addSub.isPending}
                className="w-full h-12 rounded-xl gradient-primary text-primary-foreground border-0"
              >
                Save subscription
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {subs && subs.length > 0 ? (
        <div className="space-y-2">
          {subs.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between bg-card rounded-xl p-3 border border-border/50"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">Monthly</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-display font-semibold text-sm">£{Number(s.amount).toFixed(2)}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Remove ${s.name}?`)) deleteSub.mutate(s.id);
                  }}
                  aria-label="Delete subscription"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-6 bg-card border border-dashed border-border/50 rounded-xl">
          No subscriptions yet. Track Netflix, Spotify, gym memberships and more.
        </p>
      )}
    </section>
  );
}
