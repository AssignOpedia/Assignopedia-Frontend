import {
  FaBookOpen,
  FaGraduationCap,
  FaFileAlt,
  FaBriefcase,
  FaCode,
  FaCloud,
  FaPalette,
  FaGlobe,
  FaLaptopCode,
  FaChartLine,
  FaBullhorn,
  FaPenFancy,
} from "react-icons/fa";

function Services() {
  const services = [
    {
      icon: <FaFileAlt />,
      title: "Research Proposal Writing",
      desc: "High-quality research proposals with clear objectives, literature review, methodology, and academic formatting.",
      benefits: [
        "Topic Selection",
        "Literature Review",
        "Research Methodology",
      ],
    },
    {
      icon: <FaGraduationCap />,
      title: "Dissertation & Thesis Assistance",
      desc: "Complete support for dissertations and theses from proposal development to final submission.",
      benefits: [
        "Full Dissertation",
        "Full Thesis",
        "Data Analysis",
      ],
    },
    {
      icon: <FaBriefcase />,
      title: "Business & Management Assignments",
      desc: "Expert assistance for business, management, marketing, HRM, operations, and strategic management assignments.",
      benefits: [
        "Case Studies",
        "Business Reports",
        "Strategic Analysis",
      ],
    },
    {
      icon: <FaBookOpen />,
      title: "Report Writing Services",
      desc: "Well-structured academic and professional reports tailored to university and industry standards.",
      benefits: [
        "Academic Reports",
        "Technical Reports",
        "Business Reports",
      ],
    },
    {
      icon: <FaCode />,
      title: "Programming & Development",
      desc: "Professional support for coding assignments, software projects, debugging, and development tasks.",
      benefits: [
        "Python & Java",
        "HTML, C & C++",
        "SQL & Linux",
      ],
    },
    {
      icon: <FaCloud />,
      title: "Cloud & Data Analytics",
      desc: "Advanced solutions in cloud computing, business intelligence, cybersecurity, and data visualization.",
      benefits: [
        "AWS & Azure",
        "Power BI",
        "Tableau",
      ],
    },
    {
      icon: <FaPalette />,
      title: "UI/UX Design & Prototyping",
      desc: "Modern UI/UX design services with interactive prototypes and user-centered experiences.",
      benefits: [
        "Figma",
        "Canva",
        "Prototyping",
      ],
    },
    {
      icon: <FaGlobe />,
      title: "Web Design & Development",
      desc: "Responsive and modern websites tailored for businesses, startups, and academic projects.",
      benefits: [
        "Responsive Design",
        "Frontend Development",
        "Backend Integration",
      ],
    },
    {
      icon: <FaLaptopCode />,
      title: "Technical Writing & Documentation",
      desc: "Professional technical documentation, technical reports, dissertations, and project documentation.",
      benefits: [
        "Technical Reports",
        "Documentation",
        "Technical Dissertation",
      ],
    },
    {
      icon: <FaChartLine />,
      title: "Finance & Accounting Services",
      desc: "Expert assistance with financial analysis, accounting tasks, and finance-related academic projects.",
      benefits: [
        "Ratio Analysis",
        "Balance Sheets",
        "Finance Reports",
      ],
    },

    // NEW DIGITAL MARKETING CARD
    {
      icon: <FaBullhorn />,
      title: "Digital Marketing Services",
      desc: "Professional digital marketing solutions to improve online visibility, engagement, and business growth.",
      benefits: [
        "SEO Optimization",
        "Blog Writing",
        "Content Marketing",
        "Social Media Marketing",
      ],
    },

    // NEW CREATIVE DESIGN CARD
    {
      icon: <FaPenFancy />,
      title: "Creative Design Services",
      desc: "Professional creative design solutions for personal branding, promotions, advertising, and social media.",
      benefits: [
        "CV Writing",
        "Poster Design",
        "Banner Design",
        "Ad Creatives",
        "Reel Making",
        "Infographics",
      ],
    },
  ];

  return (
    <section className="services">
      <div className="section-title">
        <span>OUR SERVICES</span>

        <h2>Academic, Technical & Professional Solutions</h2>

        <p>
          Comprehensive support for assignments, research, programming,
          finance, cloud technologies, digital marketing, web development,
          design services, and professional academic assistance.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div className="service-card" key={service.title}>
            <div className="service-icon">{service.icon}</div>

            <h3>{service.title}</h3>

            <p>{service.desc}</p>

            <div className="service-block">
              <h4>Services Include</h4>

              <div className="benefit-list">
                {service.benefits.map((benefit) => (
                  <span key={benefit}>{benefit}</span>
                ))}
              </div>
            </div>

            <button className="pricing-cta">Get Pricing</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;