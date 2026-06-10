function Services() {
  const services = [
    "Assignment Help",
    "Dissertation Assistance",
    "Research Proposal Writing",
    "Presentation Development",
    "Case Study Solutions",
    "Proofreading & Editing",
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-[#FFF0F5] to-[#FFF8DC]">

      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-5xl font-bold text-center mb-16 text-[#0B1A4A]">
          Our Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {services.map((service, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl hover:scale-105 hover:shadow-2xl transition duration-300 border border-pink-100"
            >
              <div className="text-4xl mb-4">📚</div>

              <h3 className="text-2xl font-bold text-[#0B1A4A]">
                {service}
              </h3>

              <p className="mt-4 text-gray-600">
                Professional academic support and expert guidance for students.
              </p>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}

export default Services;