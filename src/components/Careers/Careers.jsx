import {
  FaAlignLeft,
  FaBriefcase,
  FaBullhorn,
  FaChartLine,
  FaEnvelope,
  FaFilePdf,
  FaFileSignature,
  FaLaptopCode,
  FaPenNib,
  FaPhoneAlt,
  FaUser,
} from "react-icons/fa";
import ConstellationBackground from "../shared/ConstellationBackground";
import useCareerApplication from "./hooks/useCareerApplication";

function Careers() {
  const {
    selectedPosition,
    setSelectedPosition,
    cvFileName,
    cvError,
    handleCvChange,
    handleSubmit,
    successMessage,
    isSubmitting,
  } = useCareerApplication();

  const positions = [
    { name: "Academic Writer", icon: FaPenNib },
    { name: "Technical Writer", icon: FaLaptopCode },
    { name: "Digital Marketing", icon: FaBullhorn },
    { name: "Finance Writer", icon: FaChartLine },
  ];

  return (
    <main className="page careers-page">
      <ConstellationBackground variant="careers" />
      <section className="page-hero careers-hero">
        <span>Careers</span>
        <h1>Work With Assignopedia</h1>
        <p>
          Join our academic support network as a writer, editor, researcher, or
          subject expert helping students achieve better outcomes.
        </p>
      </section>

      <section className="careers-modern-section">
        <div className="careers-modern-card">
          <header className="careers-modern-heading">
            <span className="careers-modern-heading-icon">
              <FaBriefcase aria-hidden="true" />
            </span>
            <div className="careers-modern-heading-copy">
              <h2>Positions Offered</h2>
              <div className="careers-position-cards">
                {positions.map(({ name, icon: PositionIcon }) => (
                  <button
                    type="button"
                    className={`careers-position-card${selectedPosition === name ? " is-selected" : ""}`}
                    onClick={() => setSelectedPosition(name)}
                    aria-pressed={selectedPosition === name}
                    key={name}
                  >
                    <PositionIcon aria-hidden="true" />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="careers-modern-divider" aria-hidden="true" />

          <form className="careers-modern-form" onSubmit={handleSubmit}>
            <div className="careers-modern-form-title">
              <span>
                <FaFileSignature aria-hidden="true" />
              </span>
              <h3>Application Form</h3>
            </div>

            {successMessage && (
              <p className="careers-application-success" role="status">
                {successMessage}
              </p>
            )}

            <div className="careers-modern-grid">
              <label className="careers-modern-field">
                <span className="sr-only">Full Name</span>
                <FaUser aria-hidden="true" />
                <input type="text" name="fullName" placeholder="Full Name" autoComplete="name" required />
              </label>

              <label className="careers-modern-field">
                <span className="sr-only">Email Address</span>
                <FaEnvelope aria-hidden="true" />
                <input type="email" name="email" placeholder="Email Address" autoComplete="email" required />
              </label>

              <label className="careers-modern-field">
                <span className="sr-only">Phone Number</span>
                <FaPhoneAlt aria-hidden="true" />
                <input type="tel" name="phone" placeholder="Phone Number" autoComplete="tel" required />
              </label>

              <label className="careers-modern-field">
                <span className="sr-only">Position Applied For</span>
                <FaBriefcase aria-hidden="true" />
                <select
                  name="position"
                  value={selectedPosition}
                  onChange={(event) => setSelectedPosition(event.target.value)}
                  required
                >
                  <option value="" disabled>
                    Position Applied For
                  </option>
                  {positions.map(({ name }) => (
                    <option value={name} key={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="careers-cv-upload">
              <label htmlFor="careers-cv">
                <span className="careers-cv-label">Upload CV</span>
                <span className="careers-cv-control">
                  <FaFilePdf aria-hidden="true" />
                  <span>{cvFileName || "Choose PDF file"}</span>
                  <strong>Browse</strong>
                </span>
                <input
                  id="careers-cv"
                  type="file"
                  name="cv"
                  accept=".pdf,application/pdf"
                  onChange={handleCvChange}
                  required
                />
              </label>
              <small>PDF only, maximum file size 10 MB</small>
              {cvError && (
                <p className="careers-cv-error" role="alert">
                  {cvError}
                </p>
              )}
            </div>

            <label className="careers-modern-field careers-modern-message">
              <span className="sr-only">Tell us about yourself</span>
              <FaAlignLeft aria-hidden="true" />
              <textarea name="about" placeholder="Tell us about yourself..." required />
            </label>

            <button type="submit" className="careers-modern-submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Careers;
