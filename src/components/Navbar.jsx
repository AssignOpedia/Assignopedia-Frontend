import logo from "../assets/logo.PNG";

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Assignopedia"
            className="h-14"
          />

          <div>
            <h1 className="text-3xl font-bold text-[#0B1A4A]">
              Assignopedia
            </h1>

            <p className="text-sm text-gray-500">
              Academic Excellence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-10 text-lg font-medium">
          <a href="#" className="text-[#0B1A4A]">Home</a>
          <a href="#" className="hover:text-[#0B1A4A]">Services</a>
          <a href="#" className="hover:text-[#0B1A4A]">About</a>
          <a href="#" className="hover:text-[#0B1A4A]">Contact</a>

          <button className="bg-[#0B1A4A] text-white px-6 py-3 rounded-xl">
            Get Help
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;