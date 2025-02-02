// Questionnaire.js
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Questionnaire = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: "",
    retirement_age: "",
    monthly_investment: "",
    risk_tolerance: "",
    investment_goals: [],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem("user_id");
      await axios.post("http://localhost:5000/submit-questionnaire", {
        ...formData,
        user_id: userId,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to submit questionnaire:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Investment Profile Questionnaire
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expected Retirement Age
            </label>
            <input
              type="number"
              name="retirement_age"
              value={formData.retirement_age}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Monthly Investment Amount
            </label>
            <input
              type="number"
              name="monthly_investment"
              value={formData.monthly_investment}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Risk Tolerance
            </label>
            <select
              name="risk_tolerance"
              value={formData.risk_tolerance}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            >
              <option value="">Select Risk Tolerance</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Questionnaire;
