import { memo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { MenuIcon, SearchIcon, XIcon, TicketPlus } from "lucide-react";

import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useUser();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const { favoriteMovies } = useAppContext();

  const handleNavigate = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsOpen(false);
  }, []);

  const showFavorites = favoriteMovies.length > 0;

  return (
    <header className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-transparent">
      <Link to="/" className="max-md:flex-1">
        <img
          src={assets.logo}
          alt="BookMyShow Clone Logo"
          className="w-52 md:w-64 cursor-pointer"
        />
      </Link>

      <nav
        className={`max-md:absolute max-md:top-0 max-md:left-0 z-50
          flex flex-col md:flex-row items-center gap-8 md:px-8 py-3
          max-md:h-screen md:rounded-full backdrop-blur bg-black/70
          md:bg-white/10 md:border border-gray-300/20 transition-all duration-300
          ${isOpen ? "max-md:w-full" : "max-md:w-0 overflow-hidden"}`}
      >
        <XIcon
          className="md:hidden absolute top-6 right-6 size-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />

        <Link to="/" onClick={handleNavigate}>
          Home
        </Link>
        <Link to="/movies" onClick={handleNavigate}>
          Movies
        </Link>
        <Link to="/" onClick={handleNavigate}>
          Theatres
        </Link>
        <Link to="/" onClick={handleNavigate}>
          Releases
        </Link>

        {showFavorites && (
          <Link to="/favorite" onClick={handleNavigate}>
            Favorites
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-8">
        <SearchIcon className="max-md:hidden size-6 cursor-pointer" />

        {!user ? (
          <button
            onClick={() => openSignIn()}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull
              transition rounded-full font-medium cursor-pointer"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus width={15} />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      <MenuIcon
        className="max-md:ml-4 md:hidden size-8 cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      />
    </header>
  );
}

export default memo(Navbar);
