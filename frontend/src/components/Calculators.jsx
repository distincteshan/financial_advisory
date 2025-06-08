import React, { useState } from 'react';
import Navbar from './NavBar';
import { motion } from 'framer-motion';
import { fadeIn, textVariant } from '../utils/motion';

const CalculatorCard = ({ title, children, icon }) => (
  <motion.div
    variants={fadeIn("up", 0.3)}
    className="bg-black/40 rounded-2xl p-6 border border-gray-800 hover:border-indigo-500/30 transition-all duration-300"
  >
    <div className="flex items-center space-x-3 mb-6">
      <div className="text-indigo-400 text-2xl">{icon}</div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const InputField = ({ label, value, onChange, type = "number", min = "0", step = "1" }) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      step={step}
      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors duration-300"
    />
  </div>
);

const ResultCard = ({ title, value, subtitle }) => (
  <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg p-4 border border-indigo-500/30">
    <h4 className="text-indigo-400 text-sm font-medium">{title}</h4>
    <p className="text-2xl font-bold text-white">{value}</p>
    {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
  </div>
);

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);

  const calculateSIP = () => {
    const monthlyRate = expectedReturn / 100 / 12;
    const numberOfPayments = timePeriod * 12;
    
    if (monthlyRate === 0) {
      return monthlyInvestment * numberOfPayments;
    }
    
    const futureValue = monthlyInvestment * 
      (((Math.pow(1 + monthlyRate, numberOfPayments) - 1) / monthlyRate) * (1 + monthlyRate));
    
    return Math.round(futureValue);
  };

  const futureValue = calculateSIP();
  const totalInvestment = monthlyInvestment * timePeriod * 12;
  const totalReturns = futureValue - totalInvestment;

  return (
    <CalculatorCard title="SIP Calculator" icon="📈">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <InputField
            label="Monthly Investment (₹)"
            value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
            min="500"
            step="500"
          />
          <InputField
            label="Expected Annual Return (%)"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            min="1"
            max="30"
            step="0.5"
          />
          <InputField
            label="Time Period (Years)"
            value={timePeriod}
            onChange={(e) => setTimePeriod(Number(e.target.value))}
            min="1"
            max="50"
          />
        </div>
        <div className="space-y-4">
          <ResultCard
            title="Maturity Amount"
            value={formatCurrency(futureValue)}
            subtitle="Total value after investment period"
          />
          <ResultCard
            title="Total Investment"
            value={formatCurrency(totalInvestment)}
            subtitle="Amount you will invest"
          />
          <ResultCard
            title="Total Returns"
            value={formatCurrency(totalReturns)}
            subtitle="Wealth gained from investment"
          />
        </div>
      </div>
    </CalculatorCard>
  );
};

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(10);
  const [time, setTime] = useState(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState(1);

  const calculateCompoundInterest = () => {
    const amount = principal * Math.pow(1 + (rate / 100) / compoundingFrequency, compoundingFrequency * time);
    return Math.round(amount);
  };

  const maturityAmount = calculateCompoundInterest();
  const interestEarned = maturityAmount - principal;

  return (
    <CalculatorCard title="Compound Interest Calculator" icon="💰">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <InputField
            label="Principal Amount (₹)"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            min="1000"
            step="1000"
          />
          <InputField
            label="Annual Interest Rate (%)"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            min="1"
            max="30"
            step="0.25"
          />
          <InputField
            label="Time Period (Years)"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            min="1"
            max="50"
          />
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">Compounding Frequency</label>
            <select
              value={compoundingFrequency}
              onChange={(e) => setCompoundingFrequency(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value={1}>Annually</option>
              <option value={2}>Half-Yearly</option>
              <option value={4}>Quarterly</option>
              <option value={12}>Monthly</option>
              <option value={365}>Daily</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <ResultCard
            title="Maturity Amount"
            value={formatCurrency(maturityAmount)}
            subtitle="Total amount after compound interest"
          />
          <ResultCard
            title="Principal Amount"
            value={formatCurrency(principal)}
            subtitle="Initial investment"
          />
          <ResultCard
            title="Interest Earned"
            value={formatCurrency(interestEarned)}
            subtitle="Wealth created through compounding"
          />
        </div>
      </div>
    </CalculatorCard>
  );
};

const GoalBasedCalculator = () => {
  const [goalAmount, setGoalAmount] = useState(1000000);
  const [currentAge, setCurrentAge] = useState(25);
  const [goalAge, setGoalAge] = useState(35);
  const [expectedReturn, setExpectedReturn] = useState(12);

  const calculateGoalBasedSIP = () => {
    const years = goalAge - currentAge;
    const monthlyRate = expectedReturn / 100 / 12;
    const numberOfPayments = years * 12;
    
    if (years <= 0) return 0;
    
    if (monthlyRate === 0) {
      return Math.round(goalAmount / numberOfPayments);
    }
    
    // Correct formula: PMT = FV * r / ((1 + r)^n - 1)
    // This calculates the monthly payment needed to reach future value
    const monthlySIP = goalAmount * monthlyRate / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(monthlySIP);
  };

  const requiredSIP = calculateGoalBasedSIP();
  const totalInvestment = requiredSIP * (goalAge - currentAge) * 12;
  const wealthGain = goalAmount - totalInvestment;

  return (
    <CalculatorCard title="Goal-Based Investment Calculator" icon="🎯">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <InputField
            label="Target Goal Amount (₹)"
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
            min="100000"
            step="100000"
          />
          <InputField
            label="Current Age"
            value={currentAge}
            onChange={(e) => setCurrentAge(Number(e.target.value))}
            min="18"
            max="65"
          />
          <InputField
            label="Goal Age"
            value={goalAge}
            onChange={(e) => setGoalAge(Number(e.target.value))}
            min={currentAge + 1}
            max="80"
          />
          <InputField
            label="Expected Annual Return (%)"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            min="1"
            max="25"
            step="0.5"
          />
        </div>
        <div className="space-y-4">
          <ResultCard
            title="Required Monthly SIP"
            value={formatCurrency(requiredSIP)}
            subtitle="Monthly investment needed"
          />
          <ResultCard
            title="Total Investment"
            value={formatCurrency(totalInvestment)}
            subtitle="Amount you will invest"
          />
          <ResultCard
            title="Wealth Gain"
            value={formatCurrency(wealthGain)}
            subtitle="Returns from your investment"
          />
        </div>
      </div>
    </CalculatorCard>
  );
};

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [inflationRate, setInflationRate] = useState(6);

  const calculateRetirement = () => {
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = 85 - retirementAge; // Assuming life expectancy of 85
    
    // Future value of monthly expenses considering inflation
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    
    // Annual expenses in retirement
    const annualExpensesInRetirement = futureMonthlyExpenses * 12;
    
    // Corpus needed at retirement (assuming expenses grow at inflation during retirement)
    const realReturnRate = ((1 + expectedReturn / 100) / (1 + inflationRate / 100)) - 1;
    let corpusNeeded;
    
    if (realReturnRate <= 0) {
      corpusNeeded = annualExpensesInRetirement * yearsInRetirement;
    } else {
      corpusNeeded = annualExpensesInRetirement * (1 - Math.pow(1 + realReturnRate, -yearsInRetirement)) / realReturnRate;
    }
    
    // Required monthly SIP
    const monthlyRate = expectedReturn / 100 / 12;
    const numberOfPayments = yearsToRetirement * 12;
    
    let requiredMonthlySIP;
    if (monthlyRate === 0) {
      requiredMonthlySIP = corpusNeeded / numberOfPayments;
    } else {
      requiredMonthlySIP = corpusNeeded * monthlyRate / 
        (((Math.pow(1 + monthlyRate, numberOfPayments) - 1) / monthlyRate) * (1 + monthlyRate));
    }
    
    return {
      corpusNeeded: Math.round(corpusNeeded),
      requiredMonthlySIP: Math.round(requiredMonthlySIP),
      futureMonthlyExpenses: Math.round(futureMonthlyExpenses),
      totalInvestment: Math.round(requiredMonthlySIP * numberOfPayments)
    };
  };

  const retirement = calculateRetirement();

  return (
    <CalculatorCard title="Retirement Planning Calculator" icon="🏖️">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <InputField
            label="Current Age"
            value={currentAge}
            onChange={(e) => setCurrentAge(Number(e.target.value))}
            min="20"
            max="60"
          />
          <InputField
            label="Retirement Age"
            value={retirementAge}
            onChange={(e) => setRetirementAge(Number(e.target.value))}
            min={currentAge + 5}
            max="70"
          />
          <InputField
            label="Current Monthly Expenses (₹)"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            min="10000"
            step="5000"
          />
          <InputField
            label="Expected Return on Investment (%)"
            value={expectedReturn}
            onChange={(e) => setExpectedReturn(Number(e.target.value))}
            min="6"
            max="20"
            step="0.5"
          />
          <InputField
            label="Expected Inflation Rate (%)"
            value={inflationRate}
            onChange={(e) => setInflationRate(Number(e.target.value))}
            min="3"
            max="10"
            step="0.25"
          />
        </div>
        <div className="space-y-4">
          <ResultCard
            title="Retirement Corpus Needed"
            value={formatCurrency(retirement.corpusNeeded)}
            subtitle="Amount needed at retirement"
          />
          <ResultCard
            title="Required Monthly SIP"
            value={formatCurrency(retirement.requiredMonthlySIP)}
            subtitle="Monthly investment needed"
          />
          <ResultCard
            title="Future Monthly Expenses"
            value={formatCurrency(retirement.futureMonthlyExpenses)}
            subtitle="Expenses at retirement (inflation-adjusted)"
          />
        </div>
      </div>
    </CalculatorCard>
  );
};

const Calculators = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-10"></div>
      
      {/* Animated Dots */}
      <div className="fixed inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] -z-10"></div>

      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <motion.div
          variants={fadeIn("up", 0.2)}
          initial="hidden"
          animate="show"
          className="text-center mb-16 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
          <motion.h1
            variants={textVariant(0.3)}
            className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Investment Calculators
          </motion.h1>
          <motion.p
            variants={fadeIn("up", 0.4)}
            className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
          >
            Plan your financial future with our comprehensive suite of investment calculators. 
            Make informed decisions with precise calculations for SIP, compound interest, goals, and retirement.
          </motion.p>
        </motion.div>

        {/* Calculators Grid */}
        <div className="space-y-12">
          <SIPCalculator />
          <CompoundInterestCalculator />
          <GoalBasedCalculator />
          <RetirementCalculator />
        </div>

        {/* Disclaimer */}
        <motion.div
          variants={fadeIn("up", 0.6)}
          initial="hidden"
          animate="show"
          className="mt-16 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6"
        >
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Disclaimer</h3>
          <p className="text-gray-400 text-sm">
            These calculators provide estimates based on the inputs provided and assumed rates of return. 
            Actual investment returns may vary due to market conditions, fees, and other factors. 
            Please consult with a financial advisor for personalized investment advice.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Calculators; 