"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabaseClient";
import { Loader2, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MpesaSTKPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [userId, setUserId] = useState(null);

  const kesAmount = 5 * 140; // Convert $5 to KES

  // Load logged in user ID
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      setUserId(session.user.id);
    };

    loadUser();
  }, [router]);

  const startSTKPush = async () => {
    setMessage("");
    setMessageType("");

    if (!/^07\d{8}$/.test(phone)) {
      setMessage("Enter a valid Safaricom number e.g. 0712345678");
      setMessageType("error");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/mpesa-stk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        amount: kesAmount,
        user_id: userId,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setMessage("STK Push failed. Check number and try again.");
      setMessageType("error");
      return;
    }

    setMessage("STK Push sent! Check your phone to complete payment.");
    setMessageType("success");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
        
        <div className="text-center mb-6">
          <Smartphone size={50} className="mx-auto text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">M-Pesa STK Push</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Pay <span className="font-bold">KES {kesAmount}</span> to activate your account.
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-center mb-4 ${
              messageType === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* PHONE INPUT */}
        <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
          M-Pesa Phone Number
        </label>
        <input
          type="tel"
          placeholder="0712345678"
          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 mb-4"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* BUTTON */}
        <button
          onClick={startSTKPush}
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Pay with M-Pesa (STK Push)"}
        </button>
      </div>
    </div>
  );
}
