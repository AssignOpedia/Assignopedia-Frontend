import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/About";
import Blog from "./components/Blog";
import Careers from "./components/Careers";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AuthForm from "./AuthForm/AuthForm";

const getPageFromPath = () => {
  const page = window.location.pathname.replace(/^\/+|\/+$/g, "");
  return page || "home";
};

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [activePage, setActivePage] = useState(getPageFromPath);

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getPageFromPath());
      setShowAuth(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (page) => {
    const path = page === "home" ? "/" : `/${page}`;
    window.history.pushState({}, "", path);
    setActivePage(page);
    setShowAuth(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const playWhatsAppClick = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(620, now);
      oscillator.frequency.exponentialRampToValueAtTime(420, now + 0.07);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.08);
      oscillator.addEventListener("ended", () => audioContext.close());
    } catch {
      // Audio support must never block the WhatsApp link.
    }
  };

  const renderPage = () => {
    if (activePage === "services") {
      return <Services />;
    }

    if (activePage === "blog") {
      return <Blog />;
    }

    if (activePage === "careers") {
      return <Careers />;
    }

    if (activePage === "about") {
      return <About onNavigate={handleNavigate} />;
    }

    if (activePage === "contact") {
      return <Contact onNavigate={handleNavigate} />;
    }

    if (
      activePage === "hr-login" ||
      activePage === "admin-login" ||
      activePage === "employee-login"
    ) {
      return (
        <AuthForm
          role={activePage.replace("-login", "")}
          onNavigate={handleNavigate}
        />
      );
    }

    if (
      activePage === "hr-signup" ||
      activePage === "admin-signup" ||
      activePage === "employee-signup"
    ) {
      return (
        <AuthForm
          role={activePage.replace("-signup", "")}
          mode="signup"
          onNavigate={handleNavigate}
        />
      );
    }

    return (
      <>
        <Hero />
      </>
    );
  };

  return (
    <>
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        onSignUpClick={() => setShowAuth(true)}
      />

      {renderPage()}

      <Footer onNavigate={handleNavigate} />

      {showAuth && (
        <AuthForm
          onClose={() => setShowAuth(false)}
          onRoleSelect={handleNavigate}
        />
      )}

      <a
        className="whatsapp-float"
        href="https://wa.me/919288288828"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Assignopedia on WhatsApp"
        title="Chat with us on WhatsApp"
        onClick={playWhatsAppClick}
      >
        <FaWhatsapp aria-hidden="true" />
      </a>
    </>
  );
}

export default App;
