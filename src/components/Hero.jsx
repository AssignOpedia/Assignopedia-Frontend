import student from "../assets/student.png";
import { FaUserGraduate, FaStar, FaShieldAlt } from "react-icons/fa";

function Hero() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Side */}
        <div>
          <span className="inline-block bg-yellow-100 text-[#0B1A4A] px-4 py-2 rounded-lg font-semibold mb-5">
            🎓 Trusted Academic Partner
          </span>

          <h1 className="text-5xl md:text-6xl font-bold text-[#0B1A4A] leading-tight">
            Professional Academic
            <br />
            Writing Services
          </h1>

          <p className="text-gray-600 text-lg mt-6 leading-8">
            We provide high-quality academic writing assistance to help
            students achieve academic excellence through expert guidance,
            timely delivery, and plagiarism-free content.
          </p>

          <div className="flex flex-wrap gap-4 mt-6 text-[#0B1A4A] font-medium">
            <span>✅ Expert Writers</span>
            <span>✅ On-Time Delivery</span>
            <span>✅ Plagiarism Free</span>
          </div>

          <div className="flex gap-4 mt-8">
            <button className="bg-[#0B1A4A] text-white px-6 py-3 rounded-lg">
              Get Assignment Help
            </button>

            <button className="border-2 border-[#0B1A4A] text-[#0B1A4A] px-6 py-3 rounded-lg">
              View Services
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="text-center">
              <FaUserGraduate
                className="mx-auto text-[#0B1A4A]"
                size={35}
              />
              <h3 className="text-3xl font-bold mt-2">5000+</h3>
              <p className="text-gray-500">Students Assisted</p>
            </div>

            <div className="text-center">
              <FaStar
                className="mx-auto text-yellow-500"
                size={35}
              />
              <h3 className="text-3xl font-bold mt-2">4.9/5</h3>
              <p className="text-gray-500">Rating</p>
            </div>

            <div className="text-center">
              <FaShieldAlt
                className="mx-auto text-[#0B1A4A]"
                size={35}
              />
              <h3 className="text-3xl font-bold mt-2">98%</h3>
              <p className="text-gray-500">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div>
          <img
            src={student}
            alt="Student"
            className="w-full max-w-2xl mx-auto"
          />
        </div>

      </div>
    </section>
  );
}

export default Hero;