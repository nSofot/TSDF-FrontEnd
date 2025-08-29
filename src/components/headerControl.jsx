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
            <nav className="flex-1 hidden md:flex justify-center items-center">
                <Link to="/control/"                    className="text-lg font-bold mx-3 hover:underline">Home</Link>
                <Link to="/control/members"     className="text-lg font-bold mx-3 hover:underline">Members</Link>
                <Link to="/control/apply-loan"     className="text-lg font-bold mx-3 hover:underline">Apply Loan</Link>
                <Link to="/control/grant-loan"  className="text-lg font-bold mx-3 hover:underline">Grant Loan</Link>
                <Link to="/contact"             className="text-lg font-bold mx-3 hover:underline">Shares</Link>
            </nav>

            {/* Desktop User + Cart */}
            <div className="w-[50px] hidden md:flex flex-col items-center p-4 mr-4">
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

                    {/* Drawer Nav */}
                    <nav className="flex flex-col items-start px-6 gap-4 mt-6">
                        <Link to="/control/"                    className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Home</Link>
                        <Link to="/control/members"     className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Members</Link>
                        <Link to="/control/apply-loan"     className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Apply Loan</Link>
                        <Link to="/control/grant-loan"  className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Grant Loan</Link>
                        <Link to="/contact"             className="text-lg font-bold" onClick={() => setSideDrawerOpened(false)}>Shares</Link>

                        {isLoggedIn ? (
                        <button onClick={handleLogout} className="text-lg font-bold text-red-600 mt-2">
                            Logout
                        </button>
                        ) : (
                        <Link to="/login" className="text-lg font-bold text-blue-600 mt-2">
                            Login
                        </Link>
                        )}
                    </nav>
                </aside>
            </div>
        </header>
    );
}
