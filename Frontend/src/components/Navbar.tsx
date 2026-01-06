import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
// Removed playful icons (Beaker) to keep it clean/minimalist if requested, or kept minimal.
// User image shows a hexagonal logo. I'll use text for now or a simple svg placeholder.

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-lab-black/90 backdrop-blur-md border-b-[1px] border-lab-gold/20 shadow-lg">
      {/* Invisible Gradient Definition for Icons */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="200%" y2="0%">
            <stop offset="0%" stopColor="#BF953F" />
            <stop offset="25%" stopColor="#FCF6BA" />
            <stop offset="50%" stopColor="#BF953F" />
            <stop offset="75%" stopColor="#FCF6BA" />
            <stop offset="100%" stopColor="#BF953F" />
            <animate
              attributeName="x1"
              from="-100%"
              to="100%"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              from="100%"
              to="300%"
              dur="3s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-8xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* LEFT: Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-lab-white transition-colors duration-300 relative group"
          >
            {/* Using GoldText logic inline safely */}
            <span className="text-gold-metallic">CHEWY LAB</span>
          </Link>

          {/* RIGHT: Navigation & Cart */}
          <div className="flex items-center gap-8">
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink to="/">HOME</NavLink>
              <NavLink to="/shop">SHOP</NavLink>
              <NavLink to="/about">ABOUT</NavLink>
            </div>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-lab-white transition-all duration-300 group"
            >
              {/* Stroke changes to gradient on hover */}
              <ShoppingBag className="w-6 h-6 stroke-[1.5] transition-all duration-300 group-hover:stroke-[url(#gold-gradient)] group-hover:drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" />
              <span className="absolute -top-1 -right-1 bg-lab-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Helper for consistent typography
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="group relative text-sm font-medium tracking-widest text-gray-300 transition-colors duration-300"
    >
      <span className="relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#BF953F] group-hover:via-[#FCF6BA] group-hover:to-[#BF953F] group-hover:bg-[length:200%_auto] group-hover:animate-[shine_3s_linear_infinite]">
        {children}
      </span>
    </Link>
  );
}
