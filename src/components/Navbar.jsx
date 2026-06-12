import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.PNG";

function Navbar({ activePage, onNavigate, onSignUpClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  const handleSignUp = () => {
    onSignUpClick();
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <button
        className="logo-section logo-button"
        type="button"
        onClick={() => handleNavigate("home")}
      >
        <img src={logo} alt="logo" />
        <div>
          <h2>AssignOpedia</h2>
          <p>AssignOpedia Services</p>
        </div>
      </button>

      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`nav-panel ${menuOpen ? "nav-panel-open" : ""}`}>
        <ul className="nav-links">
          <li>
            <button
              className={activePage === "home" ? "active-nav" : ""}
              type="button"
              onClick={() => handleNavigate("home")}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={activePage === "services" ? "active-nav" : ""}
              type="button"
              onClick={() => handleNavigate("services")}
            >
              Services
            </button>
          </li>
          <li>
            <button
              className={activePage === "blog" ? "active-nav" : ""}
              type="button"
              onClick={() => handleNavigate("blog")}
            >
              Blog
            </button>
          </li>
          <li>
            <button
              className={activePage === "careers" ? "active-nav" : ""}
              type="button"
              onClick={() => handleNavigate("careers")}
            >
              Careers
            </button>
          </li>
          <li>
            <button
              className={activePage === "about" ? "active-nav" : ""}
              type="button"
              onClick={() => handleNavigate("about")}
            >
              About
            </button>
          </li>
          <li>
            <button
              className={activePage === "contact" ? "active-nav" : ""}
              type="button"
              onClick={() => handleNavigate("contact")}
            >
              Contact
            </button>
          </li>
        </ul>

        <button
          className="sign-up-btn"
          onClick={handleSignUp}
          type="button"
          aria-haspopup="dialog"
        >
          Access Portal
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
