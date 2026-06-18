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
  {
    id: "opening-first-bank-account",
    title: "Opening Your First Bank Account",
    topic: "Banking",
    xpReward: 40,
    content: [
      "There are two main types of bank account: a current account is for everyday spending (your card, direct debits, getting paid into), while a savings account is for putting money aside to grow over time. Most people end up with at least one of each.",
      "In the UK, popular youth and student accounts include Monzo, Starling, HSBC and Barclays. Look for no monthly fees, a contactless debit card, and a good mobile app. Student accounts often come with an interest-free overdraft as a perk.",
      "Most accounts require you to be 18, or 16+ with a parent or guardian to co-sign. Some app-based banks like Monzo 16+ let you open an account on your own from 16 — just have your ID and proof of address ready."
    ],
    quiz: [
      { question: "What's the difference between current and savings accounts?", options: ["No difference", "Current is for spending, savings is for growing money", "Savings is for spending", "Current pays more interest"], correctIndex: 1 },
      { question: "What does 'interest-free overdraft' mean for a student account?", options: ["You earn interest", "You can borrow up to a limit with no interest charged", "You can't go overdrawn", "It's a type of loan"], correctIndex: 1 },
      { question: "Which of these is a UK digital bank?", options: ["Monzo", "Chase USA", "Wells Fargo", "Deutsche Bank"], correctIndex: 0 },
    ],
    takeaways: ["Current accounts are for spending, savings accounts are for growing money", "Compare accounts before you open one", "Some accounts are designed specifically for under-18s"],
  },
  {
    id: "understanding-payslip",
    title: "Understanding Your Payslip",
    topic: "Tax",
    xpReward: 50,
    content: [
      "A UK payslip shows your gross pay (total earned before deductions), income tax (PAYE), National Insurance contributions, and finally your net pay — the amount that actually lands in your bank account.",
      "Your tax code (like 1257L) tells your employer how much tax-free income you get. 1257L means you can earn £12,570/year before paying income tax. If your code looks wrong (BR, 0T, or an emergency code) you may be paying too much.",
      "If you earn under the Personal Allowance (£12,570/year) you shouldn't pay any income tax. If you have been overtaxed — common with part-time or summer jobs — you can claim a refund directly from HMRC online."
    ],
    quiz: [
      { question: "What is 'net pay'?", options: ["Pay before deductions", "What you actually receive after deductions", "Just your tax", "Bonus pay"], correctIndex: 1 },
      { question: "What does PAYE stand for?", options: ["Pay After Yearly Earnings", "Pay As You Earn", "Personal Allowance Yearly Estimate", "Public Annual Yield"], correctIndex: 1 },
      { question: "If you earn under £12,570/year, should you pay income tax?", options: ["Yes, always", "No", "Only if employed", "Only over 18"], correctIndex: 1 },
    ],
    takeaways: ["Gross pay is before deductions, net pay is what you actually receive", "Check your tax code is correct", "You can claim a tax refund if you've been overtaxed"],
  },
  {
    id: "credit-score-basics",
    title: "What is a Credit Score?",
    topic: "Credit",
    xpReward: 60,
    content: [
      "A credit score is a number that tells lenders how reliable you are at paying money back. It matters when you apply for a phone contract, rent a flat, get a mortgage, or even open some bank accounts.",
      "In the UK there are three main credit agencies: Experian, Equifax and TransUnion. Each holds a record of your borrowing history. You can check your score for free on apps like ClearScore or Credit Karma.",
      "To build a good score: register to vote at your address, pay every bill on time, use a credit card occasionally and pay it off in full, and avoid lots of applications close together. Young people often have a 'thin credit file' — not bad, just empty — so starting early helps."
    ],
    quiz: [
      { question: "What is a credit score used for?", options: ["Buying food", "Showing lenders if you're reliable", "Your tax return", "School grades"], correctIndex: 1 },
      { question: "Which of these improves your credit score?", options: ["Missing payments", "Paying bills on time", "Lots of applications at once", "Never using credit"], correctIndex: 1 },
      { question: "What is a 'thin credit file'?", options: ["A bad score", "Little or no credit history yet", "A type of loan", "A bank fee"], correctIndex: 1 },
    ],
    takeaways: ["Your credit score affects your future financial options", "You can start building credit early", "Paying on time is the single biggest factor"],
  },
  {
    id: "student-finance-explained",
    title: "Student Finance Explained",
    topic: "Student Finance",
    xpReward: 60,
    content: [
      "Student finance has two parts. The Tuition Fee Loan (up to £9,250/year) is paid directly to your university — you never see it. The Maintenance Loan helps with living costs and is paid to you in three instalments; how much depends on your household income and where you study.",
      "You only start repaying when you earn over £25,000/year (Plan 5). You pay 9% of everything above that threshold — so on a £28,000 salary you'd repay 9% of £3,000 = about £22/month. If your income drops, repayments stop automatically.",
      "Anything you haven't repaid after 30 years is wiped. For most graduates this works more like a graduate tax than a traditional debt. Don't let fear of 'debt' put you off uni if it's the right path for you."
    ],
    quiz: [
      { question: "When do you start repaying a student loan?", options: ["Immediately", "When you earn over £25,000", "After graduation no matter what", "Never"], correctIndex: 1 },
      { question: "What % of earnings above the threshold do you repay?", options: ["5%", "9%", "20%", "50%"], correctIndex: 1 },
      { question: "After how many years is the loan written off?", options: ["10", "20", "30", "Never"], correctIndex: 2 },
    ],
    takeaways: ["Student loans are income-contingent — you only pay when you can afford to", "It's more like a graduate tax than a traditional loan", "Don't let fear of debt stop you from going to university if it's right for you"],
  },
  {
    id: "side-hustles-and-tax",
    title: "Side Hustles & Tax",
    topic: "Tax",
    xpReward: 70,
    content: [
      "HMRC gives everyone a £1,000 trading allowance. If you earn under £1,000/year from side hustles — selling on Depop or Vinted, tutoring, dog walking, freelance design — you don't need to tell HMRC or pay any tax on it.",
      "Earn more than £1,000? You'll need to register as self-employed and complete a Self Assessment tax return each year. It sounds scary but it's mostly an online form. You declare what you earned, claim any expenses, and HMRC tells you what (if anything) you owe.",
      "Allowable expenses reduce your taxable profit: postage and packaging for Depop sales, a portion of your phone bill for tutoring, software subscriptions for content creation. Keep simple records from day one — a spreadsheet or notes app is enough."
    ],
    quiz: [
      { question: "What is the HMRC trading allowance?", options: ["£100", "£500", "£1,000", "£12,570"], correctIndex: 2 },
      { question: "If you earn £1,500 from Depop in a year, what should you do?", options: ["Nothing", "Register as self-employed and do a Self Assessment", "Pay 50% tax instantly", "Close the account"], correctIndex: 1 },
      { question: "What can you offset as a self-employed expense?", options: ["Holiday flights", "Postage and packaging for sales", "Cinema tickets", "Birthday presents"], correctIndex: 1 },
    ],
    takeaways: ["Under £1,000/year from a side hustle? You're fine", "Over £1,000? Register with HMRC — it's not scary", "Keep records of your income and expenses from day one"],
  },
];
