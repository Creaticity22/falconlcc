export interface Lesson {
  id: string;
  title: string;
  topic: string;
  xpReward: number;
  content: string[];
  quiz: QuizQuestion[];
  takeaways: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export const LESSONS: Lesson[] = [
  {
    id: "budgeting-basics",
    title: "Budgeting Basics",
    topic: "Budgeting",
    xpReward: 50,
    content: [
      "A budget is simply a plan for your money. It helps you see where your money comes from and where it goes. Think of it like a game plan — you decide how to spend before you actually spend.",
      "The simplest way to budget is the 50/30/20 rule: 50% for needs (food, transport), 30% for wants (going out, subscriptions), and 20% for savings. Even with small amounts of money, this ratio works.",
      "Start by tracking what you spend for a week. You might be surprised where your money goes! Apps like Falcon make this easy by letting you log expenses as they happen."
    ],
    quiz: [
      { question: "What is a budget?", options: ["A type of bank account", "A plan for your money", "A way to borrow money", "A savings account"], correctIndex: 1 },
      { question: "In the 50/30/20 rule, what does the 20% go towards?", options: ["Wants", "Needs", "Savings", "Taxes"], correctIndex: 2 },
      { question: "What's a good first step in budgeting?", options: ["Borrow money", "Track your spending", "Open a credit card", "Ignore small expenses"], correctIndex: 1 },
    ],
    takeaways: ["A budget is a plan, not a restriction", "50/30/20 is a simple starting framework", "Tracking spending reveals hidden habits"],
  },
  {
    id: "saving-and-interest",
    title: "Saving & Interest",
    topic: "Saving",
    xpReward: 50,
    content: [
      "Saving means putting money aside for later. Even saving £5 a week adds up to £260 a year. The key is consistency — small amounts regularly beat big amounts occasionally.",
      "Interest is what a bank pays you for keeping your money with them. If you have £100 in a savings account with 5% interest, after a year you'd have £105. Compound interest means you earn interest on your interest too!",
      "The earlier you start saving, the more compound interest works in your favour. A 16-year-old who saves £20/month will have much more by age 30 than someone who starts at 25 — even saving the same monthly amount."
    ],
    quiz: [
      { question: "How much would £5 per week add up to in a year?", options: ["£52", "£260", "£500", "£100"], correctIndex: 1 },
      { question: "What is compound interest?", options: ["Interest on loans only", "Interest earned on interest", "A type of tax", "A bank fee"], correctIndex: 1 },
      { question: "Why is starting early important?", options: ["Banks give better rates to young people", "Compound interest has more time to work", "You earn more money when young", "It's not important"], correctIndex: 1 },
    ],
    takeaways: ["Consistency beats big one-off saves", "Compound interest is your superpower", "Starting early gives you a massive advantage"],
  },
  {
    id: "understanding-tax",
    title: "Understanding Tax",
    topic: "Tax",
    xpReward: 60,
    content: [
      "Tax is money the government takes from earnings to pay for public services like the NHS, schools, and roads. In the UK, most people start paying income tax when they earn over £12,570 per year (the Personal Allowance).",
      "If you have a part-time job, you probably won't pay income tax if you earn under the Personal Allowance. But National Insurance kicks in at a lower threshold. Your employer usually handles this through PAYE (Pay As You Earn).",
      "If you're self-employed or freelancing (like selling on Depop or doing gig work), you might need to do a Self Assessment tax return. Keep track of your earnings — HMRC needs to know about all your income."
    ],
    quiz: [
      { question: "What is the Personal Allowance (approx)?", options: ["£5,000", "£12,570", "£20,000", "£50,000"], correctIndex: 1 },
      { question: "What does PAYE stand for?", options: ["Pay And Yearly Earnings", "Pay As You Earn", "Personal Annual Yield Estimate", "Public Annual Year End"], correctIndex: 1 },
      { question: "When might you need a Self Assessment?", options: ["When employed full-time", "When self-employed", "When under 18", "Never"], correctIndex: 1 },
    ],
    takeaways: ["Most young workers don't pay income tax", "PAYE handles tax automatically for employed workers", "Self-employed? Track your earnings carefully"],
  },
  {
    id: "avoiding-debt-traps",
    title: "Avoiding Debt Traps",
    topic: "Debt",
    xpReward: 60,
    content: [
      "Debt isn't always bad — a student loan helps you study, a mortgage helps you buy a home. But 'bad debt' from high-interest credit cards, payday loans, or buy-now-pay-later schemes can spiral quickly.",
      "Buy Now Pay Later (BNPL) services like Klarna seem free, but missed payments can lead to fees and affect your credit score. Always check if you can actually afford something before splitting the payment.",
      "If you're ever struggling with debt, free help is available from StepChange, Citizens Advice, or the National Debtline. Never pay for debt advice — legitimate help is always free in the UK."
    ],
    quiz: [
      { question: "Which is an example of 'good' debt?", options: ["Payday loan", "Credit card for clothes", "Student loan", "BNPL for a phone"], correctIndex: 2 },
      { question: "What can happen with missed BNPL payments?", options: ["Nothing", "Fees and credit score damage", "You get extra time free", "The item is free"], correctIndex: 1 },
      { question: "Where can you get free debt advice in the UK?", options: ["A paid financial advisor", "StepChange", "Social media influencers", "Your bank manager only"], correctIndex: 1 },
    ],
    takeaways: ["Not all debt is bad, but high-interest debt is dangerous", "BNPL isn't free money", "Free debt help exists — never pay for advice"],
  },
  {
    id: "intro-to-investing",
    title: "Intro to Investing",
    topic: "Investing",
    xpReward: 70,
    content: [
      "Investing means putting your money into something (like stocks, funds, or bonds) hoping it grows over time. Unlike saving in a bank, investments can go up AND down in value — there's always risk involved.",
      "For beginners, index funds are often recommended. They spread your money across lots of companies, reducing risk. You can start with as little as £1 on some platforms. The key is to invest for the long term — think years, not weeks.",
      "Important: Falcon is educational only and doesn't give personalised investment advice. Before investing real money, consider speaking to a qualified financial adviser. In the UK, you can check the FCA register to find regulated advisers."
    ],
    quiz: [
      { question: "What's the main difference between saving and investing?", options: ["Investing is always better", "Investments can go down as well as up", "Saving earns more", "There's no difference"], correctIndex: 1 },
      { question: "What are index funds?", options: ["A type of bank account", "Funds that track many companies", "Government bonds", "Cryptocurrency"], correctIndex: 1 },
      { question: "How long should you typically plan to invest for?", options: ["Days", "Weeks", "Months", "Years"], correctIndex: 3 },
    ],
    takeaways: ["Investments can go down as well as up", "Index funds are a low-cost way to start", "Always think long term and get proper advice"],
  },
];
