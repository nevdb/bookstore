import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomePage.css";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>📚 Welcome to BookStore</h1>
          <p>
            Manage your personal book collection and explore the world of
            literature
          </p>

          {!user ? (
            <div className="hero-cta">
              <Link to="/signup" className="cta-btn primary">
                Get Started
              </Link>
              <Link to="/login" className="cta-btn secondary">
                Sign In
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="cta-btn primary">
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Use BookStore?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Browse Library</h3>
            <p>
              Explore thousands of books in our comprehensive system library
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Rate & Review</h3>
            <p>
              Rate books and add personal notes to track your reading journey
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏷️</div>
            <h3>Organize</h3>
            <p>Organize your collection by genre, author, or reading status</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Search & Filter</h3>
            <p>Quickly find books with powerful search and filter options</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Sign Up</h3>
            <p>Create your account in seconds</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Browse</h3>
            <p>Explore our library of books</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Collect</h3>
            <p>Add books to your personal collection</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Track</h3>
            <p>Rate and manage your reading progress</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="cta-section">
          <h2>Ready to start?</h2>
          <p>Join our community of book lovers today</p>
          <Link to="/signup" className="cta-btn primary large">
            Create Account Now
          </Link>
        </section>
      )}
    </div>
  );
}
