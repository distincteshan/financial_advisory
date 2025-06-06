import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Personalized Portfolio</h2>
        <p className="text-gray-600 mb-4">Please wait while we analyze your risk profile and generate your custom investment strategy...</p>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div className="animate-progress-bar bg-blue-500 h-2 rounded-full"></div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-gray-500">• Analyzing investment amount and constraints</div>
          <div className="text-sm text-gray-500">• Calculating risk tolerance</div>
          <div className="text-sm text-gray-500">• Optimizing asset allocation</div>
          <div className="text-sm text-gray-500">• Generating personalized recommendations</div>
        </div>
      </div>
    </div>
  </div>
);

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [inputValue, setInputValue] = useState('');
  
  const questions = [
    {
      id: 1,
      question: "How much would you like to invest?",
      type: "amount",
      minAmount: 50000, // Minimum ₹50,000
      description: "Minimum investment amount is ₹50,000 to ensure proper diversification across assets."
    },
    {
      id: 2,
      question: "What is your investment time horizon?",
      options: [
        { text: "1-2 years (Short term)", value: 1 },
        { text: "3-5 years (Medium term)", value: 2 },
        { text: "6-10 years (Long term)", value: 3 },
        { text: "11-20 years (Very long term)", value: 4 },
        { text: "More than 20 years", value: 5 }
      ]
    },
    {
      id: 3,
      question: "How comfortable are you with investment risk?",
      options: [
        { text: "Very uncomfortable - I prefer guaranteed returns", value: 1 },
        { text: "Somewhat uncomfortable - I can accept small fluctuations", value: 2 },
        { text: "Neutral - I understand markets go up and down", value: 3 },
        { text: "Comfortable - I can handle moderate volatility", value: 4 },
        { text: "Very comfortable - I can handle significant volatility", value: 5 }
      ]
    },
    {
      id: 4,
      question: "How stable is your income source?",
      options: [
        { text: "Not stable - Irregular income", value: 1 },
        { text: "Somewhat stable - Some variations", value: 2 },
        { text: "Stable - Fixed salary", value: 3 },
        { text: "Very stable - Multiple income sources", value: 4 },
        { text: "Extremely stable - Significant savings/pension", value: 5 }
      ]
    },
    {
      id: 5,
      question: "Do you have an emergency fund?",
      options: [
        { text: "No emergency fund", value: 1 },
        { text: "1-2 months of expenses saved", value: 2 },
        { text: "3-6 months of expenses saved", value: 3 },
        { text: "6-12 months of expenses saved", value: 4 },
        { text: "Over 12 months of expenses saved", value: 5 }
      ]
    },
    {
      id: 6,
      question: "How would you rate your investment knowledge?",
      options: [
        { text: "Beginner - New to investing", value: 1 },
        { text: "Basic - Understand fundamental concepts", value: 2 },
        { text: "Intermediate - Regular investor", value: 3 },
        { text: "Advanced - Experienced investor", value: 4 },
        { text: "Expert - Professional knowledge", value: 5 }
      ]
    }
  ];

  const handleAnswer = (value) => {
    if (currentQuestion === 0) {
      // Handle investment amount input
      const numericValue = value.replace(/[^0-9]/g, "");
      const amount = parseInt(numericValue, 10);
      
      setInputValue(numericValue);
      
      if (numericValue === '') {
        setInvestmentAmount('');
        return;
      }

      if (amount < questions[0].minAmount) {
        setError(`Minimum investment amount is ${formatINR(questions[0].minAmount)}`);
        return;
      }

      setInvestmentAmount(amount);
      setAnswers({ ...answers, [currentQuestion]: amount });
      setError('');
    } else {
      // Handle other questions
      setAnswers({ ...answers, [currentQuestion]: value });
      setError('');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setError('');
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setError('');
    }
  };

  const submitQuestionnaire = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError('Please answer all questions before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Save questionnaire responses to localStorage
      const questionnaireResponses = {
        investmentAmount: answers[0],
        riskProfile: {
          timeHorizon: answers[1],
          riskTolerance: answers[2],
          incomeStability: answers[3],
          emergencyFund: answers[4],
          investmentKnowledge: answers[5]
        }
      };
      
      localStorage.setItem('questionnaireResponses', JSON.stringify(questionnaireResponses));
      
      const response = await axios.post('http://localhost:5000/auth/submit-questionnaire', 
        { 
          answers,
          investmentAmount: answers[0] // Include investment amount in submission
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Simulate portfolio generation time
        setTimeout(() => {
          setIsLoading(false);
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting questionnaire');
      console.error('Error submitting questionnaire:', error);
      setIsLoading(false);
    }
  };

  if (questions.length === 0) return <div>Loading...</div>;

  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnsweredCurrent = answers.hasOwnProperty(currentQuestion);
  const totalAnswered = Object.keys(answers).length;
  const allQuestionsAnswered = totalAnswered === questions.length;

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Profile Questionnaire</h2>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="text-sm text-gray-500">
                {totalAnswered} of {questions.length} answered
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {questions[currentQuestion].question}
            </h3>

            {currentQuestion === 0 ? (
              // Investment amount input
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Enter amount in INR"
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {investmentAmount && (
                    <div className="mt-2 text-sm text-gray-600">
                      Formatted amount: {formatINR(investmentAmount)}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{questions[currentQuestion].description}</p>
              </div>
            ) : (
              // Multiple choice questions
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full text-left px-4 py-3 border-2 rounded-lg transition-all duration-200 hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      answers[currentQuestion] === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                isFirstQuestion
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-4">
              {!isLastQuestion && (
                <button
                  onClick={handleNext}
                  disabled={!hasAnsweredCurrent}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    !hasAnsweredCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  Next
                </button>
              )}

              {isLastQuestion && (
                <button
                  onClick={submitQuestionnaire}
                  disabled={!allQuestionsAnswered}
                  className={`px-6 py-2 rounded-lg transition-all duration-200 ${
                    !allQuestionsAnswered
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                  }`}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Questionnaire; 