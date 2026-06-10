import {
  FaBookOpen,
  FaChartLine,
  FaClipboardCheck,
  FaComments,
  FaFileAlt,
  FaGraduationCap,
  FaPenNib,
} from "react-icons/fa";

function Services() {
  const services = [
    {
      icon: <FaBookOpen />,
      title: "Assignment Help",
      desc: "Subject-focused assignment support for essays, reports, problem sets, reflective writing, and coursework across academic levels.",
      benefits: ["Custom writing", "Clear structure", "Deadline support"],
      process: ["Share brief", "Expert matching", "Quality review"],
    },
    {
      icon: <FaGraduationCap />,
      title: "Dissertation Assistance",
      desc: "Guided dissertation support from topic refinement and literature review to methodology, analysis, editing, and final formatting.",
      benefits: ["Chapter guidance", "Research depth", "Formatting help"],
      process: ["Scope chapters", "Draft sections", "Finalize submission"],
    },
    {
      icon: <FaFileAlt />,
      title: "Research Proposal Writing",
      desc: "Well-planned proposals with strong research questions, rationale, objectives, methodology, and academic references.",
      benefits: ["Focused topic", "Method clarity", "Citation support"],
      process: ["Confirm idea", "Build framework", "Polish proposal"],
    },
    {
      icon: <FaChartLine />,
      title: "Presentation Development",
      desc: "Professional academic presentations with organized content, clean slides, speaker notes, and visual storytelling.",
      benefits: ["Clean slides", "Speaker notes", "Visual flow"],
      process: ["Plan outline", "Design slides", "Review delivery"],
    },
    {
      icon: <FaClipboardCheck />,
      title: "Case Study Solutions",
      desc: "Analytical case study answers with problem diagnosis, evidence-based discussion, recommendations, and conclusion.",
      benefits: ["Deep analysis", "Practical insights", "Strong arguments"],
      process: ["Review case", "Analyze evidence", "Write solution"],
    },
    {
      icon: <FaPenNib />,
      title: "Proofreading & Editing",
      desc: "Careful language, grammar, clarity, referencing, flow, and formatting edits to make your academic work submission-ready.",
      benefits: ["Grammar polish", "Better flow", "Reference checks"],
      process: ["Upload draft", "Edit details", "Return clean copy"],
    },
    {
      icon: <FaComments />,
      title: "Academic Consultation",
      desc: "One-to-one academic guidance for planning, topic selection, research direction, writing strategy, and improvement feedback.",
      benefits: ["Expert advice", "Study clarity", "Action plan"],
      process: ["Book session", "Discuss goals", "Get roadmap"],
    },
  ];

  return (
    <section className="services">
      <div className="section-title">
        <span>SERVICES PAGE</span>
        <h2>Academic Services Built Around Your Goals</h2>
        <p>
          Choose focused support for every stage of your academic work, from
          first idea to final submission.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service) => (
          <div className="service-card" key={service.title}>
            <div className="service-icon">{service.icon}</div>

            <h3>{service.title}</h3>

            <p>{service.desc}</p>

            <div className="service-block">
              <h4>Benefits</h4>
              <div className="benefit-list">
                {service.benefits.map((benefit) => (
                  <span key={benefit}>{benefit}</span>
                ))}
              </div>
            </div>

            <div className="service-block">
              <h4>Process</h4>
              <ol className="process-list">
                {service.process.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <button className="pricing-cta">Get Pricing</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;
