"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../utils/supabaseClient";

export default function MpesaStkPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/megapay/stk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          amount: 700,
          reference: "Account Activation",
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessage("Error: " + data.error);
        setLoading(false);
        return;
      }

      setMessage("STK Push sent! Check your phone...");

      if (data.transaction_request_id) {
        const interval = setInterval(async () => {
          try {
            const verifyRes = await fetch("/api/megapay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transaction_request_id: data.transaction_request_id }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.status === "COMPLETED") {
  clearInterval(interval);

              const { data: { session } } = await supabase.auth.getSession();
              if (!session) {
                setMessage("User not logged in.");
                return;
              }

              const { error } = await supabase
                .from("profiles")
                .update({ activated: true })
                .eq("user_id", session.user.id);

              if (error) {
                setMessage("Payment received but activation failed. Contact support.");
                console.error(error);
                return;
              }

              setMessage("✅ Payment confirmed! Your account is now activated. Redirecting...");
              setRedirecting(true);
              setTimeout(() => {
                router.push("/dashboard/manual-activation"); // Redirect changed here
              }, 3000);
            } else {
              setMessage("Waiting for payment confirmation...");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setMessage("Verification error: " + err.message);
          }
        }, 5000);
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Activate Using M-Pesa STK</h1>

      <input
        className="border p-3 rounded w-full"
        placeholder="2547XXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={redirecting}
      />

      <button
        disabled={loading || redirecting}
        onClick={initiatePayment}
        className="bg-black text-white py-2 rounded w-full"
      >
        {loading ? "Sending STK…" : redirecting ? "Redirecting…" : "Send STK Push"}
      </button>

      {message && <p className="text-center text-gray-700 text-sm mt-2">{message}</p>}
    </div>
  );
}
