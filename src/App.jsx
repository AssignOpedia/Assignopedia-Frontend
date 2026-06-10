import { useState } from "react"; // 1. Import useState
import "./App.css";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/About";
import Blog from "./components/Blog";
import Careers from "./components/Careers";
import AuthForm from "./AuthForm/AuthForm";

function App() {
  // 2. Create a state to control the visibility of the AuthForm
  const [showAuth, setShowAuth] = useState(false);
  const [activePage, setActivePage] = useState("home");

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

    return (
      <>
        <Hero />
        <About />
      </>
    );
  };

  return (
    <>
      {/* 3. Pass the function to open the form to your Navbar */}
      <Navbar
        activePage={activePage}
        onNavigate={setActivePage}
        onSignUpClick={() => setShowAuth(true)}
      />

      {renderPage()}

      {/* 4. Conditionally render the AuthForm if showAuth is true */}
      {showAuth && <AuthForm onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default App;
