import { NavLink } from "react-router-dom";

function NavBar() {
  return (
    <nav className="bg-gray-800 shadow-md sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto px-8 py-4">
        <div className="text-2xl font-bold mr-8">
          <NavLink
            to="/"
            className="text-white hover:text-blue-400 transition-colors duration-300"
          >
            Luna
          </NavLink>
        </div>
        <ul className="flex flex-row-reverse gap-8 list-none m-0 p-0">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md font-semibold transition-all duration-300 border-b-2 block ${
                  isActive
                    ? "text-blue-400 bg-blue-400 bg-opacity-10 border-blue-400"
                    : "text-gray-300 border-transparent hover:text-white hover:bg-blue-400 hover:bg-opacity-10"
                }`
              }
              end
            >
              الرئيسية
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/invoice"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md font-semibold transition-all duration-300 border-b-2 block ${
                  isActive
                    ? "text-blue-400 bg-blue-400 bg-opacity-10 border-blue-400"
                    : "text-gray-300 border-transparent hover:text-white hover:bg-blue-400 hover:bg-opacity-10"
                }`
              }
            >
              الفواتير
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/saved-invoices"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md font-semibold transition-all duration-300 border-b-2 block ${
                  isActive
                    ? "text-blue-400 bg-blue-400 bg-opacity-10 border-blue-400"
                    : "text-gray-300 border-transparent hover:text-white hover:bg-blue-400 hover:bg-opacity-10"
                }`
              }
            >
              الفواتير المحفوظة
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md font-semibold transition-all duration-300 border-b-2 block ${
                  isActive
                    ? "text-blue-400 bg-blue-400 bg-opacity-10 border-blue-400"
                    : "text-gray-300 border-transparent hover:text-white hover:bg-blue-400 hover:bg-opacity-10"
                }`
              }
            >
              عن الموقع
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-4 py-2 rounded-md font-semibold transition-all duration-300 border-b-2 block ${
                  isActive
                    ? "text-blue-400 bg-blue-400 bg-opacity-10 border-blue-400"
                    : "text-gray-300 border-transparent hover:text-white hover:bg-blue-400 hover:bg-opacity-10"
                }`
              }
            >
              اتصل بنا
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
