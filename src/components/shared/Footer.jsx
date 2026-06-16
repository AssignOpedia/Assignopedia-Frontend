import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import logo from "../../assets/logo.PNG";

function Footer() {
  const socials = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=100088741681767&mibextid=rS40aB7S9Ucbxw6v",
      icon: <FaFacebookF />,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/assignopedia",
      icon: <FaInstagram />,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/assignopedia-services/",
      icon: <FaLinkedinIn />,
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <section className="footer-brand-block">
          <div className="footer-brand-main">
            <div className="footer-logo-wrap">
              <img src={logo} alt="Assignopedia" />
            </div>
            <div>
              <span>Assignopedia Services</span>
              <h2>Professional Academic Writing Services</h2>
            </div>
          </div>
          <p className="footer-description">
            Kolkata-based academic and content writing support for students,
            professionals, and businesses.
          </p>
        </section>

        <section className="footer-contact-card">
          <a className="footer-contact-item" href="tel:+916291075245">
            <FaPhoneAlt />
            <span>+91 6291075245</span>
          </a>
          <a
            className="footer-contact-item"
            href="mailto:assignopedia2.0@gmail.com"
          >
            <FaEnvelope />
            <span>assignopedia2.0@gmail.com</span>
          </a>
          <p className="footer-contact-item">
            <FaMapMarkerAlt />
            <span>Kolkata, West Bengal, India</span>
          </p>
        </section>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Assignopedia. All Rights Reserved.</p>
        <div className="footer-socials">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              target="_blank"
              rel="noreferrer"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
