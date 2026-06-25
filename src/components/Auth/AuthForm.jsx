import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  findAccountByEmail,
  loginAccount,
  registerAccount,
  updateAccountPassword,
} from "../../utils/authStorage";
import {
  requestPortalPasswordOtp,
  resetPortalPasswordWithOtp,
} from "../../utils/passwordResetApi";
import { loginAccountRemote, registerAccountRemote } from "../../utils/authApi";
import { addPasswordResetRequest } from "../../utils/passwordResetRequests";

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
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetStep, setResetStep] = useState("email");
  const [resetData, setResetData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [resetId, setResetId] = useState("");
  const [resetMessage, setResetMessage] = useState("");
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
    setAuthError("");
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleResetChange = (event) => {
    const { name, value } = event.target;
    setAuthError("");
    setResetMessage("");
    setResetData((current) => ({ ...current, [name]: value }));
  };

  const handleOtpRequest = async (event) => {
    event.preventDefault();

    if (role === "hr" || role === "admin") {
      try {
        const response = await requestPortalPasswordOtp({
          email: resetData.email,
          role,
        });

        setResetId(response.resetId);
        setGeneratedOtp("");
        setResetStep("otp");
        setResetMessage(response.message || "OTP sent to your registered email.");
      } catch (error) {
        setAuthError(error.message);
      }

      return;
    }

    const account = findAccountByEmail(resetData.email);

    if (!account) {
      setAuthError("No registered account found with this email.");
      return;
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    if (account.role === "employee") {
      addPasswordResetRequest({ ...account, otp });
    }

    setGeneratedOtp(otp);
    setResetStep("otp");
    setResetMessage("OTP request sent to HR and Admin.");
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();

    if (role === "hr" || role === "admin") {
      try {
        const response = await resetPortalPasswordWithOtp({
          resetId,
          email: resetData.email,
          role,
          otp: resetData.otp,
          newPassword: resetData.newPassword,
        });

        const localAccount = updateAccountPassword({
          email: resetData.email,
          password: resetData.newPassword,
        });

        if (!localAccount && response.user) {
          registerAccount({
            name: response.user.name,
            email: resetData.email,
            password: resetData.newPassword,
            role,
          });
        }
        setFormData((current) => ({
          ...current,
          email: resetData.email,
          password: resetData.newPassword,
        }));
        setShowResetPassword(false);
        setResetStep("email");
        setGeneratedOtp("");
        setResetId("");
        setResetData({ email: "", otp: "", newPassword: "" });
        setResetMessage(response.message || "Password changed successfully. You can login now.");
      } catch (error) {
        setAuthError(error.message);
      }

      return;
    }

    if (resetData.otp !== generatedOtp) {
      setAuthError("Invalid OTP. Please check and try again.");
      return;
    }

    updateAccountPassword({
      email: resetData.email,
      password: resetData.newPassword,
    });

    setFormData((current) => ({
      ...current,
      email: resetData.email,
      password: resetData.newPassword,
    }));
    setShowResetPassword(false);
    setResetStep("email");
    setGeneratedOtp("");
    setResetId("");
    setResetData({ email: "", otp: "", newPassword: "" });
    setResetMessage("Password changed successfully. You can login now.");
  };

  const navigateAfterAuth = () => {
    if (role === "employee" && onNavigate) {
      onNavigate("employee-dashboard");
    }

    if (role === "hr" && onNavigate) {
      onNavigate("hr-dashboard");
    }

    if (role === "admin" && onNavigate) {
      onNavigate("admin-dashboard");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");

    if (isSignup) {
      try {
        const response = await registerAccountRemote({ ...formData, role });
        registerAccount({ ...formData, role });

        if (response.user) {
          localStorage.setItem("assignopediaCurrentUser", JSON.stringify(response.user));
          window.dispatchEvent(
            new CustomEvent("assignopedia-current-user-updated", { detail: response.user })
          );
        }

        navigateAfterAuth();
        return;
      } catch (error) {
        const localAccount = registerAccount({ ...formData, role });

        if (localAccount) {
          navigateAfterAuth();
          return;
        }

        setAuthError(error.message || "This email is already registered. Please login instead.");
        return;
      }
    }

    try {
      const response = await loginAccountRemote({ ...formData, role });

      if (response.user) {
        localStorage.setItem("assignopediaCurrentUser", JSON.stringify(response.user));
        window.dispatchEvent(
          new CustomEvent("assignopedia-current-user-updated", { detail: response.user })
        );
      }

      loginAccount({ ...formData, role });
      navigateAfterAuth();
    } catch (error) {
      const localAccount = loginAccount({ ...formData, role });

      if (localAccount) {
        navigateAfterAuth();
        return;
      }

      setAuthError(
        error.message === "Authentication request failed."
          ? "Backend authentication failed. Please restart the API server and check your email, password, and portal role."
          : error.message || "No registered account found with this email and password."
      );
    }
  };

  if (isRoleForm) {
    const details = roleDetails[role];
    const roleName = details.title.replace(" Login", "");

    if (showResetPassword) {
      return (
        <main className="role-login-page">
          <section className="role-login-card">
            <span className="role-login-eyebrow">Assignopedia Portal</span>
            <h1>Reset Password</h1>
            <p>
              {role === "employee"
                ? "Enter your registered email. This request will be visible to HR and Admin."
                : "Enter your registered email. OTP will be sent to your mail ID."}
            </p>

            <form
              className="auth-form"
              onSubmit={resetStep === "email" ? handleOtpRequest : handlePasswordReset}
            >
              <label className="auth-input-group">
                <span className="auth-label">Registered Email</span>
                <input
                  className="auth-input"
                  type="email"
                  name="email"
                  value={resetData.email}
                  onChange={handleResetChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={resetStep === "otp"}
                />
              </label>

              {resetStep === "otp" && (
                <>
                  <label className="auth-input-group">
                    <span className="auth-label">OTP</span>
                    <input
                      className="auth-input"
                      type="text"
                      name="otp"
                      value={resetData.otp}
                      onChange={handleResetChange}
                      placeholder="Enter 6 digit OTP"
                      inputMode="numeric"
                      maxLength="6"
                      required
                    />
                  </label>

                  <label className="auth-input-group">
                    <span className="auth-label">New Password</span>
                    <span className="auth-password-field">
                      <input
                        className="auth-input"
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={resetData.newPassword}
                        onChange={handleResetChange}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        className="auth-password-toggle"
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </span>
                  </label>
                </>
              )}

              {authError && (
                <p className="auth-error-message" role="alert">
                  {authError}
                </p>
              )}

              {resetMessage && (
                <p className="auth-success-message" role="status">
                  {resetMessage}
                </p>
              )}

              <button className="auth-submit-btn" type="submit">
                {resetStep === "email" ? "Send OTP" : "Change Password"}
              </button>
            </form>

            <div className="role-auth-switch">
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setAuthError("");
                  setResetMessage("");
                }}
              >
                Back to Login
              </button>
            </div>
          </section>
        </main>
      );
    }

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
              <span className="auth-password-field">
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </span>
            </label>

            {authError && (
              <p className="auth-error-message" role="alert">
                {authError}
              </p>
            )}

            {resetMessage && (
              <p className="auth-success-message" role="status">
                {resetMessage}
              </p>
            )}

            <button className="auth-submit-btn" type="submit">
              {isSignup ? `Sign Up as ${roleName}` : `Login as ${roleName}`}
            </button>
          </form>

          <div className="role-auth-switch">
            {!isSignup && (
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(true);
                  setAuthError("");
                  setResetMessage("");
                }}
              >
                Forgot Password?
              </button>
            )}
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
