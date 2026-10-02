import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import toast from "react-hot-toast";

import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const RegistrationPage = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { registerMember, loginMember } = useAuthStore();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const resetForm = () => {
    setForm({ firstName: "", lastName: "", email: "", password: "" });
    setShowPassword(false);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return; // Stop the function from proceeding
    }

    setIsSubmitting(true);
    try {
      if (mode === "register") {
        const registrationResponse = await registerMember({
          user_name: `${form.firstName} ${form.lastName}`,
          user_password: form.password,
          user_email: form.email,
        });

        if (registrationResponse.success) {
          toast.success("Member registered successfully, Please login");
          setMode("login");

          setForm((f) => ({ ...f, password: "" }));
        }
      } else {
        const response = await loginMember({
          user_email: form.email,
          user_password: form.password,
        });

        if (response.success) {
          toast.success("Welcome, to Red-Network");

          onClose?.();
          resetForm();

          navigate("/dashboard");
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message;

      if (errorMsg) {
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-7 z-40 rounded-3xl overflow-hidden pointer-events-none">
      {/* <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
        onClick={onClose}
      /> */}

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              // Removed the stark white border, darkened the background, and widened the container
              className="pointer-events-auto relative w-full max-w-175 rounded-4xl bg-[#1a1a1a]/60 backdrop-blur-2xl shadow-2xl p-20"
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                {mode === "register" ? "Join The Network" : "Welcome Back"}
                <span className="text-[#de425b]">.</span>
              </h2>
              <p className="mt-1 text-sm text-gray-300 font-medium">
                {mode === "register" ? "Register as a gang member to get access." : "Login to manage your gang."}
              </p>

              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, x: mode === "register" ? -12 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: mode === "register" ? 12 : -12 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  onSubmit={handleSubmit}
                  className="mt-8 space-y-4 w-full"
                >
                  {mode === "register" && (
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={form.firstName}
                          onChange={handleChange("firstName")}
                          placeholder="First name"
                          // Removed borders, applied a subtle dark overlay for the input background
                          className="w-full rounded-xl bg-black/40 pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
                        />
                      </div>
                      <div className="relative flex-1">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={form.lastName}
                          onChange={handleChange("lastName")}
                          placeholder="Last name"
                          className="w-full rounded-xl bg-black/40 pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div className="relative w-full">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="Email address"
                      className="w-full rounded-xl bg-black/40 pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
                    />
                  </div>

                  <div className="relative w-full">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={handleChange("password")}
                      placeholder="Password at 6 characters long"
                      className="w-full rounded-xl bg-black/40 pl-11 pr-11 py-3.5 text-sm font-medium text-white placeholder:text-gray-400 outline-none focus:bg-black/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-full bg-[#de425b] text-white text-sm font-bold py-4 mt-6 hover:bg-[#c83850] disabled:opacity-60 transition-colors"
                  >
                    {isSubmitting ? "Processing..." : mode === "register" ? "Create Account" : "Log In"}
                  </motion.button>
                </motion.form>
              </AnimatePresence>

              <p className="mt-6 text-center text-xs font-medium text-gray-300">
                {mode === "register" ? (
                  <>
                    Already a member?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-[#de425b] font-bold hover:underline ml-1"
                    >
                      Log In
                    </button>
                  </>
                ) : (
                  <>
                    New here?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-[#de425b] font-bold hover:underline ml-1"
                    >
                      Register
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegistrationPage;
