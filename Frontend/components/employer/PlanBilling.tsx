"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Zap,
  CreditCard,
  Download,
  Calendar,
  Briefcase,
  Users,
  BarChart3,
  Headphones,
  Shield,
  Star,
} from "lucide-react";

interface Company {
  name: string;
  plan: string;
}

interface PlanBillingProps {
  company: Company;
  onUpgrade: () => void;
}

export function PlanBilling({ company, onUpgrade }: PlanBillingProps) {
  const [selectedPlan, setSelectedPlan] = useState(company.plan);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for small businesses starting their hiring journey",
      features: [
        "Up to 3 job posts",
        "Basic applicant tracking",
        "Email support",
        "Standard job posting duration (30 days)",
        "Basic analytics",
      ],
      limitations: [
        "Limited to 50 applications per month",
        "No priority support",
        "Basic branding only",
      ],
      color: "gray",
      icon: Briefcase,
    },
    {
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "Ideal for growing companies with regular hiring needs",
      features: [
        "Unlimited job posts",
        "Advanced ATS features",
        "Priority support",
        "Extended job posting duration (60 days)",
        "Advanced analytics & reporting",
        "Custom branding",
        "Interview scheduling tools",
        "Bulk actions",
        "Team collaboration",
      ],
      color: "blue",
      icon: Users,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$149",
      period: "per month",
      description: "Comprehensive solution for large organizations",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced security features",
        "White-label solution",
        "API access",
        "Advanced reporting & analytics",
        "Multi-location support",
        "Custom workflows",
        "SLA guarantee",
      ],
      color: "purple",
      icon: Crown,
    },
  ];

  const currentUsage = {
    jobPosts: { used: 2, total: company.plan === "Free" ? 3 : "Unlimited" },
    applications: { used: 45, total: company.plan === "Free" ? 50 : "Unlimited" },
    teamMembers: { used: 1, total: company.plan === "Free" ? 1 : "Unlimited" },
  };

  const invoices = [
    {
      id: "INV-001",
      date: "2025-11-15",
      amount: "$49.00",
      status: "Paid",
      plan: "Professional",
    },
    {
      id: "INV-002",
      date: "2025-10-15",
      amount: "$49.00",
      status: "Paid",
      plan: "Professional",
    },
    {
      id: "INV-003",
      date: "2025-09-15",
      amount: "$49.00",
      status: "Paid",
      plan: "Professional",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plan & Billing</h1>
        <p className="text-gray-600">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan Status */}
      <Card className="p-6 bg-linear-to-r from-slate-50 to-amber-50 border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="text-white" style={{ backgroundColor: '#02243b' }}>
                Current Plan
              </Badge>
              <h2 className="text-xl font-semibold">{company.plan}</h2>
              {company.plan === "Professional" && (
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              )}
            </div>
            <p className="text-gray-600">
              {company.plan === "Free" 
                ? "You're on the free plan. Upgrade to unlock more features!" 
                : "Thank you for being a valued subscriber!"
              }
            </p>
            
            {/* Usage Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Job Posts</p>
                <p className="font-semibold">
                  {currentUsage.jobPosts.used} / {currentUsage.jobPosts.total}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Applications</p>
                <p className="font-semibold">
                  {currentUsage.applications.used} / {currentUsage.applications.total}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="font-semibold">
                  {currentUsage.teamMembers.used} / {currentUsage.teamMembers.total}
                </p>
              </div>
            </div>
          </div>
          
          {company.plan === "Free" && (
            <Button onClick={onUpgrade} className="text-white" style={{ backgroundColor: '#02243b' }}>
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          )}
        </div>
      </Card>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.name === company.plan;
            const isProfessional = plan.name === "Professional";
            
            return (
              <Card 
                key={plan.name}
                className={`relative p-6 ${
                  isProfessional 
                    ? "border-2 border-slate-700 shadow-lg scale-105" 
                    : "border border-gray-200"
                } ${isCurrentPlan ? "bg-slate-50" : "bg-white"}`}
              >
                {isProfessional && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-white" style={{ backgroundColor: '#02243b' }}>
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <Icon className={`h-12 w-12 mx-auto mb-4 ${
                    plan.color === "blue" ? "text-slate-700" :
                    plan.color === "purple" ? "text-amber-700" :
                    "text-gray-600"
                  }`} />
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-600 ml-1">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations?.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-3 opacity-60">
                      <div className="h-4 w-4 shrink-0" />
                      <span className="text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full ${
                    isCurrentPlan 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : isProfessional 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  disabled={isCurrentPlan}
                  onClick={() => !isCurrentPlan && onUpgrade()}
                  variant={isProfessional && !isCurrentPlan ? "default" : "outline"}
                >
                  {isCurrentPlan ? "Current Plan" : `Upgrade to ${plan.name}`}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Method & Billing */}
      {company.plan !== "Free" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/27</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
            <Button variant="outline" className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </Card>

          {/* Billing History */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Billing History</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-gray-600">{invoice.date} • {invoice.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{invoice.amount}</p>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Features Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-medium">Features</th>
                <th className="text-center py-3 font-medium">Free</th>
                <th className="text-center py-3 font-medium">Professional</th>
                <th className="text-center py-3 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="py-3">Job Posts</td>
                <td className="text-center py-3">Up to 3</td>
                <td className="text-center py-3">Unlimited</td>
                <td className="text-center py-3">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Applicant Tracking</td>
                <td className="text-center py-3">
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                </td>
                <td className="text-center py-3">
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                </td>
                <td className="text-center py-3">
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Advanced Analytics</td>
                <td className="text-center py-3">—</td>
                <td className="text-center py-3">
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                </td>
                <td className="text-center py-3">
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-3">Priority Support</td>
                <td className="text-center py-3">—</td>
                <td className="text-center py-3">
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                </td>
                <td className="text-center py-3">
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="py-3">Custom Integrations</td>
                <td className="text-center py-3">—</td>
                <td className="text-center py-3">—</td>
                <td className="text-center py-3">
                  <Check className="h-4 w-4 text-green-600 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}