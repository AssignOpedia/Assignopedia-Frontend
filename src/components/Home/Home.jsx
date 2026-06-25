import {
  FaBookOpen,
  FaGraduationCap,
  FaFileAlt,
  FaPenNib,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaUsers,
} from "react-icons/fa";
import academicWritingHero from "../../assets/academic-writing-hero.png";
import contentWritingTeam from "../../assets/content-writing-team.png";
import ConstellationBackground from "../shared/ConstellationBackground";

const servicesPreview = [
  {
    icon: <FaBookOpen />,
    title: "Assignment Help",
    desc: "Guidance on structuring assignments, understanding requirements, and improving academic writing clarity.",
  },
  {
    icon: <FaGraduationCap />,
    title: "Dissertation Support",
    desc: "Step-by-step support for planning, organizing, and refining dissertation chapters with academic guidance.",
  },
  {
    icon: <FaFileAlt />,
    title: "Technical Writing",
    desc: "Support for improving technical documentation, research presentation, and professional report clarity.",
  },
  {
    icon: <FaPenNib />,
    title: "Proofreading & Editing",
    desc: "Detailed review for grammar, structure, formatting, and citation accuracy to strengthen your final draft.",
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

function Home({ onNavigate }) {
  const scrollToFooter = () => {
    document
      .getElementById("site-footer")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page-shell">
      <section className="hero home-hero">
        <ConstellationBackground variant="home" />
        <div className="hero-bg-shape" aria-hidden="true" />
        <div className="hero-floating-elements" aria-hidden="true">
          <span className="hero-float hero-float-book">
            <FaBookOpen />
          </span>
          <span className="hero-float hero-float-paper">
            <FaFileAlt />
          </span>
          <span className="hero-float hero-float-cap">
            <FaGraduationCap />
          </span>
          <span className="hero-float hero-float-dot" />
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <span className="badge">
              <FaUsers aria-hidden="true" />
              Trusted by Students Worldwide
            </span>

            <h1>
              Professional Academic
              <br />
              Writing Services
            </h1>

            <p>
              We provide high-quality academic writing assistance tailored to
              your academic needs. Expert writers, timely delivery and
              plagiarism-free content.
            </p>

            <div className="features" aria-label="Service benefits">
              <span>
                <FaCheckCircle aria-hidden="true" /> Expert Writers
              </span>
              <span>
                <FaCheckCircle aria-hidden="true" /> On-Time Delivery
              </span>
              <span>
                <FaCheckCircle aria-hidden="true" /> Plagiarism Free
              </span>
            </div>

            <div className="buttons">
              <button
                className="primary-btn"
                type="button"
                onClick={scrollToFooter}
              >
                Get Assignment Help
              </button>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => onNavigate("services")}
              >
                View Services
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-image-frame">
              <img
                src={academicWritingHero}
                alt="Professional academic writers reviewing research and content at a laptop"
              />
            </div>
          </div>
        </div>

        <div className="hero-stats-bar" aria-label="Assignopedia results">
          <div className="hero-stat">
            <FaUsers aria-hidden="true" />
            <div>
              <h3>10K+</h3>
              <p>Happy Students</p>
            </div>
          </div>
          <div className="hero-stat">
            <FaShieldAlt aria-hidden="true" />
            <div>
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
          <div className="hero-stat">
            <FaFileAlt aria-hidden="true" />
            <div>
              <h3>25K+</h3>
              <p>Assignments Completed</p>
            </div>
          </div>
          <div className="hero-stat">
            <FaClock aria-hidden="true" />
            <div>
              <h3>24/7</h3>
              <p>Support Available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-summary home-motion-section">
        <div className="about-summary-hero">
          <div className="section-title">
            <span>ABOUT ASSIGNOPEDIA</span>
            <h2>Empowering Academic & Creative Success - One Word at a Time</h2>
            <p>
              Assignopedia Services is a Kolkata-based academic and content
              writing company committed to delivering excellence in written
              communication. Since our inception, our expert team has supported
              students, professionals and businesses with well-researched,
              plagiarism-free, custom-written content.
            </p>
          </div>

          <div className="about-summary-image">
            <img
              src={contentWritingTeam}
              alt="Professional academic and content writing team collaborating"
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
            We combine subject expertise, fast communication, and careful
            review to deliver polished academic and business content every
            time.
          </p>
        </div>
        <div className="cta-actions">
          <button
            className="primary-btn"
            type="button"
            onClick={() => onNavigate("services")}
          >
            Start Your Project
          </button>
          <button
            className="secondary-btn"
            type="button"
            onClick={() => onNavigate("contact")}
          >
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
