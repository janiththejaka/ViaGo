import { useState } from "react";


export default function LoginForm() {
const [form, setForm] = useState({ email: "", password: "" });


return (
<div className="w-full max-w-sm mx-auto p-4">
<h2 className="text-2xl font-semibold text-black mb-4 text-center">Login</h2>
<form className="flex flex-col gap-4">
<input
type="email"
placeholder="Email"
className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#00aa00]"
value={form.email}
onChange={(e) => setForm({ ...form, email: e.target.value })}
/>


<input
type="password"
placeholder="Password"
className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-[#00aa00]"
value={form.password}
onChange={(e) => setForm({ ...form, password: e.target.value })}
/>


<button
type="button"
className="w-full p-3 bg-[#00aa00] text-white rounded-md font-medium active:scale-95"
>
Login
</button>
</form>
</div>
);
}