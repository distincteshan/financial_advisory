import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <div className="text-2xl font-bold text-blue-600">
          AI Financial Advisor
        </div>
        <nav className="flex items-center space-x-6">
          <a href="#about" className="text-gray-600 hover:text-blue-500">
            About
          </a>
          <a href="#features" className="text-gray-600 hover:text-blue-500">
            Features
          </a>
          <a href="#contact" className="text-gray-600 hover:text-blue-500">
            Contact
          </a>
          <Link
            to="/login"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-800">
          Empower Your Financial Journey
        </h1>
        <p className="mt-4 text-gray-600">
          Personalized financial planning with AI and machine learning
        </p>
        <button className="mt-6 px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
          Get Started
        </button>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold">About Our Service</h2>
        <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
          In today’s complex financial world, managing finances can be a
          challenge. Our AI-driven system provides personalized financial advice
          to help you make the best decisions for your future.
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50 px-6 text-center">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              title: "Classification Models",
              desc: "Using Decision Trees, Random Forest, and SVM to classify and provide tailored advice based on user profiles.",
            },
            {
              title: "Clustering with K-means",
              desc: "Identifying user groups with similar financial behaviors to offer relevant suggestions.",
            },
            {
              title: "Personalized Recommendations",
              desc: "Utilizing Collaborative Filtering to recommend financial products and strategies.",
            },
            {
              title: "Deep Learning Insights",
              desc: "Neural Networks and LSTM to detect complex financial patterns and forecast future scenarios.",
            },
            {
              title: "Adaptive Strategies",
              desc: "Reinforcement Learning to provide adaptive financial strategies based on real-time user behavior.",
            },
            {
              title: "Optimal Tuning",
              desc: "Bayesian Optimization to fine-tune models, enhancing accuracy and relevance of recommendations.",
            },
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-white shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-blue-600">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-700">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold">Contact Us</h2>
        <p className="mt-4 text-lg text-gray-700">
          Ready to start your financial journey with us? Reach out for more
          information.
        </p>
        <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700">
          Contact Us
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6 mt-10">
        <p>&copy; 2024 AI Financial Advisor. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
