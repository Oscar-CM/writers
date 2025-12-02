"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WritingToolsSection() {
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState("oscarcheruiyot3@gmail.com");
  const [tools, setTools] = useState([
    { name: "ChatGPT Premium (Shared)", price: 500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "ChatGPT Teams Personal", price: 1500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "ChatGPT Whole Workspace", price: 2500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Turnitin Shared", price: 500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Turnitin Personal (Multiple Devices)", price: 1500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Turnitin Personal (Single Device)", price: 1250, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Stealthwriter Basic", price: 1000, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Stealthwriter Premium", price: 2000, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Surfshark VPN", price: 500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "ExpressVPN", price: 500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "NordVPN", price: 500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Mullvad VPN", price: 800, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Windscribe VPN", price: 500, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "Grammarly", price: 150, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "AI & Plagiarism Reports", price: 50, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false },
    { name: "QuillBot", price: 250, badge: "", badgeColor: "", badgeTooltip: "", outOfStock: false }
  ]);

  const filteredTools = useMemo(
    () => tools.filter((tool) => tool.name.toLowerCase().includes(search.toLowerCase())),
    [tools, search]
  );

  const sendWhatsApp = (tool) => {
    const message = `Hello, I'm interested in purchasing this tool:\n\n` +
      `🛠️ *${tool.name}*\n` +
      `💰 Price: KES ${tool.price}\n\nPlease share details.`;
    const url = `https://wa.me/254722808825?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleBadgeChange = (tool, value) => {
    const colorMap = {
      "Quick Sale": "bg-orange-500",
      "Black Friday Deal": "bg-purple-600",
      "Almost Out": "bg-red-600",
      "Not Currently Available": "bg-gray-400",
      "Nothing": ""
    };

    const tooltipMap = {
      "Quick Sale": "Hurry! Quick Sale, grab it before it’s gone!",
      "Black Friday Deal": "Limited time Black Friday deal!",
      "Almost Out": "Almost out of stock, act fast!",
      "Not Currently Available": "Currently unavailable, check back later",
      "Nothing": ""
    };

    setTools((prev) =>
      prev.map((t) =>
        t.name === tool.name
          ? {
              ...t,
              badge: value === "Nothing" ? "" : value,
              badgeColor: colorMap[value],
              badgeTooltip: tooltipMap[value],
              outOfStock: value === "Not Currently Available",
            }
          : t
      )
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Writing Tools & Monthly Offers</h2>

      {/* WhatsApp Banner */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-xl text-green-900 shadow text-sm">
        Contact us on WhatsApp to place your order anytime:<br />
        <strong>UK:</strong> +44 7658 889 87 &nbsp; | &nbsp;
        <strong>Kenya:</strong> +254 722 808 825
      </div>

      {/* Search */}
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

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="p-5 bg-white border rounded-xl shadow hover:shadow-lg relative"
          >
            {/* Badge Tooltip */}
            {tool.badge && (
              <div className="absolute top-3 right-3 group">
                <span className={`text-xs text-white px-3 py-1 rounded-full ${tool.badgeColor}`}>
                  {tool.badge}
                </span>
                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-max bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  {tool.badgeTooltip}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
            <p className="text-[#FF7A00] text-xl font-bold mt-2">KES {tool.price}</p>

            {/* Buy Button */}
            <button
              disabled={tool.outOfStock}
              onClick={() => sendWhatsApp(tool)}
              className={`mt-4 w-full py-2 text-white rounded-lg font-semibold ${
                tool.outOfStock
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {tool.outOfStock ? "Not Currently Available" : "Buy"}
            </button>

            {/* Admin Badge Dropdown */}
            {userEmail === "oscarcheruiyot3@gmail.com" && (
              <select
                className="mt-2 w-full px-2 py-1 border rounded-lg text-sm"
                value={tool.badge || "Nothing"}
                onChange={(e) => handleBadgeChange(tool, e.target.value)}
              >
                <option>Nothing</option>
                <option>Quick Sale</option>
                <option>Black Friday Deal</option>
                <option>Almost Out</option>
                <option>Not Currently Available</option>
              </select>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
