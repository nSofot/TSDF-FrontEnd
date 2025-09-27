import axios from "axios";
import { u } from "framer-motion/client";
import { use, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ForgetPasswordPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  async function sendOtp() {
    if ( !mobile && !userId) {
      toast.error("Please submit a valid user ID, email and mobile number");
      return;
    }
    // if (!email) {
    //   setEmail('nihalranathunge@gmail.com');
    // }
    // try {
    //   const res = await axios.post(
    //     `${import.meta.env.VITE_BACKEND_URL}/api/user/send-OTP`,
    //     { email, userId, mobile }
    //   );
      setOtpSent(true);
    //   toast.success("OTP sent to your email. Check your inbox.");
    //   console.log(res.data);
    // } catch (err) {
    //   toast.error("Email not found");
    // }
  }

  async function verifyOtp() {
    if (!userId) {
      toast.error("User ID is required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const otpNumber = parseInt(otp.trim(), 10);
    if (isNaN(otpNumber)) {
      toast.error("Please enter a valid numeric OTP");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password`,
        { email, userId, newPassword }
      );
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    }
  }

  function handleResend() {
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpSent(false);
  }

  return (
    <div className="min-h-screen w-full bg-[url('/login-background.jpg')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl w-full">

        {/* Forms */}
        <div className="w-full md:w-1/2 p-6 md:p-10 backdrop-blur-md bg-white/40 rounded-2xl shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-6 text-center">
            {otpSent ? "Reset Password" : "Forgot Password"}
          </h2>
          {!otpSent ? (
            <>
              <input
                type="text"
                placeholder="Enter your user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full h-12 px-4 mb-6 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="mobile"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full h-12 px-4 mb-6 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 mb-6 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />

              <button
                onClick={sendOtp}
                className="w-full h-12 text-white font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg transition"
              >
                Send OTP
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full h-12 px-4 mb-4 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="text"
                placeholder="Enter your user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full h-12 px-4 mb-6 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 px-4 mb-4 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 px-4 mb-6 rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={verifyOtp}
                className="w-full h-12 text-white font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg mb-4 transition"
              >
                Reset Password
              </button>

              <button
                onClick={handleResend}
                className="w-full h-12 text-purple-700 font-semibold border border-purple-600 hover:bg-purple-700 hover:text-white rounded-lg transition"
              >
                Resend OTP
              </button>
            </>
          )}
       
        </div>
      </div>
    </div>
  );
}
