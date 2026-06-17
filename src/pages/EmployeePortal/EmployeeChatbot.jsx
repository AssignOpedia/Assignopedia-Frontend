import { useState } from "react";
import { FaPaperPlane, FaRobot, FaTimes } from "react-icons/fa";

const quickPrompts = [
  "What services do you offer?",
  "How can I contact you?",
  "Do you help with assignments?",
  "How can I apply for a job?",
];

const getBotReply = (message) => {
  const query = message.toLowerCase();

  if (
    query.includes("service") ||
    query.includes("offer") ||
    query.includes("provide") ||
    query.includes("help with")
  ) {
    return "Assignopedia offers academic, technical, and professional support including assignment help, research proposals, dissertation and thesis assistance, business and management assignments, report writing, programming, cloud and data analytics, UI/UX design, web development, technical writing, finance and accounting, digital marketing, and creative design services.";
  }

  if (
    query.includes("assignment") ||
    query.includes("coursework") ||
    query.includes("essay") ||
    query.includes("case study")
  ) {
    return "Yes, Assignopedia helps with assignments, essays, reports, case studies, coursework, and academic projects. Work is tailored to the client's brief, with focus on originality, structure, and timely delivery.";
  }

  if (
    query.includes("dissertation") ||
    query.includes("thesis") ||
    query.includes("research proposal") ||
    query.includes("methodology") ||
    query.includes("literature review")
  ) {
    return "Assignopedia supports research proposals, dissertations, and theses, including topic selection, literature review, methodology, data analysis, chapter assistance, and final submission support.";
  }

  if (
    query.includes("programming") ||
    query.includes("coding") ||
    query.includes("python") ||
    query.includes("java") ||
    query.includes("sql") ||
    query.includes("web development")
  ) {
    return "For technical projects, Assignopedia supports programming and development work including Python, Java, HTML, C, C++, SQL, Linux, debugging, software projects, responsive web design, frontend development, and backend integration.";
  }

  if (
    query.includes("finance") ||
    query.includes("accounting") ||
    query.includes("balance sheet") ||
    query.includes("ratio")
  ) {
    return "Assignopedia provides finance and accounting support such as financial analysis, ratio analysis, balance sheets, finance reports, and finance-related academic projects.";
  }

  if (
    query.includes("digital marketing") ||
    query.includes("seo") ||
    query.includes("social media") ||
    query.includes("blog writing") ||
    query.includes("content marketing")
  ) {
    return "Assignopedia provides digital marketing services including SEO optimization, blog writing, content marketing, and social media marketing.";
  }

  if (
    query.includes("design") ||
    query.includes("poster") ||
    query.includes("banner") ||
    query.includes("cv") ||
    query.includes("reel") ||
    query.includes("infographic")
  ) {
    return "Assignopedia offers creative design services including CV writing, poster design, banner design, ad creatives, reel making, infographics, UI/UX design, Figma, Canva, and prototyping.";
  }

  if (
    query.includes("price") ||
    query.includes("pricing") ||
    query.includes("cost") ||
    query.includes("charge") ||
    query.includes("fees")
  ) {
    return "Pricing depends on the service type, subject, deadline, word count, and complexity. For an exact quote, contact Assignopedia with your project details by email or WhatsApp.";
  }

  if (
    query.includes("contact") ||
    query.includes("phone") ||
    query.includes("call") ||
    query.includes("whatsapp") ||
    query.includes("email") ||
    query.includes("reach")
  ) {
    return "You can contact Assignopedia by phone or WhatsApp at +91 6291075245. For client queries and projects, email assignopedia2.0@gmail.com. Career queries can be sent to hrrecruiter.aop@gmail.com.";
  }

  if (
    query.includes("location") ||
    query.includes("address") ||
    query.includes("office") ||
    query.includes("kolkata")
  ) {
    return "Assignopedia Services is based in Kolkata, West Bengal, India. Business hours are Monday to Saturday, 11:00 AM to 7:00 PM. Sunday is closed.";
  }

  if (
    query.includes("time") ||
    query.includes("deadline") ||
    query.includes("delivery") ||
    query.includes("urgent") ||
    query.includes("fast")
  ) {
    return "Assignopedia focuses on timely delivery and can support tight deadlines depending on the project scope. Share your deadline and requirements to confirm availability.";
  }

  if (
    query.includes("plagiarism") ||
    query.includes("original") ||
    query.includes("unique") ||
    query.includes("quality")
  ) {
    return "Assignopedia emphasizes plagiarism-free, custom-written content, expert subject teams, careful editing, and quality-focused delivery.";
  }

  if (
    query.includes("career") ||
    query.includes("job") ||
    query.includes("hiring") ||
    query.includes("apply") ||
    query.includes("vacancy") ||
    query.includes("opportunity") ||
    query.includes("opportunities") ||
    query.includes("position")
  ) {
    return "Career opportunities at Assignopedia include Academic Writer, Technical Writer, Digital Marketing, and Finance Writer. To apply, open the Careers page, choose the position, enter your name, email, phone number, upload your PDF CV under 10 MB, and submit the application form. For career queries, email hrrecruiter.aop@gmail.com.";
  }

  if (
    query.includes("blog") ||
    query.includes("resource") ||
    query.includes("guide") ||
    query.includes("referencing") ||
    query.includes("apa") ||
    query.includes("mla") ||
    query.includes("harvard")
  ) {
    return "The Blog page has academic resources including writing tips, referencing guides, dissertation guidance, and research methodology support.";
  }

  if (
    query.includes("about") ||
    query.includes("company") ||
    query.includes("assignopedia") ||
    query.includes("who are you")
  ) {
    return "Assignopedia Services is a Kolkata-based academic and content writing company supporting students, professionals, and businesses with researched, plagiarism-free, custom-written content. The team includes academic, technical, business, and finance writers.";
  }

  if (
    query.includes("writer") ||
    query.includes("expert") ||
    query.includes("team")
  ) {
    return "Assignopedia has specialized writer groups across non-technical, financial, and technical domains, with support for business strategy, finance, software documentation, academic writing, and technical projects.";
  }

  if (
    query.includes("login") ||
    query.includes("portal") ||
    query.includes("employee") ||
    query.includes("hr") ||
    query.includes("admin")
  ) {
    return "The website has separate portals for Employee, HR, and Admin users. Employees can access dashboard, profile, attendance, team, leave/WFH, tasks, performance, and notifications after login.";
  }

  if (query.includes("leave")) {
    return "You can apply for leave from Leave / WFH in the employee sidebar. Fill the leave form, add dates and reason, then submit it for HR review.";
  }

  if (query.includes("wfh") || query.includes("work from home")) {
    return "For WFH, open Leave / WFH, choose the WFH request form, add the date, task/project name, and reason. HR will review it.";
  }

  if (query.includes("attendance") || query.includes("login") || query.includes("logout")) {
    return "Attendance details are available in the Attendance page. You can check login time, logout records, late login count, and attendance summary there.";
  }

  if (query.includes("task") || query.includes("project")) {
    return "Open Tasks for pending work and Projects for assigned projects, status, progress, and deadlines.";
  }

  if (query.includes("password") || query.includes("otp")) {
    return "Use Forgot Password on the employee login page. The OTP request will go to HR and Admin notifications for account password changes.";
  }

  if (query.includes("profile") || query.includes("photo") || query.includes("picture")) {
    return "Open Profile to view your account details and upload or update your profile picture.";
  }

  if (query.includes("support")) {
    return "For HR support, raise the relevant request in the portal or contact HR from your organization workflow.";
  }

  return "I can help with Assignopedia services, pricing, contact details, office location, careers, blogs, academic support, technical projects, and employee portal questions. Try asking about assignment help, dissertation support, pricing, or how to contact the team.";
};

function EmployeeChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi, I am your Assignopedia assistant. Ask me about services, pricing, contact details, careers, blogs, or employee portal help.",
    },
  ]);

  const sendMessage = (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) {
      return;
    }

    setMessages((current) => [
      ...current,
      { sender: "user", text: trimmedMessage },
      { sender: "bot", text: getBotReply(trimmedMessage) },
    ]);
    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <section className={`employee-chatbot${isOpen ? " is-open" : ""}`}>
      {isOpen && (
        <div className="employee-chatbot-panel">
          <header>
            <div>
              <span>
                <FaRobot />
              </span>
              <strong>Assignopedia AI Help</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close employee chat"
            >
              <FaTimes />
            </button>
          </header>

          <div className="employee-chatbot-messages">
            {messages.map((item, index) => (
              <p className={item.sender} key={`${item.sender}-${index}`}>
                {item.text}
              </p>
            ))}
          </div>

          <div className="employee-chatbot-prompts">
            {quickPrompts.map((prompt) => (
              <button type="button" key={prompt} onClick={() => sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="employee-chatbot-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask your query..."
              aria-label="Ask employee assistant"
            />
            <button type="submit" aria-label="Send message">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}

      <button
        className="employee-chatbot-toggle"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Close employee chat" : "Open employee chat"}
      >
        <FaRobot />
      </button>
    </section>
  );
}

export default EmployeeChatbot;
