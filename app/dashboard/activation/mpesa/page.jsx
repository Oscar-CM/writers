"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../utils/supabaseClient";
import { Loader2 } from "lucide-react";

export default function MpesaStkPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  // Amounts
  const usdAmount = 5;
  const kesConversionRate = 140; 
  const kesAmount = usdAmount * kesConversionRate;
  const displayAmount = `${usdAmount}$ (~${kesAmount} KES)`;

  const initiatePayment = async () => {
    if (!/^254\d{9}$/.test(phone)) {
      setMessage("❌ Enter a valid phone number starting with 254.");
      return;
    }

    setLoading(true);
    setMessage(`💳 Sending STK push for ${displayAmount}...`);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage("❌ User not logged in.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/megapay/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: kesAmount,
          reference: "Account Activation",
          user_id: session.user.id,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!data.success) {
        setMessage("❌ STK push failed. Check your number and try again.");
        return;
      }

      setMessage(`✅ STK push sent! You are paying ${displayAmount}. Check your phone to complete payment.`);

      if (data.transaction_request_id) {
        const interval = setInterval(async () => {
          try {
            const verifyRes = await fetch("/api/megapay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transaction_request_id: data.transaction_request_id }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.status === "COMPLETED" || verifyData.status === "SUCCESS") {
              clearInterval(interval);

              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return setMessage("❌ User not logged in.");

              const { error } = await supabase
                .from("profiles")
                .update({ activated: true })
                .eq("user_id", session.user.id);

              if (error) {
                setMessage("⚠ Payment confirmed, but activation failed. Contact support.");
                console.error(error);
                return;
              }

              setMessage(`🎉 Payment confirmed! Redirecting...`);
              setRedirecting(true);
              setTimeout(() => router.push("/dashboard/manual-activation"), 3000);
            } else {
              setMessage(`⏳ Waiting for payment confirmation... You will pay ${displayAmount}`);
            }
          } catch (err) {
            console.error("Verification error:", err);
            setMessage("❌ Verification error: " + err.message);
          }
        }, 5000);
      }

    } catch (err) {
      console.error(err);
      setMessage("❌ An error occurred: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-6 sm:py-12 lg:py-10">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
          Activate Your Account
        </h1>

        <p className="text-center text-gray-700 dark:text-gray-300">
          Amount to pay: <span className="font-bold">{displayAmount}</span>
        </p>

        <input
          type="tel"
          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          placeholder="2547XXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={redirecting}
        />

        <button
          onClick={initiatePayment}
          disabled={loading || redirecting}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 flex justify-center items-center gap-2 transition"
        >
          {loading ? <Loader2 className="animate-spin" /> : redirecting ? "Redirecting…" : "Send STK Push"}
        </button>

        {message && (
          <p
            className={`text-center p-3 rounded-lg ${
              message.startsWith("✅") || message.startsWith("🎉")
                ? "bg-green-100 text-green-800 border border-green-300"
                : message.startsWith("⏳")
                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                : "bg-red-100 text-red-800 border border-red-300"
            } transition`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
