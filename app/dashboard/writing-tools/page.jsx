"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function WritingToolsSection() {
  const [search, setSearch] = useState("");

  const tools = [
    { name: "ChatGPT Premium (Shared)", price: 500 },
    { name: "ChatGPT Teams Personal", price: 1500 },
    { name: "ChatGPT Whole Workspace", price: 2500 },

    { name: "Turnitin Shared", price: 500 },
    { name: "Turnitin Personal (Multiple Devices)", price: 1500 },
    { name: "Turnitin Personal (Single Device)", price: 1250 },

    { name: "Stealthwriter Basic", price: 1000 },
    { name: "Stealthwriter Premium", price: 2000 },

    { name: "Surfshark VPN", price: 500 },
    { name: "ExpressVPN", price: 500 },
    { name: "NordVPN", price: 500 },
    { name: "Mullvad VPN", price: 800 },
    { name: "Windscribe VPN", price: 500 },

    { name: "Grammarly", price: 150 },
    { name: "AI & Plagiarism Reports", price: 50 },
    { name: "QuillBot", price: 250 }
  ];

  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Writing Tools & Monthly Offers</h2>

      {/* WhatsApp Contact Banner */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-green-900 shadow">
        Contact us on WhatsApp to place your order anytime:<br />
        <strong>UK:</strong> +44 7658 889 87 &nbsp; | &nbsp;
        <strong>Kenya:</strong> +254 722 808 825
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search tools..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg"
      />

      <p className="text-gray-700 bg-amber-50 border border-amber-200 p-4 rounded-xl">
        🌹 All tools are monthly offers. Best service ever — guaranteed reliability and fast delivery.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-5 bg-white border rounded-xl shadow hover:shadow-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
            <p className="text-[#FF7A00] text-xl font-bold mt-2">KES {tool.price}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
