import React, { useState } from "react";

export default function Login() {
  const [role, setRole] = useState("user");

  return (


    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-center text-[#10B981] mb-6">ViaGo</h2>
        <p className="text-center text-gray-600 -mt-4 mb-6">Welcome back</p>

        <div className="flex justify-center mb-6 gap-3">
          <button
            className={`${
              role === "user"
                ? "bg-[#00aa00] text-white"
                : "bg-gray-200 text-gray-700"
            } px-4 py-2 rounded-lg w-1/2`}
            onClick={() => setRole("user")}
          >
            User
          </button>

          <button
            className={`${
              role === "rider"
                ? "bg-[#00aa00] text-white"
                : "bg-gray-200 text-gray-700"
            } px-4 py-2 rounded-lg w-1/2`}
            onClick={() => setRole("rider")}
          >
            Rider
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">
              Mobile Number or Email
            </label>
            <input
              name="phomeOremail"
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00aa00] focus:outline-none"
              placeholder="Enter your mobile or email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00aa00] focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#00aa00] text-white py-3 rounded-lg font-semibold hover:bg-[#008800] transition"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        <button className="w-full border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 transition">
          <span>⚡</span> Continue with Google
        </button>

        <p className="text-center text-gray-600 mt-6 text-sm">
          New to ViaGo? <a className="text-[#10B981] font-semibold">Sign up</a>
        </p>
      </div>
    </div>
  );
}