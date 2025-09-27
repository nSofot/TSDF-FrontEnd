import { Link, useNavigate, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { useEffect, useState } from "react";
import { FaRegUser } from "react-icons/fa";

export default function Header() {
    const [sideDrawerOpened, setSideDrawerOpened] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token");
    const cart = localStorage.getItem("cart");
    const isLoggedIn = Boolean(token);
    const cartCount = cart ? JSON.parse(cart).length : 0;
    const user = localStorage.getItem("user");

    const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/", { replace: true });
    };

    // Close side drawer on route change
    useEffect(() => {
      setSideDrawerOpened(false);
    }, [location.pathname]);

    return (
        <header className="w-full h-[80px] shadow-2xl flex justify-center relative bg-white z-50">
            {/* Hamburger Icon (Mobile) */}
            <GiHamburgerMenu
                className="h-full text-3xl md:hidden absolute left-4 cursor-pointer"
                onClick={() => setSideDrawerOpened(true)}
            />

            {/* Logo */}
            <img
                src="/LogoTSDF.png"
                alt="Logo"
                className="w-[80px] h-[80px] object-cover cursor-pointer"
                onClick={() => navigate("/")}
            />

            {/* Desktop Nav Links */}
            {isLoggedIn ? (
                <nav className="flex-1 hidden md:flex justify-center items-center">
                    <Link to="/"          className="text-lg font-bold mx-3 hover:underline">Home</Link>
                    <Link to="/Gallery"    className="text-lg font-bold mx-3 hover:underline">Gallery</Link>
                    <Link to="/about"     className="text-lg font-bold mx-3 hover:underline">About</Link>
                    <Link to="/contact"   className="text-lg font-bold mx-3 hover:underline">Contact</Link>
                    <Link to="/profile"   className="text-lg font-bold mx-3 hover:underline">Profile</Link>
                    <Link to="/membership" className="text-lg font-bold mx-3 hover:underline">Membership Fee</Link>
                    <Link to="/loan"      className="text-lg font-bold mx-3 hover:underline">Loan</Link>
                    <Link to="/apply-loan"      className="text-lg font-bold mx-3 hover:underline">Apply Loan</Link>
                    <Link to="/constitution"      className="text-lg font-bold mx-3 hover:underline">Constitution</Link>
                </nav>
            ) : (
                <nav className="flex-1 hidden md:flex justify-center items-center">
                    <Link to="/"          className="text-lg font-bold mx-3 hover:underline">Home</Link>
                    <Link to="/Gallery"    className="text-lg font-bold mx-3 hover:underline">Gallery</Link>
                    <Link to="/about"     className="text-lg font-bold mx-3 hover:underline">About</Link>
                    <Link to="/contact"   className="text-lg font-bold mx-3 hover:underline">Contact</Link>
                    <Link to="/login"     className="text-lg font-bold mx-3 hover:underline">Login</Link>
                </nav>
            )}

            {/* Desktop User + Cart */}
            <div className="w-[200px] hidden md:flex justify-center items-center gap-4 mt-4 pr-4">
                <FaRegUser className="text-2xl cursor-pointer" />

                {isLoggedIn ? (
                    <button onClick={handleLogout} className="text-md font-semibold text-red-600">Logout</button>
                ) : (
                    <Link to="/login" className="text-md font-semibold text-blue-600">Login</Link>
                )}
            </div>

            {/* Mobile Side Drawer */}
            <div
                className={`fixed inset-0 bg-black/60 md:hidden transition-opacity duration-300 ${
                    sideDrawerOpened ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => setSideDrawerOpened(false)}
            >
                <aside
                    className={`w-[280px] bg-white h-full shadow-xl transform transition-transform duration-300 ${
                        sideDrawerOpened ? "translate-x-0" : "-translate-x-full"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drawer Header */}
          
                    <div className="h-[80px] shadow flex items-center px-4">
                        <GiHamburgerMenu
                            className="text-3xl cursor-pointer"
                            onClick={() => setSideDrawerOpened(false)}
                      />
                        <img
                            src="/LogoTSDF.png"
                            alt="Logo"
                            className="w-[60px] h-[60px] object-cover ml-auto cursor-pointer"
                            onClick={() => navigate("/")}
                        />
                    </div>
                    <div>
                        <p className="text-lg font-bold ml-4 mt-4">Hello {user ? user.name : "Guest"}!</p>
                    </div>

                  {/* Drawer Nav */}
                  {isLoggedIn ? (
                      <nav className="flex flex-col items-start px-6 gap-4 mt-6">
                          <Link to="/"         className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Home</Link>
                          <Link to="/gallery" className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Gallery</Link>
                          <Link to="/about"    className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>About</Link>
                          <Link to="/contact"  className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Contact</Link>
                          <Link to="/profile"   className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Profile</Link>
                          <Link to="/membership" className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Membership Fee</Link>
                          <Link to="/loan"      className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Loan</Link>
                          <Link to="/apply-loan"      className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Apply Loan</Link>
                          <Link to="/constitution"      className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Constitution</Link>
                      </nav>        
                  ) : (
                      <nav className="flex flex-col items-start px-6 gap-4 mt-6">
                          <Link to="/"         className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Home</Link>
                          <Link to="/gallery" className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Gallery</Link>
                          <Link to="/about"    className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>About</Link>
                          <Link to="/contact"  className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Contact</Link>
                      </nav>
                    )}
                    <div className="flex flex-col items-start px-6 gap-4 mt-6">
                    {isLoggedIn ? (
                      <button onClick={handleLogout} className="text-lg font-bold text-red-600">
                          Logout
                      </button>
                    ) : (
                      <Link to="/login" className="text-lg font-bold text-blue-600">
                          Login
                      </Link>
                    )}
                    </div>
                </aside>
            </div>
        </header>
    );
}
