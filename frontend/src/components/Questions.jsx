import { useState } from "react";
import axios from "axios";

const questions = [
  {
    id: 1,
    text: "How long do you plan to invest before needing the funds?",
    options: [
      { text: "Less than 3 years", points: 1 },
      { text: "3-5 years", points: 2 },
      { text: "6-10 years", points: 3 },
      { text: "More than 10 years", points: 3 },
    ],
  },
  // Add all other questions in similar format
  // ...
  {
    id: 12,
    text: "Which portfolio would you prefer?",
    options: [
      { text: "80% bonds, 20% stocks", points: 1 },
      { text: "50% bonds, 50% stocks", points: 2 },
      { text: "20% bonds, 80% stocks", points: 3 },
    ],
  },
];

const RiskQuestionnaire = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (questionId, points) => {
    setAnswers((prev) => ({ ...prev, [questionId]: points }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const calculateScore = () => {
    const score = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    setTotalScore(score);
    return score;
  };

  const handleSubmit = async () => {
    const finalScore = calculateScore();
    setShowResult(true);

    try {
      setIsSubmitting(true);
      await axios.post("http://localhost:5000/api/submit-risk-assessment", {
        answers,
        score: finalScore,
        timestamp: new Date().toISOString(),
      });
      alert("Assessment saved successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to save assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {!showResult ? (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>

          {/* Question Counter */}
          <div className="text-gray-500 text-sm">
            Question {currentQuestion + 1} of {questions.length}
          </div>

          {/* Question */}
          <h2 className="text-2xl font-semibold text-gray-800">
            {questions[currentQuestion].text}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  handleAnswer(questions[currentQuestion].id, option.points)
                }
                className={`p-4 text-left rounded-lg border-2 transition-all duration-200
                  ${
                    answers[questions[currentQuestion].id] === option.points
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg ${
                currentQuestion === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[questions[currentQuestion].id]}
                className={`px-6 py-2 rounded-lg ${
                  !answers[questions[currentQuestion].id]
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-12">
          <h2 className="text-2xl font-bold text-gray-800">
            Your Risk Profile
          </h2>
          <div className="text-lg font-medium text-blue-600">
            Score: {totalScore} -{" "}
            {totalScore <= 24
              ? "Conservative"
              : totalScore <= 34
              ? "Moderate"
              : "Aggressive"}
          </div>
          <p className="text-gray-600">
            Your assessment has been saved successfully!
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskQuestionnaire;
