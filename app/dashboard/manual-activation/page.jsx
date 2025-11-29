"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";

import {
  CreditCard,
  DollarSign,
  Bitcoin,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function ActivationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");

      const { data } = await supabase
        .from("profiles")
        .select("activated, full_name")
        .eq("user_id", session.user.id)
        .single();

      setProfile(data);
      setStatus(data?.activated ? "active" : "inactive");
    };

    loadProfile();
  }, []);

  const activateAccount = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({ activated: true })
      .eq("user_id", session.user.id);

    if (error) {
      alert("Activation failed. Contact support.");
      setLoading(false);
      return;
    }

    alert("Account Activated Successfully! 🎉");
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Account Activation</h1>

      {/* Status */}
      <div
        className={`p-5 rounded-xl border shadow-sm ${
          status === "active"
            ? "bg-green-50 border-green-500"
            : "bg-red-50 border-red-400"
        }`}
      >
        <div className="flex items-center gap-4">
          {status === "active" ? (
            <CheckCircle size={32} className="text-green-600" />
          ) : (
            <AlertTriangle size={32} className="text-red-600" />
          )}

          <div>
            <p className="text-lg font-bold">
              Status:{" "}
              {status === "active" ? (
                <span className="text-green-600">ACTIVE</span>
              ) : (
                <span className="text-red-600">INACTIVE</span>
              )}
            </p>
            <p className="text-gray-700">{profile?.full_name}</p>
          </div>
        </div>
      </div>

      {status === "active" ? (
        <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-700">
            Your account is already activated. You have full access.
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-gray-800">
            Choose Payment Method ($5 Activation)
          </h2>

          {/* Payment Methods */}
          <div className="space-y-4">

            {/* Stripe */}
            <PaymentCard
              title="Debit/Credit Card (Stripe)"
              icon={<CreditCard size={32} className="text-blue-600" />}
              description="Pay securely using Visa, MasterCard, or American Express."
              button="Pay with Card"
              onClick={() => alert("Stripe Payment Coming Next")}
            />

            {/* PayPal */}
            <PaymentCard
              title="PayPal"
              icon={<DollarSign size={32} className="text-blue-500" />}
              description="Use your PayPal balance or linked cards."
              button="Pay with PayPal"
              onClick={() => alert("PayPal Setup Coming Next")}
            />

            {/* Crypto */}
            <PaymentCard
              title="Cryptocurrency"
              icon={<Bitcoin size={32} className="text-yellow-500" />}
              description="Acceptable: USDT (TRC20), BTC, ETH"
              button="Pay with Crypto"
              onClick={() => alert("Crypto payments coming next")}
            />

            {/* M-Pesa */}
            <PaymentCard
              title="M-Pesa (Kenya)"
              icon={<Smartphone size={32} className="text-green-600" />}
              description="Instant mobile money payment via STK push."
              button="Pay with M-Pesa"
              onClick={() => router.push("/dashboard/activation/mpesa")}

            />

            {/* Flutterwave */}
            <PaymentCard
              title="Flutterwave"
              icon={<Globe size={32} className="text-purple-600" />}
              description="Supports African banks, mobile money & cards."
              button="Pay with Flutterwave"
              onClick={() => alert("Flutterwave Integration Coming Next")}
            />

            {/* Payoneer */}
            <PaymentCard
              title="Payoneer"
              icon={<ArrowRight size={32} className="text-orange-600" />}
              description="Manual invoice payment via Payoneer."
              button="Request Payoneer Invoice"
              onClick={() => alert("Payoneer Option Coming Next")}
            />
          </div>

          {/* Manual Confirmation Button */}
          <button
            onClick={activateAccount}
            disabled={loading}
            className="mt-6 w-full md:w-auto px-6 py-3 bg-[#FF7A00] text-white rounded-xl font-bold hover:bg-[#e96d00] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Confirm Activation Manually"}
          </button>
        </>
      )}
    </div>
  );
}

// ----------------------
// Payment Card Component
// ----------------------
function PaymentCard({ title, icon, description, button, onClick }) {
  return (
    <div className="p-5 rounded-xl bg-white shadow border border-gray-200">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-lg font-bold text-gray-800">{title}</p>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>

      <button
        onClick={onClick}
        className="mt-4 w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
      >
        {button}
      </button>
    </div>
  );
}
