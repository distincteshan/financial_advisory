import axios from "axios";

const API_URL = "http://localhost:5000/auth"; // Make sure Flask runs on port 5000

export const signup = async (userData) => {
  return await axios.post(`${API_URL}/signup`, userData, {
    headers: { "Content-Type": "application/json" },
  });
};

export const login = async (userData) => {
  return await axios.post(`${API_URL}/login`, userData, {
    headers: { "Content-Type": "application/json" },
  });
};
