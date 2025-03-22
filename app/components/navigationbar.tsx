import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-blue-400 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-xl">
          <a href="/">Rawaes</a>
        </div>

        <div className="hidden md:flex space-x-6">
          <a href="/" className="text-white hover:text-gray-300">
            Home
          </a>
          <a href="/availablelist" className="text-white hover:text-gray-300">
          Available List
          </a>
          <a href="/bookedhomemaid" className="text-white hover:text-gray-300">
            Booked
          </a>
          <a href="/list" className="text-white hover:text-gray-300">
            Full List
          </a>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-blue-4  00 p-4`}
      >
        <a href="/home" className="block text-white py-2">
          Home
        </a>
        <a href="/bookedhomemaid" className="block text-white py-2">
          Booked
        </a>
        <a href="/availablelist" className="block text-white py-2">
        Available
        </a>
        <a href="/workerlist" className="block text-white py-2">
          Full List
        </a>
        <a href="/workerlist" className="block text-white py-2">
        New HomeMaid
        </a>
      </div>
    </nav>
  );
}
