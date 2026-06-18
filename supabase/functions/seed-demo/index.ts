import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const DEMO_EMAIL = "demo@soarwithfalcon.com";
const DEMO_PASSWORD = "FalconDemo2026!";

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function daysAgoDate(days: number): string {
  return daysAgoISO(days).slice(0, 10);
}

function monthsFromNowDate(months: number): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function mondayOfWeek(daysAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  const dow = d.getUTCDay(); // 0=Sun
  const diff = (dow + 6) % 7; // back to Monday
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 1) Find or create the demo auth user
    let userId: string | null = null;

    // Paginate users to find by email (admin.listUsers does not support filter by email reliably)
    let page = 1;
    while (!userId) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw error;
      const match = data.users.find((u) => u.email?.toLowerCase() === DEMO_EMAIL);
      if (match) { userId = match.id; break; }
      if (data.users.length < 200) break;
      page++;
    }

    if (!userId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      if (error) throw error;
      userId = data.user!.id;
    } else {
      // Ensure password is current (idempotent reset)
      await admin.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD, email_confirm: true });
    }

    const uid = userId!;
    const today = new Date();
    const month = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}`;
    const todayDate = today.toISOString().slice(0, 10);

    // 2) profiles (upsert on user_id)
    {
      const { error } = await admin.from("profiles").upsert({
        user_id: uid,
        first_name: "Alex",
        age_range: "18-21",
        income_band: "150+",
        money_goal: "Saving for something big",
        saving_for: "travel",
        onboarding_completed: true,
        leaderboard_visible: true,
      }, { onConflict: "user_id" });
      if (error) throw new Error(`profiles: ${error.message}`);
    }

    // 3) gamification (upsert on user_id)
    {
      const { error } = await admin.from("gamification").upsert({
        user_id: uid,
        xp_points: 285,
        streak_days: 5,
        last_active_date: todayDate,
        badges: [],
      }, { onConflict: "user_id" });
      if (error) throw new Error(`gamification: ${error.message}`);
    }

    // 4) budgets (upsert on user_id,month)
    {
      const { error } = await admin.from("budgets").upsert({
        user_id: uid,
        month,
        monthly_income: 420,
        categories: [
          { name: "Essentials", planned: 200 },
          { name: "Fun", planned: 120 },
          { name: "Savings", planned: 100 },
        ],
      }, { onConflict: "user_id,month" });
      if (error) throw new Error(`budgets: ${error.message}`);
    }

    // 5) expenses (delete + re-insert)
    {
      const { error: delErr } = await admin.from("expenses").delete().eq("user_id", uid);
      if (delErr) throw new Error(`expenses delete: ${delErr.message}`);
      const expenses = [
        { amount: 18.50, category: "Essentials", note: "Tesco weekly shop",  expense_date: daysAgoDate(12) },
        { amount:  9.99, category: "Fun",        note: "Spotify Premium",    expense_date: daysAgoDate(11) },
        { amount: 12.00, category: "Essentials", note: "Bus pass top-up",    expense_date: daysAgoDate(10) },
        { amount: 24.00, category: "Fun",        note: "Cinema + snacks",    expense_date: daysAgoDate(8)  },
        { amount:  6.50, category: "Essentials", note: "Meal deal x 5",      expense_date: daysAgoDate(6)  },
        { amount: 14.99, category: "Fun",        note: "New t-shirt",        expense_date: daysAgoDate(5)  },
        { amount:  8.00, category: "Essentials", note: "Phone credit",       expense_date: daysAgoDate(3)  },
        { amount: 22.00, category: "Fun",        note: "Night out",          expense_date: daysAgoDate(1)  },
      ].map((e) => ({ ...e, user_id: uid }));
      const { error } = await admin.from("expenses").insert(expenses);
      if (error) throw new Error(`expenses insert: ${error.message}`);
    }

    // 6) savings_goals (delete + insert — no unique key)
    {
      const { error: delErr } = await admin.from("savings_goals").delete().eq("user_id", uid);
      if (delErr) throw new Error(`savings_goals delete: ${delErr.message}`);
      const { error } = await admin.from("savings_goals").insert([
        {
          user_id: uid,
          name: "Interrail Europe 🇪🇺",
          target_amount: 800,
          current_amount: 245,
          target_date: monthsFromNowDate(6),
          description: "Saving up for a summer Interrail adventure!",
        },
        {
          user_id: uid,
          name: "New Headphones 🎧",
          target_amount: 150,
          current_amount: 38,
          target_date: monthsFromNowDate(3),
          description: "Treating myself to some decent headphones",
        },
      ]);
      if (error) throw new Error(`savings_goals insert: ${error.message}`);
    }

    // 7) lesson_progress (upsert on user_id,lesson_id)
    {
      const nowIso = new Date().toISOString();
      const { error } = await admin.from("lesson_progress").upsert([
        { user_id: uid, lesson_id: "budgeting-basics",    score: 3, completed_at: nowIso },
        { user_id: uid, lesson_id: "saving-and-interest", score: 2, completed_at: nowIso },
        { user_id: uid, lesson_id: "understanding-tax",   score: 3, completed_at: nowIso },
      ], { onConflict: "user_id,lesson_id" });
      if (error) throw new Error(`lesson_progress: ${error.message}`);
    }

    // 8) money_diary_entries (upsert on user_id,week_start_date)
    {
      const { error } = await admin.from("money_diary_entries").upsert([
        { user_id: uid, mood_score: 3, mood_emoji: "😐", note: "Spent more than I wanted to this week", week_start_date: mondayOfWeek(21) },
        { user_id: uid, mood_score: 4, mood_emoji: "🙂", note: "Managed to put £20 into savings!",       week_start_date: mondayOfWeek(14) },
        { user_id: uid, mood_score: 4, mood_emoji: "🙂", note: null,                                      week_start_date: mondayOfWeek(0)  },
      ], { onConflict: "user_id,week_start_date" });
      if (error) throw new Error(`money_diary_entries: ${error.message}`);
    }

    // 9) money_wins (delete + insert)
    {
      const { error: delErr } = await admin.from("money_wins").delete().eq("user_id", uid);
      if (delErr) throw new Error(`money_wins delete: ${delErr.message}`);
      const { error } = await admin.from("money_wins").insert([
        { user_id: uid, text: "Cooked at home instead of ordering takeaway — saved about £15!", created_at: daysAgoISO(14) },
        { user_id: uid, text: "Walked instead of getting the bus for a whole week, saved £6",    created_at: daysAgoISO(7)  },
        { user_id: uid, text: "Put £25 into my Interrail fund this month 🎉",                   created_at: daysAgoISO(3)  },
      ]);
      if (error) throw new Error(`money_wins insert: ${error.message}`);
    }

    // 10) subscriptions (delete + insert)
    {
      const { error: delErr } = await admin.from("subscriptions").delete().eq("user_id", uid);
      if (delErr) throw new Error(`subscriptions delete: ${delErr.message}`);
      const { error } = await admin.from("subscriptions").insert([
        { user_id: uid, name: "Spotify",        amount: 9.99 },
        { user_id: uid, name: "iCloud Storage", amount: 0.99 },
      ]);
      if (error) throw new Error(`subscriptions insert: ${error.message}`);
    }

    return new Response(JSON.stringify({ success: true, userId: uid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e: any) {
    const message =
      (e && typeof e === "object" && (e.message || e.error_description || e.msg)) ||
      (typeof e === "string" ? e : JSON.stringify(e, Object.getOwnPropertyNames(e ?? {}))) ||
      "unknown error";
    console.error("seed-demo error:", message, "raw:", e);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

