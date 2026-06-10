import student from "../assets/student.png";

function Hero() {
  return (
    <section className="hero">
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
            <p>Students Assisted</p>
          </div>

          <div>
            <h3>4.9/5</h3>
            <p>Rating</p>
          </div>

          <div>
            <h3>98%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <img src={student} alt="student" />
      </div>
    </section>
  );
}

export default Hero;