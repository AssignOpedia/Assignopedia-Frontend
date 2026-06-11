import {
  FaBookOpen,
  FaBriefcase,
  FaBuilding,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaFacebookF,
  FaFileAlt,
  FaHeadset,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaMoneyCheckAlt,
  FaPhoneAlt,
  FaShieldAlt,
  FaTools,
} from "react-icons/fa";

function About({ onNavigate }) {
  const stats = [
    { value: "5000+", label: "Happy Clients" },
    { value: "98%", label: "Client Satisfaction" },
    { value: "100+", label: "Overall Writers" },
    { value: "24/7", label: "Hour Support" },
  ];

  const writerGroups = [
    {
      icon: <FaBriefcase />,
      title: "Non-Technical Writers",
      count: "50+",
      detail: "Average 2+ years experience",
      skills: [
        "MBA & Business Strategy",
        "Operations Management",
        "Project Management",
        "Strategic Planning",
      ],
    },
    {
      icon: <FaMoneyCheckAlt />,
      title: "Financial Writers",
      count: "25+",
      detail: "Average 2+ years experience",
      skills: [
        "Investment Analysis",
        "Financial Planning",
        "Risk Management",
        "Banking & Finance",
      ],
    },
    {
      icon: <FaTools />,
      title: "Technical Writers",
      count: "25+",
      detail: "Average 2+ years experience",
      skills: [
        "Software Documentation",
        "API Documentation",
        "Technical Guides",
        "System Architecture",
      ],
    },
  ];

  const expertise = [
    {
      icon: <FaBookOpen />,
      title: "Academic Excellence",
      text: "Specialized in MBA theses, research papers, and academic projects across disciplines.",
    },
    {
      icon: <FaFileAlt />,
      title: "Technical Writing",
      text: "Expert documentation for IT, engineering, and technical projects.",
    },
    {
      icon: <FaChartLine />,
      title: "Content Strategy",
      text: "SEO-optimized content that drives engagement and results.",
    },
    {
      icon: <FaClock />,
      title: "Timely Delivery",
      text: "Meeting deadlines without compromising on quality.",
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
    <main className="page about-page">
      <section className="about-hero-new">
        <div className="about-hero-content">
          <span className="eyebrow">About Assignopedia</span>
          <h1>Empowering Academic & Creative Success</h1>
          <p>
            Assignopedia Services is a Kolkata-based academic and content
            writing company committed to excellence in written communication,
            original research, and deadline-focused delivery.
          </p>
          <div className="about-hero-actions">
            <button type="button" onClick={() => onNavigate("services")}>
              Explore Services
            </button>
            <a href="tel:+916291075245">Call / WhatsApp</a>
          </div>
        </div>

        <aside className="about-trust-card">
          <FaShieldAlt />
          <h2>One Word at a Time</h2>
          <p>
            Our researchers, writers, and editors support students,
            professionals, and businesses with clear, plagiarism-free, custom
            content.
          </p>
        </aside>
      </section>

      <section className="about-stats-row" aria-label="Assignopedia results">
        {stats.map((stat) => (
          <article key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="about-intro-card">
        <div>
          <span className="eyebrow">Our Story</span>
          <h2>Reliable writing support for demanding academic work.</h2>
        </div>
        <div>
          <p>
            Since our inception, we have helped students, professionals, and
            businesses thrive by offering well-researched, plagiarism-free, and
            custom-written content.
          </p>
          <p>
            Our diverse team brings expertise from academic, technical,
            business, and finance backgrounds. Whether it is an MBA thesis, IT
            project report, web content, or SEO blog, we deliver high-quality
            results even on tight deadlines.
          </p>
          <p>
            At Assignopedia, we believe in a client-first approach, transparent
            communication, and timely delivery.
          </p>
        </div>
      </section>

      <section className="about-section-block">
        <div className="section-title">
          <span>Our Expert Writers</span>
          <h2>Specialized writing teams for every project</h2>
          <p>
            Each requirement is matched with writers who understand the subject,
            document type, and quality standard.
          </p>
        </div>

        <div className="about-writer-grid">
          {writerGroups.map((group) => (
            <article className="about-writer-card" key={group.title}>
              <div className="about-card-head">
                <span>{group.icon}</span>
                <div>
                  <h3>{group.title}</h3>
                  <p>
                    <strong>{group.count}</strong> {group.detail}
                  </p>
                </div>
              </div>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <FaCheckCircle />
                    {skill}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section-block">
        <div className="section-title">
          <span>Our Expertise</span>
          <h2>Support that covers research, content, and delivery</h2>
        </div>

        <div className="about-expertise-grid">
          {expertise.map((item) => (
            <article className="about-expertise-card" key={item.title}>
              <span>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-contact-band" id="contact">
        <article>
          <span className="eyebrow">Contact Information</span>
          <h2>Reach our Kolkata team</h2>
          <div className="about-contact-list">
            <p>
              <FaMapMarkerAlt />
              <span>
                <strong>Office Address</strong>
                Assignopedia Services, Kolkata, West Bengal, India
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
                Monday - Saturday: 11:00 AM - 07:00 PM, Sunday: Closed
              </span>
            </p>
          </div>
        </article>

        <article>
          <span className="eyebrow">Get in Touch</span>
          <h2>Project and career queries</h2>
          <div className="about-contact-list">
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
              <FaEnvelope />
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

      <section className="about-action-row">
        <div className="about-social">
          <h2>Connect With Us</h2>
          <div>
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
        </div>

        <div className="about-quick-nav">
          <h2>Quick Navigation</h2>
          <div>
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
        </div>

        <div className="about-choose">
          <h2>Why Students Choose Us</h2>
          <ul>
            {reasons.map((reason) => (
              <li key={reason}>
                <FaCheckCircle />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

export default About;
