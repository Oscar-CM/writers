// WriteMaster Landing Page with Dark Mode, Framer Motion, and Responsive Design
// Next.js + TailwindCSS + Framer Motion + next-themes
// Make sure to install: npm install framer-motion next-themes

"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import JoinUsSection from "./components/JoinUsSection";
import FAQSection from "./components/Faq";

export default function Home() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      
      {/* Navbar */}
      <header className="w-full px-6 sm:px-8 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <motion.svg
            width="40"
            height="40"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="50" cy="50" r="48" stroke="#FF7A00" strokeWidth="4" />
            <path d="M30 65 L70 35" stroke="#FF7A00" strokeWidth="6" strokeLinecap="round" />
            <path d="M35 35 L45 45" stroke="#FF7A00" strokeWidth="6" strokeLinecap="round" />
          </motion.svg>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#FF7A00] tracking-tight">
            WriteMaster
          </h1>
        </div>

        {/* Nav Links */}
        <nav className="flex space-x-6 text-lg font-medium mb-4 md:mb-0">
          <a href="#features" className="hover:text-[#FF7A00] transition-colors duration-300">Features</a>
          <a href="#pricing" className="hover:text-[#FF7A00] transition-colors duration-300"></a>
          <a href="#about" className="hover:text-[#FF7A00] transition-colors duration-300">About</a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <a href="/login" className="hover:text-[#FF7A00] transition-colors duration-300">Log In</a>
          <a
            href="/signup"
            className="px-4 py-2 bg-[#FF7A00] text-white rounded-lg hover:bg-[#E56700] shadow-md transition"
          >
            Sign Up
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 sm:px-8 md:px-12 mt-16 md:mt-24 max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight"
        >
          Master the Art of Writing in the Age of <span className="text-[#FF7A00]">AI</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-700 dark:text-gray-300 mt-6 max-w-2xl mx-auto text-lg sm:text-xl p-4 rounded-xl bg-white/80 dark:bg-gray-800/50"
        >
          WriteMaster helps you sharpen your creativity, use AI responsibly and powerfully as your creative assistant and ensure you get well paying jobs.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
        >
          <a
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-[#FF7A00] text-white text-lg rounded-xl hover:bg-[#E56700] shadow-xl transition transform hover:scale-105"
          >
            Join Us
          </a>

          <a
            href="#about"
            className="w-full sm:w-auto px-8 py-4 border border-gray-700 dark:border-gray-300 text-lg rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition transform hover:scale-105"
          >
            Explore More
          </a>
        </motion.div>
      </section>

      {/* Features Section */}
     <section
  id="features"
  className="relative px-6 sm:px-8 md:px-12 mt-24 py-20"
>
  {/* Background Pattern */}
  <div className="absolute inset-0 bg-gray-900">
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }}
    />
  </div>

  {/* Content Wrapper */}
  <div className="relative max-w-6xl mx-auto">
    <h3 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-white">
      What WriteMaster Teaches You
    </h3>

    <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
      {[
        {
          title: "AI Collaboration",
          description:
            "Learn to guide AI tools effectively without losing your originality or personal writing style.",
        },
        {
          title: "Modern Writing Skills",
          description:
            "Storytelling, structure, clarity, engagement — master techniques used by top writers today.",
        },
        {
          title: "Writer Community",
          description:
            "Join a private hub of writers growing together in creativity and modern writing.",
        },
      ].map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
          viewport={{ once: true }}
          className="p-6 bg-gray-800/70 border border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2"
        >
          <h4 className="text-2xl font-semibold text-[#FF7A00] mb-3">
            {feature.title}
          </h4>
          <p className="text-gray-300">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>


     <div id="about"><JoinUsSection/></div> 

      {/* Frequently asked questions */}
      <FAQSection/>
 

      {/* Footer */}
      
    </div>
  );
}
