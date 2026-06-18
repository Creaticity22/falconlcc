import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function SavingsCalculator() {
  const [monthly, setMonthly] = useState(50);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(5);

  const { data, finalWithInterest, finalNoInterest, interestEarned } = useMemo(() => {
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    const data: { year: number; withInterest: number; noInterest: number }[] = [];
    let balance = 0;
    let principal = 0;
    for (let m = 1; m <= months; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
      principal += monthly;
      if (m % 12 === 0) {
        data.push({
          year: m / 12,
          withInterest: Math.round(balance),
          noInterest: Math.round(principal),
        });
      }
    }
    return {
      data,
      finalWithInterest: balance,
      finalNoInterest: principal,
      interestEarned: balance - principal,
    };
  }, [monthly, years, rate]);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="font-display font-semibold text-base">Savings calculator</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        See how compound interest grows your savings. Illustrative only — not financial advice.
      </p>

      <div className="bg-card rounded-2xl p-4 border border-border/50 space-y-5">
        <SliderRow
          label="Monthly savings"
          value={monthly}
          onChange={setMonthly}
          min={5}
          max={500}
          step={5}
          format={(v) => `£${v}`}
        />
        <SliderRow
          label="Years to save"
          value={years}
          onChange={setYears}
          min={1}
          max={20}
          step={1}
          format={(v) => `${v} yr${v > 1 ? "s" : ""}`}
        />
        <SliderRow
          label="Interest rate"
          value={rate}
          onChange={setRate}
          min={1}
          max={10}
          step={0.5}
          format={(v) => `${v}%`}
        />

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `£${v}`} />
              <Tooltip
                formatter={(v: number) => `£${v.toLocaleString()}`}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="withInterest"
                name="With interest"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="noInterest"
                name="Without interest"
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 4"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-sm">
          After <span className="font-semibold">{years}</span> year{years > 1 ? "s" : ""} you'd have{" "}
          <span className="font-display font-bold text-primary">£{Math.round(finalWithInterest).toLocaleString()}</span>{" "}
          (<span className="font-semibold">£{Math.round(interestEarned).toLocaleString()}</span> of that is interest).
        </div>
        <p className="text-[10px] text-muted-foreground">
          Estimates assume a steady monthly deposit and a constant rate compounded monthly. Real returns vary.
        </p>
      </div>
    </section>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
        <span className="font-display font-bold text-sm">{format(value)}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}
