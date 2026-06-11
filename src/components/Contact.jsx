import {
  FaAward,
  FaBriefcase,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaHeadset,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUsers,
} from "react-icons/fa";

function Contact({ onNavigate }) {
  const contactCards = [
    {
      icon: <FaMapMarkedAlt />,
      title: "Visit Us",
      text: "Assignopedia Services, Kolkata, West Bengal, India",
      action: "Click to view on map",
      href: "https://www.google.com/maps/search/?api=1&query=Assignopedia%20Services%20Kolkata%20West%20Bengal%20India",
    },
    {
      icon: <FaEnvelope />,
      title: "Email Us",
      text: "For client queries and career applications",
      action: "assignopedia2.0@gmail.com",
      href: "mailto:assignopedia2.0@gmail.com",
    },
    {
      icon: <FaPhoneAlt />,
      title: "Call or WhatsApp",
      text: "+91 6291075245",
      action: "Available during business hours",
      href: "tel:+916291075245",
    },
  ];

  const reasons = [
    "98% Client Satisfaction",
    "Award-Winning Quality",
    "5000+ Happy Clients",
    "Industry Recognition",
  ];

  const quickLinks = [
    { label: "Our Services", page: "services" },
    { label: "About Us", page: "about" },
    { label: "Careers", page: "careers" },
    { label: "Contact", page: "contact" },
  ];

  return (
    <main className="page contact-page">
      <section className="contact-hero">
        <span className="eyebrow">Contact Us</span>
        <h1>Have a query, need our services, or want to join our team?</h1>
        <p>
          We are just a message away. Reach our Kolkata team for academic
          projects, content writing support, job applications, and business
          queries.
        </p>
      </section>

      <section className="contact-card-grid">
        {contactCards.map((card) => (
          <a
            className="contact-info-card"
            href={card.href}
            key={card.title}
            target={card.title === "Visit Us" ? "_blank" : undefined}
            rel={card.title === "Visit Us" ? "noreferrer" : undefined}
          >
            <span>{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <strong>{card.action}</strong>
          </a>
        ))}
      </section>

      <section className="contact-main-grid">
        <article className="contact-panel-card">
          <span className="eyebrow">Contact Information</span>
          <h2>Office and support details</h2>
          <div className="contact-detail-list">
            <p>
              <FaMapMarkerAlt />
              <span>
                <strong>Office Address</strong>
                Assignopedia Services
                <br />
                Kolkata, West Bengal, India
              </span>
            </p>
            <p>
              <FaPhoneAlt />
              <span>
                <strong>Phone/WhatsApp</strong>
                <a href="tel:+916291075245">+91 6291075245</a>
              </span>
            </p>
            <p>
              <FaClock />
              <span>
                <strong>Business Hours</strong>
                Monday - Saturday: 11:00 AM - 07:00 PM
                <br />
                Sunday: Closed
              </span>
            </p>
          </div>
        </article>

        <article className="contact-panel-card">
          <span className="eyebrow">Get in Touch</span>
          <h2>Send your project or career query</h2>
          <div className="contact-detail-list">
            <p>
              <FaEnvelope />
              <span>
                <strong>Client Queries & Projects</strong>
                <a href="mailto:assignopedia2.0@gmail.com">
                  assignopedia2.0@gmail.com
                </a>
              </span>
            </p>
            <p>
              <FaBriefcase />
              <span>
                <strong>Career Opportunities</strong>
                <a href="mailto:hrrecruiter.aop@gmail.com">
                  hrrecruiter.aop@gmail.com
                </a>
              </span>
            </p>
            <p>
              <FaHeadset />
              <span>
                <strong>Response Time</strong>
                Within 2 hours during business hours
              </span>
            </p>
          </div>
        </article>
      </section>

      <section className="contact-bottom-row">
        <article>
          <h2>Connect With Us</h2>
          <div className="contact-socials">
            <a
              href="https://www.facebook.com/profile.php?id=100088741681767&mibextid=rS40aB7S9Ucbxw6v"
              aria-label="Facebook"
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.instagram.com/assignopedia"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.linkedin.com/company/assignopedia-services/"
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </article>

        <article>
          <h2>Quick Navigation</h2>
          <div className="contact-quick-links">
            {quickLinks.map((link) => (
              <button
                type="button"
                key={link.label}
                onClick={() => onNavigate(link.page)}
              >
                <FaBuilding />
                {link.label}
              </button>
            ))}
          </div>
        </article>

        <article>
          <h2>Why Students Choose Us</h2>
          <ul className="contact-reasons">
            {reasons.map((reason, index) => {
              const icons = [FaCheckCircle, FaAward, FaUsers, FaCheckCircle];
              const Icon = icons[index];
              return (
                <li key={reason}>
                  <Icon />
                  {reason}
                </li>
              );
            })}
          </ul>
        </article>
      </section>

    </main>
  );
}

export default Contact;
