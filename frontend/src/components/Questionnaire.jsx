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
          <div className="text-sm text-gray-500">• Analyzing risk tolerance</div>
          <div className="text-sm text-gray-500">• Calculating optimal asset allocation</div>
          <div className="text-sm text-gray-500">• Generating investment recommendations</div>
        </div>
      </div>
    </div>
  </div>
);

const Questionnaire = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const questions = [
    {
      id: 1,
      question: "What is your primary investment goal?",
      options: [
        { text: "Preserving my wealth and avoiding losses", value: 1 },
        { text: "Generating stable, reliable income", value: 2 },
        { text: "Balanced growth and income", value: 3 },
        { text: "Growing my wealth over time", value: 4 },
        { text: "Maximizing potential returns", value: 5 }
      ]
    },
    {
      id: 2,
      question: "How long do you plan to invest your money before you need it?",
      options: [
        { text: "Less than 1 year", value: 1 },
        { text: "1-3 years", value: 2 },
        { text: "3-5 years", value: 3 },
        { text: "5-10 years", value: 4 },
        { text: "More than 10 years", value: 5 }
      ]
    },
    {
      id: 3,
      question: "If your investment portfolio lost 20% of its value in a short period, how would you react?",
      options: [
        { text: "Sell all my investments immediately", value: 1 },
        { text: "Sell some of my investments", value: 2 },
        { text: "Wait and see before making any decisions", value: 3 },
        { text: "Keep my investments and wait for recovery", value: 4 },
        { text: "Buy more investments while prices are low", value: 5 }
      ]
    },
    {
      id: 4,
      question: "What is your current knowledge of investment markets and financial instruments?",
      options: [
        { text: "Very limited knowledge", value: 1 },
        { text: "Basic understanding", value: 2 },
        { text: "Good understanding of major concepts", value: 3 },
        { text: "Strong knowledge", value: 4 },
        { text: "Expert level knowledge", value: 5 }
      ]
    },
    {
      id: 5,
      question: "What percentage of your monthly income can you comfortably save for investments?",
      options: [
        { text: "Less than 5%", value: 1 },
        { text: "5-10%", value: 2 },
        { text: "10-20%", value: 3 },
        { text: "20-30%", value: 4 },
        { text: "More than 30%", value: 5 }
      ]
    },
    {
      id: 6,
      question: "Which statement best describes your investment preference?",
      options: [
        { text: "I prefer guaranteed returns, even if they are low", value: 1 },
        { text: "I prefer mostly stable investments with some growth potential", value: 2 },
        { text: "I prefer a mix of stable and growth investments", value: 3 },
        { text: "I prefer mostly growth investments with some stability", value: 4 },
        { text: "I prefer high-risk, high-reward investments", value: 5 }
      ]
    },
    {
      id: 7,
      question: "How often do you plan to monitor and adjust your investments?",
      options: [
        { text: "Daily", value: 5 },
        { text: "Weekly", value: 4 },
        { text: "Monthly", value: 3 },
        { text: "Quarterly", value: 2 },
        { text: "Annually or less frequently", value: 1 }
      ]
    },
    {
      id: 8,
      question: "What is your primary source of income?",
      options: [
        { text: "Fixed pension/retirement income", value: 1 },
        { text: "Stable salary with little variation", value: 2 },
        { text: "Salary with bonus/commission", value: 3 },
        { text: "Self-employed/Business owner", value: 4 },
        { text: "Investment income/Multiple sources", value: 5 }
      ]
    },
    {
      id: 9,
      question: "How would you describe your financial obligations?",
      options: [
        { text: "High debt and financial obligations", value: 1 },
        { text: "Moderate debt with stable obligations", value: 2 },
        { text: "Low debt with flexible obligations", value: 3 },
        { text: "Very little debt or obligations", value: 4 },
        { text: "No significant financial obligations", value: 5 }
      ]
    },
    {
      id: 10,
      question: "What is your age group?",
      options: [
        { text: "Over 65", value: 1 },
        { text: "55-65", value: 2 },
        { text: "45-54", value: 3 },
        { text: "35-44", value: 4 },
        { text: "Under 35", value: 5 }
      ]
    }
  ];

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    setError(''); // Clear any existing error
    
    // Don't automatically advance to next question
    // Let user control navigation
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
      const response = await axios.post('http://localhost:5000/auth/submit-questionnaire', 
        { answers },
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
        }, 5000);
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
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Risk Assessment Questionnaire</h2>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="text-sm text-gray-500">
                {totalAnswered} of {questions.length} questions answered
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {questions[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    answers[currentQuestion] === option.value 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'border-gray-300'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className={`px-4 py-2 rounded-md ${
                isFirstQuestion
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-4">
              {!isLastQuestion && (
                <button
                  onClick={handleNext}
                  disabled={!hasAnsweredCurrent}
                  className={`px-4 py-2 rounded-md ${
                    !hasAnsweredCurrent
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Next
                </button>
              )}

              {isLastQuestion && (
                <button
                  onClick={submitQuestionnaire}
                  disabled={!allQuestionsAnswered}
                  className={`px-4 py-2 rounded-md ${
                    !allQuestionsAnswered
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
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