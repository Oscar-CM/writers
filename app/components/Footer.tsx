"use client";

import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-32 bg-gradient-to-t from-gray-900 via-black to-gray-900 text-gray-300 py-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

        {/* Company - always visible */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#about" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">About Us</a></li>
            <li><a href="#features" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Features</a></li>
            <li><a href="#pricing" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Pricing</a></li>
            <li><a href="/contact" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Contact</a></li>
          </ul>
        </div>

        {/* Product & Support - hide on mobile */}
        <div className="hidden sm:block">
          <h4 className="text-lg font-semibold mb-4 text-white">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/login" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Log In</a></li>
            <li><a href="/signup" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Create Account</a></li>
            <li><a href="/dashboard" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Dashboard</a></li>
            <li><a href="/community" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Community</a></li>
          </ul>
        </div>

        <div className="hidden sm:block">
          <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/faq" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">FAQ</a></li>
            <li><a href="/help" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Help Center</a></li>
            <li><a href="/feedback" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Feedback</a></li>
            <li><a href="/guides" className="hover:text-[#FF7A00] transition-all duration-300 transform hover:translate-x-1">Guides</a></li>
          </ul>
        </div>

        {/* Newsletter + Social */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Stay Updated</h4>
          <p className="text-sm mb-4 hidden sm:block">Subscribe to our newsletter for tips and updates.</p>
          <div className="flex mb-4">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-2 rounded-l-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] bg-gray-800 text-white text-sm"
            />
            <button className="px-3 py-2 bg-[#FF7A00] rounded-r-lg hover:bg-[#E56700] transition text-sm">Subscribe</button>
          </div>
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-[#FF7A00] transition"><Facebook className="w-5 h-5" /></a>
            <a href="#" className="hover:text-[#FF7A00] transition"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-[#FF7A00] transition"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-[#FF7A00] transition"><Linkedin className="w-5 h-5" /></a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-14 border-t border-gray-700"></div>

      {/* Footer Bottom */}
      <div className="text-center mt-10 text-gray-400 text-sm space-y-1">
        <p>
          © {new Date().getFullYear()} WriteMaster — All Rights Reserved.
        </p>
        <p>
          Created by <span className="font-semibold text-[#FF7A00]">Carmen Oskie</span> in Washington.
        </p>
      </div>
    </footer>
  );
}
