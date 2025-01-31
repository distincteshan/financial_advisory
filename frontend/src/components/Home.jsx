import { Link } from "react-router-dom"; // Import Link from React Router

const Home = () => {
  return (
    <div>
      <header className="header">
        <div className="logo">AI Financial Advisor</div>
        <nav className="nav">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
          <Link to="/login" className="login-button">
            Login
          </Link>{" "}
        </nav>
      </header>

      <section className="hero">
        <h1>Empower Your Financial Journey</h1>
        <p>Personalized financial planning with AI and machine learning</p>
        <button className="cta-button">Get Started</button>
      </section>

      <section id="about" className="about">
        <h2>About Our Service</h2>
        <p>
          In today’s complex financial world, managing finances can be a
          challenge. Our AI-driven system provides personalized financial advice
          to help you make the best decisions for your future.
        </p>
      </section>

      <section id="features" className="features">
        <h2>Key Features</h2>
        <div className="feature-card">
          <h3>Classification Models</h3>
          <p>
            Using Decision Trees, Random Forest, and SVM to classify and provide
            tailored advice based on user profiles.
          </p>
        </div>
        <div className="feature-card">
          <h3>Clustering with K-means</h3>
          <p>
            Identifying user groups with similar financial behaviors to offer
            relevant suggestions.
          </p>
        </div>
        <div className="feature-card">
          <h3>Personalized Recommendations</h3>
          <p>
            Utilizing Collaborative Filtering to recommend financial products
            and strategies.
          </p>
        </div>
        <div className="feature-card">
          <h3>Deep Learning Insights</h3>
          <p>
            Neural Networks and LSTM to detect complex financial patterns and
            forecast future scenarios.
          </p>
        </div>
        <div className="feature-card">
          <h3>Adaptive Strategies</h3>
          <p>
            Reinforcement Learning to provide adaptive financial strategies
            based on real-time user behavior.
          </p>
        </div>
        <div className="feature-card">
          <h3>Optimal Tuning</h3>
          <p>
            Bayesian Optimization to fine-tune models, enhancing accuracy and
            relevance of recommendations.
          </p>
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>Contact Us</h2>
        <p>
          Ready to start your financial journey with us? Reach out for more
          information.
        </p>
        <button className="cta-button">Contact Us</button>
      </section>

      <footer className="footer">
        <p>&copy; 2024 AI Financial Advisor. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
