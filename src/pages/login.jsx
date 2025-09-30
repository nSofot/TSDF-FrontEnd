import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Google OAuth Login
  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
    
      if (!email) {
        toast.error("Email is required");
        return;
      }           
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/login-google`,
          { accessToken: access_token }
        );

        toast.success("Login Successful");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));

        // if (res.data.role === "admin") {
        //     navigate("/admin");
        // } else if (
        //     res.data.role === "chairman" || 
        //     res.data.role === "secretary" || 
        //     res.data.role === "treasurer" || 
        //     res.data.role === "manager") 
        // {
        //     navigate("/control");
        // } else {
            navigate("/");
        // }
      } catch (error) {
          toast.error(error?.response?.data?.message || "Google login failed");
      }
    },
    onError: () => toast.error("Google login failed"),
  });

  // Email/Password Login
  async function handleLogin() {
    if ((!userId || !email) && !password) {
      toast.error("User ID and password are required");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/login`,
        { userId, email, password }
      );

      toast.success("Login Success");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      // if (res.data.memberRole === "admin") {
      //     navigate("/admin");
      // } else if (
      //     res.data.memberRole === "chairman" || 
      //     res.data.memberRole === "secretary" || 
      //     res.data.memberRole === "treasurer" || 
      //     res.data.memberRole === "manager") 
      // {
      //   navigate("/control")
      // } else {
        navigate("/");
      // }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[url('/login-background.jpg')] bg-cover bg-center flex justify-center items-center px-4">
      {/* Login Form */}
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-6 text-center">
          Login
        </h2>

        <div className="flex flex-col space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              placeholder="Enter your User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              or Email
            </label>
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full h-11 text-white font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg transition"
          >
            Login
          </button>

          <button
            onClick={googleLogin}
            className="w-full h-11 flex items-center justify-center gap-3 text-purple-700 font-semibold border border-purple-600 hover:bg-purple-700 hover:text-white active:bg-purple-800 rounded-lg transition"
          >
            <FcGoogle className="text-2xl" />
            <span>Login with Google</span>
          </button>
        </div>

        <div className="flex justify-between items-center text-sm text-blue-700 mt-6">
          {/* <Link to="/register" className="hover:underline">
            Register New Account
          </Link> */}
          <Link to="/forget" className="hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
