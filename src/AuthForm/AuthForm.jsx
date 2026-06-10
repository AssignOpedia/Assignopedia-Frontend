import { useState } from 'react';

export default function AuthForm({ onClose }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isSignUp ? "Registering user:" : "Logging in user:", formData);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        {/* Close Button */}
        <button onClick={onClose} className="auth-close-btn" type="button">✕</button>

        <h2 className="auth-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="auth-input" 
                placeholder="John Doe" 
              />
            </div>
          )}

          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              className="auth-input" 
              placeholder="you@example.com" 
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              className="auth-input" 
              placeholder="••••••••" 
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle-container">
          <p className="auth-toggle-text">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle-btn">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
