import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);
  const onSubmit = async (e) => {
    e.preventDefault();
    const email = form.email.trim();

    const validEmailPattern =
      /^[^\s@]+@[^\s@]+\.(com|in|edu|org|net|ac\.in|co\.in)$/i;

    if (!validEmailPattern.test(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login({ ...form, email });
      navigate("/");
    } catch (e) {
      if (e.status === 401) {
        setError("Wrong email or password !!");
      } else {
        setError("Something went wrong !!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-2 sm:p-4 space-y-4">
      {/* Sample details card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow w-full max-w-md text-left">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Sample Login Details
        </h3>
        <div className="flex flex-col gap-2 text-gray-700 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium w-20">Email:</span>
            <span>fynvid@gmail.com</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium w-20">Password:</span>
            <span>fynvid7</span>
          </div>
        </div>
      </div>

      {/* Login form */}
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-5"
      >
        <div className="text-2xl sm:text-3xl font-semibold text-gray-900">
          Login
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          Enter email and password.
        </p>
        {error ? (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </div>
        ) : null}
        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
            autoFocus={true}
          />
          <div className="relative">
            <input
              ref={passwordRef}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
              placeholder="Password"
              required
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={loading}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const input = passwordRef.current;
                if (!input) return;
                setShowPassword((prev) => !prev);
                requestAnimationFrame(() => {
                  input.focus();
                  input.setSelectionRange(
                    input.value.length,
                    input.value.length,
                  );
                });
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
        </div>
        <button
          disabled={loading}
          className={`w-full px-4 py-3 rounded-lg text-white flex items-center justify-center gap-2 font-medium text-base transition-all ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gray-900 hover:bg-gray-800 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Logging in...</span>
            </>
          ) : (
            "Login"
          )}
        </button>{" "}
      </form>
    </div>
  );
}
