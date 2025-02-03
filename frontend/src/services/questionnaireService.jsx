// services/questionnaireService.js
import axios from "axios";

const API_URL = "http://localhost:5000/questionnaire";

// Add auth token to requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const submitQuestionnaire = async (questionnaireData) => {
  return await axios.post(`${API_URL}/submit`, questionnaireData, {
    headers: { "Content-Type": "application/json" },
  });
};

export const getQuestionnaire = async (userId) => {
  return await axios.get(`${API_URL}/get/${userId}`);
};
