import logo from "../assets/logo.PNG";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo-section">
        <img src={logo} alt="logo" />
        <div>
          <h2>Assignopedia</h2>
          <p>Academic Excellence</p>
        </div>
      </div>

      <ul className="nav-links">
        <li>Home</li>
        <li>Services</li>
        <li>About</li>
        <li>Contact</li>
      </ul>

      <button className="help-btn">Get Help</button>
    </nav>
  );
}

export default Navbar;