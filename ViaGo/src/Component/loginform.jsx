import { useState } from "react";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto mt-10 px-4">
      
      {/* Title */}
      <h1 className="text-3xl font-bold text-center text-black">ViaGo</h1>
      <p className="text-center text-gray-600 mt-1 mb-8">Welcome back</p>

      {/* Mobile or Email */}
      <label className="text-sm font-medium text-black">Mobile Number or Email</label>
      <input
        type="text"
        placeholder="Enter your mobile or email"
        className="w-full mt-1 mb-4 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
      />

      {/* Password */}
      <label className="text-sm font-medium text-black">Password</label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          className="w-full mt-1 mb-2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none"
        />
        <span
          className="absolute right-3 top-4 text-gray-500 cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          👁
        </span>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end">
        <a href="#" className="text-green-600 text-sm font-medium">
          Forgot Password?
        </a>
      </div>

      {/* Sign In Button */}
      <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold mt-6 hover:bg-green-700 transition">
        Sign In
      </button>

      {/* Divider */}
      <div className="flex items-center my-6">
        <div className="flex-grow border-t"></div>
        <span className="mx-3 text-gray-500">OR</span>
        <div className="flex-grow border-t"></div>
      </div>

      {/* Google Login */}
      <button className="w-full border py-3 rounded-lg flex justify-center items-center gap-2 hover:bg-gray-50 transition">
        <span>⚡</span> Continue with Google
      </button>

      {/* Signup Link */}
      <p className="text-center text-sm mt-6">
        New to ViaGo?{" "}
        <a href="#" className="text-green-600 font-semibold">
          Sign up
        </a>
      </p>
    </div>
  );
}
