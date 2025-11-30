"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ExtrasSection() {
  const [search, setSearch] = useState("");

  const numbers = [
    { country: "USA", provider: "AT&T", price: 800, number: "Random" },
    { country: "UK", provider: "Vodafone", price: 700, number: "Random" },
    { country: "Canada", provider: "Rogers", price: 750, number: "Random" },
    { country: "Australia", provider: "Telstra", price: 900, number: "Random" },
    { country: "Germany", provider: "T-Mobile", price: 850, number: "Random" },
  ];

  const filtered = numbers.filter((item) =>
    item.country.toLowerCase().includes(search.toLowerCase()) ||
    item.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">International Phone Numbers for Sale</h2>

      {/* Contact Info */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-green-900 shadow">
        For purchases or inquiries, contact us anytime on WhatsApp:
        <br />
        <strong>UK:</strong> +44 7658 889 87 &nbsp; | &nbsp;
        <strong>Kenya:</strong> +254 722 808 825
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by country or provider..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg mb-4"
      />

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-5 bg-white border rounded-xl shadow hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900">{item.country}</h3>
            <p className="text-gray-600">Provider: {item.provider}</p>
            <p className="font-mono text-gray-700 mt-1">{item.number}</p>
            <p className="text-[#FF7A00] text-xl font-bold mt-3">KES {item.price}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
