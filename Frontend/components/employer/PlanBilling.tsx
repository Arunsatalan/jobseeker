"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  Crown,
  Zap,
  CreditCard,
  Download,
  Briefcase,
  Users,
  Coins,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface PlanBillingProps {
  company: any;
  onUpgrade: () => void;
}

export function PlanBilling({ company: initialCompany, onUpgrade }: PlanBillingProps) {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<any>(null);
  const [buyCreditsAmount, setBuyCreditsAmount] = useState(10);
  const [processingPayment, setProcessingPayment] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiUrl}/api/v1/billing/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBillingData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch billing data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async () => {
    if (buyCreditsAmount <= 0) return;
    setProcessingPayment(true);
    try {
      const token = localStorage.getItem('token');
      // paymentId would come from Stripe/Payment Gateway in real impl
      await axios.post(`${apiUrl}/api/v1/billing/add-credits`,
        { amount: buyCreditsAmount, packageId: 'custom' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Credits added successfully!");
      fetchBillingData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePlanUpgrade = async (planName: string) => {
    if (planName === billingData?.subscription?.plan) return;
    setProcessingPayment(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/v1/billing/upgrade`,
        { plan: planName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Upgraded to ${planName} successfully!`);
      fetchBillingData();
      onUpgrade(); // Trigger parent refresh if needed
    } catch (error: any) {
      toast.error("Upgrade failed");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) return <div>Loading billing information...</div>;
  if (!billingData) return <div>Failed to load billing info.</div>;

  const currentPlan = billingData.subscription.plan;
  const credits = billingData.subscription.credits;
  const isFree = currentPlan === 'free' || currentPlan === 'Free';

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Starter kit",
      features: ["1 Job Post Limit", "Dashboard Access Only", "Pay-per-use credits"],
      color: "gray",
      icon: Briefcase,
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "For growing teams",
      features: ["Unlimited Job Posts", "Full Access (ATS, Analytics)", "Priority Support"],
      color: "blue",
      icon: Crown,
      popular: true,
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan & Credits</h1>
          <p className="text-gray-600">Manage your subscription and credit balance</p>
        </div>
      </div>

      {/* Credit Balance Card */}
      <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Coins className="h-8 w-8 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-300 font-medium mb-1">Available Credits</p>
              <h2 className="text-4xl font-bold text-white">{credits.toFixed(2)}</h2>
              <p className="text-sm text-slate-400 mt-1">
                1 Credit ≈ 3 Job Posts or 50 Applications
              </p>
            </div>
          </div>

          <div className="hidden md:block">
            {/* Placeholder for future specific purchase widgets or just decoration */}
            <div className="text-right">
              <p className="text-slate-400 text-sm">Need more? Upgrade your plan.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          Subscription Plans
          {isFree && <Badge variant="destructive" className="ml-2">Upgrade Recommended</Badge>}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.name === currentPlan || (plan.name === 'Free' && isFree);
            const isPro = plan.name === 'Professional';

            return (
              <Card
                key={plan.name}
                className={`relative p-6 transition-all ${isPro && !isCurrent ? 'border-2 border-blue-500 shadow-lg scale-105 z-10' : 'border border-gray-200'
                  } ${isCurrent ? "bg-slate-50" : "bg-white"}`}
              >
                {isPro && !isCurrent && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                    Recommended
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <Icon className={`h-12 w-12 mx-auto mb-4 ${isPro ? 'text-blue-600' : 'text-gray-600'}`} />
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="text-3xl font-bold mt-2 mb-1">{plan.price}</div>
                  <p className="text-gray-500 text-sm">{plan.period}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-green-500" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || processingPayment}
                  onClick={() => handlePlanUpgrade(plan.name)}
                >
                  {isCurrent ? "Current Plan" : processingPayment ? "Processing..." : "Upgrade"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Usage History (Mock for now, could fetch transactions) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
          Transaction history will appear here.
        </div>
      </Card>
    </div>
  );
}