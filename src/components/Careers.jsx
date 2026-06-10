import {
  FaBriefcase,
  FaClock,
  FaFileUpload,
  FaLaptopHouse,
  FaUserGraduate,
} from "react-icons/fa";

function Careers() {
  const vacancies = [
    {
      role: "Academic Writer",
      type: "Remote",
      detail: "Write assignments, reports, essays, and study support content.",
    },
    {
      role: "Dissertation Specialist",
      type: "Part-time",
      detail: "Support students with chapters, research design, and editing.",
    },
    {
      role: "Proofreader & Editor",
      type: "Freelance",
      detail: "Improve grammar, flow, formatting, clarity, and references.",
    },
  ];

  const freelancerItems = [
    "Flexible project-based work",
    "Choose subjects that match your expertise",
    "Remote collaboration with academic support team",
  ];

  return (
    <main className="page careers-page">
      <section className="page-hero careers-hero">
        <span>Careers</span>
        <h1>Work With Assignopedia</h1>
        <p>
          Join our academic support network as a writer, editor, researcher, or
          subject expert helping students achieve better outcomes.
        </p>
      </section>

      <section className="careers-layout">
        <div className="vacancies-panel">
          <div className="panel-heading">
            <span>
              <FaBriefcase />
            </span>
            <div>
              <h2>Current Vacancies</h2>
              <p>Explore open roles and freelance academic opportunities.</p>
            </div>
          </div>

          <div className="vacancy-list">
            {vacancies.map((vacancy) => (
              <article className="vacancy-card" key={vacancy.role}>
                <div>
                  <h3>{vacancy.role}</h3>
                  <p>{vacancy.detail}</p>
                </div>
                <span>{vacancy.type}</span>
              </article>
            ))}
          </div>

          <div className="freelancer-box">
            <div className="freelancer-title">
              <FaLaptopHouse />
              <h3>Freelancer Opportunities</h3>
            </div>
            <ul>
              {freelancerItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <form className="apply-form">
          <div className="form-title">
            <span>
              <FaUserGraduate />
            </span>
            <div>
              <h2>Apply Form</h2>
              <p>Send your details and preferred role.</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Full Name
              <input type="text" placeholder="Your name" />
            </label>
            <label>
              Email
              <input type="email" placeholder="you@example.com" />
            </label>
          </div>

          <label>
            Position
            <select defaultValue="">
              <option value="" disabled>
                Select a position
              </option>
              <option>Academic Writer</option>
              <option>Dissertation Specialist</option>
              <option>Proofreader & Editor</option>
              <option>Freelance Subject Expert</option>
            </select>
          </label>

          <label>
            Expertise
            <textarea placeholder="Subjects, experience, degrees, and availability" />
          </label>

          <div className="upload-row">
            <FaFileUpload />
            <span>Attach CV or writing sample after submitting inquiry.</span>
          </div>

          <button type="button" className="apply-btn">
            Submit Application
          </button>

          <div className="response-note">
            <FaClock />
            <span>Our hiring team usually responds within 2 business days.</span>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Careers;
