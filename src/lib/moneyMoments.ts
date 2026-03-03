export interface MomentStep {
  title: string;
  body: string;
  checklist?: string[];
}

export interface MoneyMoment {
  id: string;
  title: string;
  emoji: string;
  description: string;
  resourceTopics: string[];
  aiPrompt: string;
  steps: MomentStep[];
}

export const MONEY_MOMENTS: MoneyMoment[] = [
  {
    id: "first-job",
    title: "Getting a first job",
    emoji: "💼",
    description: "Understand payslips, tax, National Insurance and your rights as a young worker.",
    resourceTopics: ["everyday_money", "financial_independence"],
    aiPrompt: "Help me understand my payslip and tax as a young person starting my first job in the UK.",
    steps: [
      {
        title: "Your payslip explained",
        body: "When you get paid, your employer gives you a payslip. It shows your gross pay (before deductions) and net pay (what you actually receive). Key deductions include Income Tax and National Insurance (NI).",
        checklist: [
          "Check your tax code is correct (usually 1257L for most people)",
          "Understand gross vs net pay",
          "Know your NI number – you get one automatically around age 16",
        ],
      },
      {
        title: "Tax & National Insurance basics",
        body: "In the UK, you don't pay Income Tax on the first £12,570 you earn per year (your Personal Allowance). National Insurance starts at a lower threshold and funds the NHS and state pension.",
        checklist: [
          "You won't pay tax if you earn under £12,570/year",
          "NI contributions start from £242/week (2024/25)",
          "Check you're on the right tax code via HMRC",
        ],
      },
      {
        title: "Your rights at work",
        body: "As a young worker (under 18) you have extra protections. You're entitled to at least the National Minimum Wage for your age, rest breaks, and limits on working hours during school term.",
        checklist: [
          "Know the minimum wage rate for your age",
          "You're entitled to a written contract or statement",
          "Keep records of your hours worked",
        ],
      },
      {
        title: "What to do with your first pay",
        body: "It's tempting to spend it all! But setting up a simple split – even 80/20 between spending and saving – builds great habits early.",
        checklist: [
          "Open a savings account if you don't have one",
          "Set up a small automatic transfer on payday",
          "Track what you spend for the first month",
        ],
      },
    ],
  },
  {
    id: "moving-out",
    title: "Moving out / starting uni",
    emoji: "🏠",
    description: "Rent, bills, deposits and student finance – everything you need to know before you move.",
    resourceTopics: ["student_finance", "everyday_money", "benefits"],
    aiPrompt: "What should I budget for when moving out for university or my first flat in the UK?",
    steps: [
      {
        title: "Costs you need to plan for",
        body: "Moving out costs more than just rent. You'll need a deposit (usually 4–5 weeks' rent), first month's rent upfront, and money for essentials like bedding, kitchen stuff, and toiletries.",
        checklist: [
          "Budget for deposit + first month's rent",
          "Set aside £200–£400 for essentials",
          "Factor in travel costs to your new place",
        ],
      },
      {
        title: "Understanding student finance",
        body: "If you're going to uni, Student Finance England provides a Tuition Fee Loan (paid directly to your uni) and a Maintenance Loan (paid to you for living costs). You only repay once you earn over the threshold.",
        checklist: [
          "Apply for student finance as early as possible",
          "Maintenance Loan amount depends on household income",
          "Repayments only start when you earn over £25,000/year",
        ],
      },
      {
        title: "Bills and ongoing costs",
        body: "Beyond rent, you'll pay for gas/electric, water, internet, contents insurance, and a TV licence. In student halls these are often included, but in private housing you'll need to budget separately.",
        checklist: [
          "Ask if bills are included in your rent",
          "Budget around £100–£150/month for utilities in a shared house",
          "Set up a joint account for shared bills if in a house share",
        ],
      },
      {
        title: "Tenancy agreements & your rights",
        body: "Before signing a tenancy agreement, read it carefully. Check the deposit is protected in a government-approved scheme, understand your notice period, and know your rights around repairs.",
        checklist: [
          "Check your deposit is in a protected scheme",
          "Take photos of the property before moving in",
          "Know your notice period and break clause",
        ],
      },
    ],
  },
  {
    id: "phone-contract",
    title: "Phone contract vs SIM only",
    emoji: "📱",
    description: "Work out whether a contract or SIM-only deal is better value for you.",
    resourceTopics: ["everyday_money", "saving"],
    aiPrompt: "What should I think about before signing a phone contract as a teenager or young adult?",
    steps: [
      {
        title: "Contract vs SIM-only: the basics",
        body: "A phone contract bundles a handset + data/calls into one monthly payment (usually 24–36 months). SIM-only gives you just the data/calls, so you need to buy or already own a phone.",
      },
      {
        title: "Do the maths",
        body: "Add up the total cost of a contract over its full term. Compare this to buying the phone outright (or refurbished) plus a SIM-only deal. The SIM-only route is almost always cheaper overall.",
        checklist: [
          "Calculate total contract cost: monthly payment × number of months",
          "Compare to phone price + SIM-only deal total",
          "Check if you can get the phone refurbished for less",
        ],
      },
      {
        title: "Credit checks and commitments",
        body: "Phone contracts involve a credit check. If you're under 18, you'll usually need a parent or guardian to sign. Missing payments can damage your credit score, which affects you later when renting or getting a bank account.",
        checklist: [
          "Understand that a contract is a legal commitment",
          "Know that missed payments affect your credit score",
          "Check if you can afford the payments even if your income changes",
        ],
      },
      {
        title: "Making your decision",
        body: "Think about what you actually need: how much data do you use? Do you need the latest phone, or would last year's model do? Being honest with yourself here can save you hundreds.",
        checklist: [
          "Check your current data usage in your phone settings",
          "Consider whether you really need the newest model",
          "Look at comparison sites like Uswitch for the best deals",
        ],
      },
    ],
  },
];
