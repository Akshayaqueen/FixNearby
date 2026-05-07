import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [interacted, setInteracted] = useState({});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ---------------- VALIDATION ----------------

  const validateFields = (name, value) => {
    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/;

    switch (name) {
      case "name":
        if (!value.trim()) return "Username is required";
        break;

      case "email":
        if (!value || !emailRegex.test(value))
          return "Invalid email address";
        break;

      case "password":
        if (value.length < 6)
          return "Use at least 6 characters for a stronger password";
        break;

      default:
        return "";
    }

    return "";
  };

  // ---------------- PASSWORD STRENGTH ----------------

  const getPasswordStrength = (password) => {
    if (password.length < 6) return "Weak";

    if (
      password.match(/(?=.*[A-Z])/) &&
      password.match(/(?=.*[0-9])/)
    ) {
      return "Strong";
    }

    return "Medium";
  };

  const strength = getPasswordStrength(formData.password);

  // ---------------- HANDLE CHANGE ----------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate while typing after interaction
    if (interacted[name]) {
      const errorMsgs = validateFields(name, value);

      setErrors((prev) => ({
        ...prev,
        [name]: errorMsgs,
      }));
    }
  };

  // ---------------- HANDLE BLUR ----------------

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setInteracted((prev) => ({
      ...prev,
      [name]: true,
    }));

    const errorMsgs = validateFields(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsgs,
    }));
  };

  // ---------------- HANDLE SUBMIT ----------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const allInteracted = {};

    Object.keys(formData).forEach((key) => {
      const errorMsg = validateFields(key, formData[key]);

      if (errorMsg) newErrors[key] = errorMsg;

      allInteracted[key] = true;
    });

    setInteracted(allInteracted);

    // Stop submit if errors exist
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setApiError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setApiError(
          data.message ||
            "Registration failed. Please try again."
        );
        return;
      }

      // Auto login after register
      login(data);

      alert("Registration successful! Welcome to FixNearby.");

      navigate("/dashboard");
    } catch {
      setApiError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-md">
        
        {/* Heading */}
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create an account
          </h2>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {apiError}
          </div>
        )}

        {/* Form */}
        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">

            {/* NAME */}
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Full Name"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />

              {interacted.name && errors.name && (
                <div className="mt-1 text-red-700 text-sm">
                  {errors.name}
                </div>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Email address"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />

              {interacted.email && errors.email && (
                <div className="mt-1 text-red-700 text-sm">
                  {errors.email}
                </div>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Password"
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-3 text-sm text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {/* Password Hint */}
              <p className="text-xs text-gray-500 mt-1">
                Use at least 6 characters
              </p>

              {/* Strength Indicator */}
              {formData.password && (
                <p
                  className={`text-sm mt-1 font-medium ${
                    strength === "Weak"
                      ? "text-red-500"
                      : strength === "Medium"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  Password Strength: {strength}
                </p>
              )}

              {/* Password Error */}
              {interacted.password &&
                errors.password && (
                  <div className="mt-1 text-red-700 text-sm">
                    {errors.password}
                  </div>
                )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition font-medium"
          >
            {loading
              ? "Creating your account..."
              : "Create Account"}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;