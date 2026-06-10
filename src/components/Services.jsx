function Services() {
  const services = [
    {
      icon: "📚",
      title: "Assignment Help",
      desc: "Expert assistance on assignments of all subjects and levels."
    },
    {
      icon: "🎓",
      title: "Dissertation Assistance",
      desc: "Complete dissertation support from topic selection to conclusion."
    },
    {
      icon: "🔍",
      title: "Research Proposal Writing",
      desc: "Well-researched proposals to kickstart your research."
    },
    {
      icon: "📊",
      title: "Presentation Development",
      desc: "Professional slides that impress your audience."
    },
    {
      icon: "💼",
      title: "Case Study Solutions",
      desc: "In-depth case study solutions by subject matter experts."
    },
    {
      icon: "✍️",
      title: "Proofreading & Editing",
      desc: "Error-free content with perfect grammar and formatting."
    }
  ];

  return (
    <section className="services">
      <div className="section-title">
        <span>WHAT WE OFFER</span>
        <h2>Our Services</h2>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-icon">
              {service.icon}
            </div>

            <h3>{service.title}</h3>

            <p>{service.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;