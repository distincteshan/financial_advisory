import axios from "axios";

const API_URL = "http://localhost:5000/auth"; // Make sure Flask runs on port 5000

export const signup = async (userData) => {
  return await axios.post(`${API_URL}/signup`, userData, {
    headers: { "Content-Type": "application/json" },
  });
};

export const login = async (userData) => {
  try {
    console.log("Sending login request with data:", userData);
    const response = await axios.post(`${API_URL}/login`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Login response:", response);
    return response;
  } catch (error) {
    console.error(
      "Login request failed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
