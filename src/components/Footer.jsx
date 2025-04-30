import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiLinkedin, FiGithub } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-green-800 to-green-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          {/* About Section */}
          <div className="space-y-6">
            <h3 className="text-3xl font-serif font-bold tracking-wide">PlantCare</h3>
            <p className="text-gray-200 text-base leading-relaxed font-sans">
              A distinguished 3-2 Semester project by Saiful Islam (Roll: 2004046). Empowering farmers with cutting-edge AI solutions for plant disease identification and treatment. Explore my <a href="https://saiful-portfolio-nine.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:underline">portfolio</a> and discover additional projects on <a href="https://github.com/saifulislam735" target="_blank" rel="noopener noreferrer" className="text-green-300 hover:underline">GitHub</a>.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://github.com/saifulislam735"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-green-700 rounded-lg hover:bg-green-600 hover:scale-110 hover:shadow-md transition-all duration-300"
                aria-label="GitHub"
              >
                <FiGithub size={22} />
              </a>
              <a
                href="https://www.instagram.com/shihab_46_/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-green-700 rounded-lg hover:bg-green-600 hover:scale-110 hover:shadow-md transition-all duration-300"
                aria-label="Instagram"
              >
                <FiInstagram size={22} />
              </a>
              <a
                href="https://www.linkedin.com/in/saiful-islam-a1a352232"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-green-700 rounded-lg hover:bg-green-600 hover:scale-110 hover:shadow-md transition-all duration-300"
                aria-label="LinkedIn"
              >
                <FiLinkedin size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-semibold">Quick Links</h3>
            <ul className="space-y-4 text-gray-200">
              <li>
                <Link
                  to="/"
                  className="text-base font-sans hover:text-green-300 hover:underline hover:scale-105 transition-all duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/get-help"
                  className="text-base font-sans hover:text-green-300 hover:underline hover:scale-105 transition-all duration-300"
                >
                  Get Help
                </Link>
              </li>
              <li>
                <Link
                  to="/data-collect"
                  className="text-base font-sans hover:text-green-300 hover:underline hover:scale-105 transition-all duration-300"
                >
                  Data Collect
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="text-base font-sans hover:text-green-300 hover:underline hover:scale-105 transition-all duration-300"
                >
                  Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-semibold">Contact Us</h3>
            <ul className="space-y-4 text-gray-200">
              <li className="flex items-start">
                <FiMapPin className="mr-4 mt-1 flex-shrink-0" size={20} />
                <span className="text-base font-sans">RUET Bangabandhu Hall, Rajshahi, Bangladesh</span>
              </li>
              <li className="flex items-start">
                <FiPhone className="mr-4 mt-1 flex-shrink-0" size={20} />
                <a
                  href="tel:+8801762589872"
                  className="text-base font-sans hover:text-green-300 hover:underline transition-all duration-300"
                >
                  +880 1762 589872
                </a>
              </li>
              <li className="flex items-start">
                <FiMail className="mr-4 mt-1 flex-shrink-0" size={20} />
                <a
                  href="mailto:saifulislam11696@gmail.com"
                  className="text-base font-sans hover:text-green-300 hover:underline transition-all duration-300"
                >
                  saifulislam11696@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-16 pt-10 border-t border-green-700 text-center">
          <p className="text-base text-gray-200 font-sans">
            © {new Date().getFullYear()} PlantCare. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;