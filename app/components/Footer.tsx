"use client";

export default function Footer() {
  return (
    <footer className="
      mt-32 
      bg-gradient-to-b from-gray-900 via-black to-gray-900 
      text-gray-300 
      border-t border-gray-700 
      py-16
    ">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">

        {/* Company */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#about" className="hover:text-[#FF7A00] transition">About Us</a></li>
            <li><a href="#features" className="hover:text-[#FF7A00] transition">Features</a></li>
            <li><a href="#pricing" className="hover:text-[#FF7A00] transition">Pricing</a></li>
            <li><a href="/contact" className="hover:text-[#FF7A00] transition">Contact</a></li>
          </ul>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/login" className="hover:text-[#FF7A00] transition">Log In</a></li>
            <li><a href="/signup" className="hover:text-[#FF7A00] transition">Create Account</a></li>
            <li><a href="/dashboard" className="hover:text-[#FF7A00] transition">Dashboard</a></li>
            <li><a href="/community" className="hover:text-[#FF7A00] transition">Community</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/faq" className="hover:text-[#FF7A00] transition">FAQ</a></li>
            <li><a href="/help" className="hover:text-[#FF7A00] transition">Help Center</a></li>
            <li><a href="/feedback" className="hover:text-[#FF7A00] transition">Feedback</a></li>
            <li><a href="/guides" className="hover:text-[#FF7A00] transition">Guides</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/terms" className="hover:text-[#FF7A00] transition">Terms of Service</a></li>
            <li><a href="/privacy" className="hover:text-[#FF7A00] transition">Privacy Policy</a></li>
            <li><a href="/cookies" className="hover:text-[#FF7A00] transition">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-14 border-t border-gray-700"></div>

      {/* Footer Bottom */}
      <div className="text-center mt-10 text-gray-400 text-sm">
        <p className="mb-2">
          © {new Date().getFullYear()} WriteMaster — All Rights Reserved.
        </p>
        <p>
          Created by{" "}
          <span className="font-semibold text-[#FF7A00]">
            Carmen Oskie
          </span>{" "}
          in Washington.
        </p>
      </div>
    </footer>
  );
}
