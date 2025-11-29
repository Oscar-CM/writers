// WriteMaster Landing Page with Dark Mode, Framer Motion, and Custom SVG Logo
// NOTE: This is a full Next.js page.
// You must install the following:
// npm install framer-motion next-themes

"use client"


import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#FFF8F3] dark:bg-[#0D0D0D] text-[#1A1A1A] dark:text-white transition-colors duration-500">

      {/* Navbar */}
      <header className="w-full px-8 py-6 flex justify-between items-center">
        {/* Custom Logo */}
        <div className="flex items-center space-x-2">
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" stroke="#FF7A00" strokeWidth="4" />
            <path d="M30 65 L70 35" stroke="#FF7A00" strokeWidth="6" strokeLinecap="round" />
            <path d="M35 35 L45 45" stroke="#FF7A00" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#FF7A00]">
            WriteMaster
          </h1>
        </div>

        <nav className="space-x-6 hidden md:flex">
          <a href="#features" className="hover:text-[#FF7A00] font-medium">Features</a>
          <a href="#pricing" className="hover:text-[#FF7A00] font-medium">Pricing</a>
          <a href="#about" className="hover:text-[#FF7A00] font-medium">About</a>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="px-3 py-2 rounded-lg border hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <a href="/login" className="font-medium hover:text-[#FF7A00]">Log In</a>
          <a
            href="/signup"
            className="px-4 py-2 bg-[#FF7A00] text-white rounded-lg hover:bg-[#E56700] transition shadow-md"
          >
            Sign Up
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 mt-20 md:mt-28 max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight"
        >
          Master the Art of Writing in the Age of <span className="text-[#FF7A00]">AI</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg text-[#333] dark:text-gray-300 max-w-2xl mx-auto mt-6 p-4 rounded-xl"
        >
          WriteMaster helps you sharpen your creativity, develop your writing voice,
          and use AI responsibly and powerfully as your creative assistant.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 space-x-4"
        >
          <a
            href="/signup"
            className="px-8 py-4 bg-[#FF7A00] text-white text-lg rounded-xl hover:bg-[#E56700] transition shadow-xl"
          >
            Start Learning
          </a>

          <a
            href="#about"
            className="px-8 py-4 border border-gray-700 dark:border-gray-300 text-lg rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Explore More
          </a>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 mt-32 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-14">What WriteMaster Teaches You</h3>

        <div className="grid md:grid-cols-3 gap-10">
          {["AI Collaboration", "Modern Writing Skills", "Writer Community"].map((title, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="p-6 bg-white/85 dark:bg-white/10 border rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <h4 className="text-2xl font-semibold text-[#FF7A00] mb-3">{title}</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {i === 0 && "Learn to guide AI tools effectively without losing your originality or personal writing style."}
                {i === 1 && "Storytelling, structure, clarity, engagement — master techniques used by top writers today."}
                {i === 2 && "Join a private hub of writers growing together in creativity and modern writing."}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-8 mt-32 text-center">
        <h3 className="text-4xl font-bold">Activation Fee</h3>

        <p className="text-gray-700 dark:text-gray-300 mt-3 max-w-xl mx-auto p-4 rounded-xl">
          Pay once, unlock your lifetime learning journey inside WriteMaster.
        </p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mt-10 inline-block px-12 py-10 rounded-3xl shadow-2xl bg-white/90 dark:bg-white/10 border"
        >
          <h4 className="text-6xl font-extrabold mb-4 text-[#FF7A00]">$5</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-6">One-time activation</p>

          <a
            href="/signup"
            className="px-10 py-4 bg-[#FF7A00] text-white rounded-xl text-lg hover:bg-[#E56700] shadow-lg"
          >
            Create Account
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-32 py-10 text-center text-gray-800 dark:text-gray-300">
        © {new Date().getFullYear()} WriteMaster — All Rights Reserved.
      </footer>
    </div>
  );
}
