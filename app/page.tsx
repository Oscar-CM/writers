"use client";

import { motion } from "framer-motion";
import JoinUsSection from "./components/JoinUsSection";
import FAQSection from "./components/Faq";
import Footer from "./components/Footer";
import { useState } from "react";
import Testimonials from "./components/Testimonials";


export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">

      {/* Sticky Header */}
    <header className="sticky top-0 z-50 w-full bg-black/30 backdrop-blur-sm transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center space-x-3">
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            WriteMaster
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-lg font-medium">
          <a href="#features" className="text-white hover:text-[#FF7A00] transition-colors duration-300">Features</a>
          <a href="#about" className="text-white hover:text-[#FF7A00] transition-colors duration-300">About</a>
          <a href="/login" className="text-white hover:text-[#FF7A00] transition-colors duration-300">Log In</a>
          <a
            href="/signup"
            className="px-4 py-2 bg-[#FF7A00] text-white rounded-lg hover:bg-[#E56700] shadow-md transition"
          >
            Sign Up
          </a>
        </nav>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href="/signup"
            className="px-3 py-2 bg-[#FF7A00] text-white rounded-lg text-sm"
          >
            Sign Up
          </a>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white text-2xl focus:outline-none"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/70 backdrop-blur-sm w-full px-6 py-4 flex flex-col gap-4"
        >
          <a href="#features" className="text-white hover:text-[#FF7A00] transition-colors duration-300">Features</a>
          <a href="#about" className="text-white hover:text-[#FF7A00] transition-colors duration-300">About</a>
          <a href="/login" className="text-white hover:text-[#FF7A00] transition-colors duration-300">Log In</a>
        </motion.nav>
      )}
    </header>


      {/* Hero Section */}
      <section
        className="relative w-full h-[80vh] sm:h-[90vh] md:h-[100vh] flex flex-col justify-center items-center text-center px-6 sm:px-8 md:px-12"
        style={{
          backgroundImage: "url('/ai.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight">
            Master the Art of Writing in the Age of <span className="text-[#FF7A00]">AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/90 p-4 rounded-xl bg-black/30">
            WriteMaster helps you sharpen your creativity, use AI responsibly and powerfully, and
            ensure you get well-paying jobs.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-[#FF7A00] text-white text-lg rounded-xl hover:bg-[#E56700] shadow-xl transition transform hover:scale-105"
            >
              Join Us
            </a>

            <a
              href="#about"
              className="w-full sm:w-auto px-8 py-4 border border-white text-lg rounded-xl hover:bg-white/20 transition transform hover:scale-105"
            >
              Explore More
            </a>
          </div>
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

      <div id="about">
        <JoinUsSection />
      </div>
      <Testimonials/>

      <FAQSection />

      <Footer />

    </div>
  );
}
