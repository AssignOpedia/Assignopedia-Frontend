import { useEffect, useState } from "react";

const roleDetails = {
  hr: {
    title: "HR Login",
    description: "Sign in to manage recruitment and employee workflows.",
    signupDescription:
      "Create your account to manage recruitment and employee workflows.",
  },
  admin: {
    title: "Admin Login",
    description: "Sign in to manage Assignopedia administration.",
    signupDescription:
      "Create your account to manage Assignopedia administration.",
  },
  employee: {
    title: "Employee Login",
    description: "Sign in to access your employee workspace.",
    signupDescription: "Create your account to access your employee workspace.",
  },
};

const AuthForm = ({
  onClose,
  onRoleSelect,
  onNavigate,
  role,
  mode = "login",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const isRoleForm = Boolean(role);
  const isSignup = mode === "signup";

  useEffect(() => {
    if (isRoleForm) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isRoleForm, onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (role === "employee" && !isSignup && onNavigate) {
      onNavigate("employee-dashboard");
    }

    if (role === "hr" && !isSignup && onNavigate) {
      onNavigate("hr-dashboard");
    }
  };

  if (isRoleForm) {
    const details = roleDetails[role];
    const roleName = details.title.replace(" Login", "");

    return (
      <main className="role-login-page">
        <section className="role-login-card">
          <span className="role-login-eyebrow">Assignopedia Portal</span>
          <h1>{isSignup ? `${roleName} Sign Up` : details.title}</h1>
          <p>
            {isSignup ? details.signupDescription : details.description}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label className="auth-input-group">
                <span className="auth-label">Full Name</span>
                <input
                  className="auth-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="auth-input-group">
              <span className="auth-label">Email Address</span>
              <input
                className="auth-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-input-group">
              <span className="auth-label">Password</span>
              <input
                className="auth-input"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
              />
            </label>

            <button className="auth-submit-btn" type="submit">
              {isSignup ? `Sign Up as ${roleName}` : `Login as ${roleName}`}
            </button>
          </form>

          <div className="role-auth-switch">
            <span>
              {isSignup
                ? "Already have an account?"
                : "Don\u2019t have an account?"}
            </span>
            <button
              type="button"
              onClick={() =>
                onNavigate(`${role}-${isSignup ? "login" : "signup"}`)
              }
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="auth-overlay"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className="auth-card auth-role-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
      >
        <button
          className="auth-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Close login options"
        >
          &times;
        </button>

        <h2 className="auth-title" id="auth-dialog-title">
          Choose Your Login Type
        </h2>
        <p className="auth-description">Select an account type to continue</p>

        <div className="login-options">
          <button
            className="login-btn"
            type="button"
            onClick={() => onRoleSelect("hr-login")}
          >
            HR Login
          </button>
          <button
            className="login-btn"
            type="button"
            onClick={() => onRoleSelect("admin-login")}
          >
            Admin Login
          </button>
          <button
            className="login-btn"
            type="button"
            onClick={() => onRoleSelect("employee-login")}
          >
            Employee Login
          </button>
        </div>
      </section>
    </div>
  );
};

export default AuthForm;
