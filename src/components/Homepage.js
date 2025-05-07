import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaPen, FaLock, FaMoon, FaChartBar, FaTags } from 'react-icons/fa';

export default function Homepage() {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Document Your Journey with Daily Journal</h1>
            <p className="hero-subtitle">
              A secure and beautiful space for your thoughts, memories, and reflections.
              Write, organize, and revisit your personal journey through time.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="/journal-demo.png" 
              alt="Daily Journal App Screenshot" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/600x400?text=Daily+Journal";
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Capture Your Thoughts With Ease</h2>
          <p className="section-description">
            Our intuitive journal app is designed to help you document your life's journey
            with features that make journaling a delightful daily habit.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaPen />
            </div>
            <h3 className="feature-title">Rich Text Editor</h3>
            <p className="feature-description">
              Format your entries with our powerful yet simple editor. Add headings, lists, and emphasis to express yourself clearly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaLock />
            </div>
            <h3 className="feature-title">Secure & Private</h3>
            <p className="feature-description">
              Your thoughts are protected with industry-standard encryption and secure authentication methods.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaMoon />
            </div>
            <h3 className="feature-title">Dark Mode</h3>
            <p className="feature-description">
              Easy on your eyes with our beautiful dark theme, perfect for those late-night reflection sessions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaChartBar />
            </div>
            <h3 className="feature-title">Mood Tracking</h3>
            <p className="feature-description">
              Record your emotional state with each entry and visualize patterns in your moods over time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaTags />
            </div>
            <h3 className="feature-title">Tags & Organization</h3>
            <p className="feature-description">
              Add tags to your entries for easy categorization and find related thoughts with a simple search.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaBook />
            </div>
            <h3 className="feature-title">Timeline View</h3>
            <p className="feature-description">
              Browse through your entries chronologically and see how your thoughts have evolved over time.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="section-header">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-description">
              Daily Journal has helped thousands of people document their lives and maintain mindfulness practices.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <p className="testimonial-content">
                "I've tried many journaling apps, but Daily Journal is by far the most intuitive and pleasant to use. I love how I can easily organize my entries with tags."
              </p>
              <div className="testimonial-author">
                <img 
                  src="/avatar-1.jpg" 
                  alt="Sarah J." 
                  className="author-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/60x60";
                  }}
                />
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <p>Daily writer since 2022</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-content">
                "The mood tracking feature has helped me understand my emotional patterns. I can now see how certain events affect my well-being. It's been transformative."
              </p>
              <div className="testimonial-author">
                <img 
                  src="/avatar-2.jpg" 
                  alt="Michael T." 
                  className="author-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/60x60";
                  }}
                />
                <div className="author-info">
                  <h4>Michael Torres</h4>
                  <p>Mental health advocate</p>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <p className="testimonial-content">
                "As a night owl, I appreciate the dark mode option. I can journal before bed without the harsh light disrupting my sleep. Small details like this make all the difference."
              </p>
              <div className="testimonial-author">
                <img 
                  src="/avatar-3.jpg" 
                  alt="Emma L." 
                  className="author-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/60x60";
                  }}
                />
                <div className="author-info">
                  <h4>Emma Lee</h4>
                  <p>Creative writer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="call-to-action">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Your Journaling Journey?</h2>
          <p className="cta-text">
            Join thousands of users who are documenting their lives and growing through self-reflection.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-btn cta-btn-primary">
              Create Free Account
            </Link>
            <Link to="/login" className="cta-btn cta-btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <FaBook className="footer-logo-icon" />
              <span className="footer-logo-text">Daily Journal</span>
            </div>
            <p className="footer-tagline">Document your journey, one day at a time.</p>
            
            <div className="footer-links">
              <div className="footer-links-column">
                <h3>Product</h3>
                <ul>
                  <li><Link to="/features">Features</Link></li>
                  <li><Link to="/pricing">Pricing</Link></li>
                  <li><Link to="/faq">FAQ</Link></li>
                </ul>
              </div>
              
              <div className="footer-links-column">
                <h3>Company</h3>
                <ul>
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><Link to="/careers">Careers</Link></li>
                </ul>
              </div>
              
              <div className="footer-links-column">
                <h3>Resources</h3>
                <ul>
                  <li><Link to="/blog">Blog</Link></li>
                  <li><Link to="/support">Support</Link></li>
                  <li><Link to="/privacy">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Daily Journal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}