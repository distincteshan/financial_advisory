import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import Questionnaire from './components/Questionnaire';
import PrivateRoute from './components/PrivateRoute';
import AboutUs from './components/AboutUs';
import Calculators from './components/Calculators';
import News from './components/News';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/news" element={<News />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/questionnaire"
            element={
              <PrivateRoute>
                <Questionnaire />
              </PrivateRoute>
            }
          />
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
