import {
  FaBookOpen,
  FaGraduationCap,
  FaFileAlt,
  FaPenNib,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import student from "../assets/student.png";
import aboutTeam from "../assets/about-team.png";

const servicesPreview = [
  {
    icon: <FaBookOpen />,
    title: "Assignment Help",
    desc: "Custom essays, reports, case studies and coursework written to your brief.",
  },
  {
    icon: <FaGraduationCap />,
    title: "Dissertation Support",
    desc: "Structured chapter assistance from proposal to final thesis submission.",
  },
  {
    icon: <FaFileAlt />,
    title: "Technical Writing",
    desc: "Clear documentation, IT reports and system write-ups for academic and professional needs.",
  },
  {
    icon: <FaPenNib />,
    title: "Proofreading & Editing",
    desc: "Grammar, structure and citation review that makes your work ready for submission.",
  },
];

const highlights = [
  {
    icon: <FaShieldAlt />,
    title: "Plagiarism-Free Content",
    desc: "Every project is created from scratch and verified for originality.",
  },
  {
    icon: <FaClock />,
    title: "Fast Turnarounds",
    desc: "Reliable delivery even on tight deadlines, with clear status updates.",
  },
  {
    icon: <FaCheckCircle />,
    title: "Expert Subject Teams",
    desc: "Writers with finance, business, IT, engineering and humanities backgrounds.",
  },
];

function Hero() {
  return (
    <div className="home-page-shell">
      <section className="hero home-hero">
      <div className="hero-left">
        <span className="badge">
          🎓 Trusted by Thousands of Students Worldwide
        </span>

        <h1>
          Professional Academic
          <br />
          Writing Services
        </h1>

        <p>
          We provide high-quality academic writing assistance tailored to your
          academic needs. Expert writers, timely delivery and plagiarism-free
          content.
        </p>

        <div className="features">
          <span>✓ Expert Writers</span>
          <span>✓ On-Time Delivery</span>
          <span>✓ Plagiarism Free</span>
        </div>

        <div className="buttons">
          <button className="primary-btn">
            Get Assignment Help
          </button>

          <button className="secondary-btn">
            View Services
          </button>
        </div>

        <div className="stats">
          <div>
            <h3>5000+</h3>
            <p>Happy Clients</p>
          </div>

          <div>
            <h3>98%</h3>
            <p>Client Satisfaction</p>
          </div>

          <div>
            <h3>100+</h3>
            <p>Overall Writers</p>
          </div>

          <div>
            <h3>24/7</h3>
            <p>Hour Support</p>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-image-frame">
          <img src={student} alt="student working" />
        </div>
      </div>
    </section>

    <section className="home-summary home-motion-section">
      <div className="about-summary-hero">
        <div className="section-title">
        <span>ABOUT ASSIGNOPEDIA</span>
        <h2>Empowering Academic & Creative Success — One Word at a Time</h2>
        <p>
          Assignopedia Services is a Kolkata-based academic and content writing
          company committed to delivering excellence in written communication.
          Since our inception, our expert team has supported students,
          professionals and businesses with well-researched, plagiarism-free,
          custom-written content.
        </p>
        </div>

        <div className="about-summary-image">
          <img
            src={aboutTeam}
            alt="Assignopedia academic writing team collaborating"
          />
        </div>
      </div>

      <div className="summary-grid">
        {highlights.map((item) => (
          <article className="summary-card" key={item.title}>
            <div className="summary-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="home-services-preview home-motion-section">
      <div className="section-title">
        <span>OUR SERVICES</span>
        <h2>Solutions for every academic requirement</h2>
        <p>
          Choose from tailored writing, research assistance, editing, and
          documentation services designed for quality and timely delivery.
        </p>
      </div>

      <div className="service-preview-grid">
        {servicesPreview.map((service) => (
          <article className="service-preview-card" key={service.title}>
            <div className="service-preview-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="home-cta home-motion-section">
      <div className="cta-copy">
        <span>WHY CHOOSE US</span>
        <h2>Join 5000+ clients who trust Assignopedia for academic success.</h2>
        <p>
          We combine subject expertise, fast communication, and careful review
          to deliver polished academic and business content every time.
        </p>
      </div>
      <div className="cta-actions">
        <button className="primary-btn">Start Your Project</button>
        <button className="secondary-btn">Contact Us</button>
      </div>
    </section>
    </div>
  );
}

export default Hero;
