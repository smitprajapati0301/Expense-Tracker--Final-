import { ThemeToggle } from './ThemeToggle';
import { FaPlus } from 'react-icons/fa';

const Navbar = ({ onAddClick }) => (
  <div className="bg-black text-white p-4 flex justify-between items-center">
    <h1 className="text-xl font-bold">Trackify</h1>
    <div className="flex gap-4 items-center">
      <ThemeToggle />
      <button onClick={onAddClick} className="bg-white text-black p-2 rounded-full hover:scale-105 transition">
        <FaPlus />
      </button>
    </div>
  </div>
);

export default Navbar;
