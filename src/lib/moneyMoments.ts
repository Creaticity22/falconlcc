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
  {
    id: "opening-first-bank-account",
    title: "Opening my first bank account",
    emoji: "🏦",
    description: "From choosing a bank to setting up direct debits — everything you need for your first account.",
    resourceTopics: ["banking"],
    aiPrompt: "I'm about to open my first bank account. What should I look for and what questions should I ask?",
    steps: [
      {
        title: "Research your options",
        body: "UK banks all offer slightly different things. App-based banks like Monzo and Starling are easy to set up and have great budgeting tools. High-street banks like HSBC and Barclays have physical branches if you prefer in-person support. Student accounts often include an interest-free overdraft.",
        checklist: [
          "Compare at least 3 accounts",
          "Check for monthly fees",
          "Look at the mobile app reviews",
        ],
      },
      {
        title: "Gather your documents",
        body: "Most banks need proof of identity (passport or provisional driving licence) and proof of address (a utility bill, council tax letter, or bank statement). If you're under 18, you'll usually need a parent or guardian with you.",
        checklist: [
          "Photo ID ready",
          "Proof of address dated within 3 months",
          "If under 18, parent or guardian available",
        ],
      },
      {
        title: "Apply online or in branch",
        body: "App-based banks let you apply entirely from your phone — often with a video selfie. High-street banks may need an in-branch appointment. Either way, the process usually takes 10–20 minutes.",
      },
      {
        title: "Set up your online banking",
        body: "Once approved, download the app and set a strong password. Turn on biometric login (Face ID / fingerprint) and enable notifications so you can spot any unusual activity straight away.",
        checklist: [
          "Strong unique password",
          "Biometric login enabled",
          "Transaction notifications on",
        ],
      },
      {
        title: "Set up direct debits and standing orders",
        body: "A direct debit lets a company take a variable amount each month (like a phone bill). A standing order is a fixed amount you send out (like rent or savings). Setting up an automatic transfer to savings on payday is one of the best money habits you can build.",
        checklist: [
          "Move essential bills over",
          "Set up an automatic savings transfer",
          "Cancel any subscriptions you don't use",
        ],
      },
    ],
  },
  {
    id: "first-payslip",
    title: "Getting my first payslip",
    emoji: "💰",
    description: "Decode every line — gross pay, tax code, National Insurance and net pay.",
    resourceTopics: ["economy", "tax"],
    aiPrompt: "I just got my first payslip and I don't understand some of the deductions. Can you explain what everything means?",
    steps: [
      {
        title: "Understanding your gross pay",
        body: "Gross pay is the total you earned before anything is taken off. If you're on an hourly wage it's hours worked × hourly rate. If you're salaried it's your annual salary divided by 12.",
      },
      {
        title: "Finding your tax code",
        body: "Your tax code is usually a number followed by a letter (e.g. 1257L). The number × 10 = the amount you can earn tax-free in a year. 1257L is the standard code and means a £12,570 Personal Allowance.",
        checklist: [
          "Locate your tax code on the payslip",
          "Check it against gov.uk's tax code checker",
          "Flag codes starting with BR, 0T or 'emergency'",
        ],
      },
      {
        title: "Checking your National Insurance deductions",
        body: "National Insurance funds the NHS and state pension. You start paying it when you earn over £242/week. It's a separate deduction from income tax — and unlike tax, you pay it even if you're below the Personal Allowance.",
      },
      {
        title: "Confirming your net pay",
        body: "Net pay = Gross pay − Income Tax − National Insurance − any other deductions (like pension contributions). This is what should land in your bank account on payday.",
        checklist: [
          "Check the maths adds up",
          "Compare to what arrived in your bank",
          "Save your payslip — paper or PDF",
        ],
      },
      {
        title: "What to do if something looks wrong",
        body: "If your tax code looks off or you've been overtaxed, contact HMRC directly (you can do this in the HMRC app). Don't go through paid 'tax refund' services — they take a big cut for something you can do for free.",
        checklist: [
          "Use the HMRC app or gov.uk only",
          "Never pay a third party to claim a refund",
          "Keep records for at least 22 months",
        ],
      },
    ],
  },
  {
    id: "first-self-assessment",
    title: "Filing my first Self Assessment",
    emoji: "📋",
    description: "Self-employed, freelance or earning over £1,000 from a side hustle? Here's the process.",
    resourceTopics: ["economy"],
    aiPrompt: "I've been told I need to do a Self Assessment tax return. Can you walk me through what I need to do?",
    steps: [
      {
        title: "Check if you need to file",
        body: "You usually need to file a Self Assessment if you earned over £1,000 from self-employment or side hustles in the tax year (6 April – 5 April), had untaxed income, or were a higher-rate taxpayer. Gov.uk has a free 'do I need to file?' tool.",
        checklist: [
          "Add up all side-hustle income for the tax year",
          "Use gov.uk's check tool",
          "Know the deadline: 31 January online",
        ],
      },
      {
        title: "Register with HMRC Government Gateway",
        body: "Register at gov.uk/register-for-self-assessment. HMRC posts you a Unique Taxpayer Reference (UTR) — keep this safe, you'll need it every year. Register early — it can take 10 working days for the UTR to arrive.",
      },
      {
        title: "Gather your income records",
        body: "Collect everything that shows what you earned: PayPal/Stripe statements, Depop/Vinted sales reports, invoices, bank statements showing money in. A simple spreadsheet of date / source / amount works perfectly.",
        checklist: [
          "All income totals for the year",
          "Bank statements as backup",
          "Notes on any cash payments",
        ],
      },
      {
        title: "Claim your allowable expenses",
        body: "Expenses reduce your taxable profit. Common ones: postage, packaging, software, a portion of phone/internet, travel for work, equipment. Either claim actual costs with receipts, or use the £1,000 trading allowance flat — whichever is higher.",
        checklist: [
          "Receipts saved (photos are fine)",
          "Decide: actual expenses vs trading allowance",
          "Only claim genuine business costs",
        ],
      },
      {
        title: "Submit and pay any tax owed",
        body: "Log into the gov.uk Self Assessment portal, fill in the online form (it guides you step by step), and submit. HMRC tells you immediately what you owe. Pay by 31 January. If you can't afford the bill in one go, you can set up a Time to Pay arrangement.",
        checklist: [
          "Submit before 31 January",
          "Pay tax owed by 31 January",
          "Save a PDF copy of your return",
        ],
      },
    ],
  },
];
