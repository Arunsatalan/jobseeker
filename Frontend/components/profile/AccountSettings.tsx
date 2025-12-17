"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Lock, Bell } from "lucide-react";

interface AccountSettingsProps {
  email: string;
  language: string;
  notificationsEnabled: boolean;
  onEmailChange?: (email: string) => void;
  onLanguageChange?: (language: string) => void;
  onNotificationsChange?: (enabled: boolean) => void;
  onDeleteAccount?: () => void;
}

export function AccountSettings({
  email,
  language,
  notificationsEnabled,
  onEmailChange,
  onLanguageChange,
  onNotificationsChange,
  onDeleteAccount,
}: AccountSettingsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className="p-6 mb-6 bg-white border-0 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-xs font-semibold text-gray-700 mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                defaultValue={email}
                onChange={(e) => onEmailChange?.(e.target.value)}
                className="border-gray-300"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="h-3 w-3" />
                Change Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                className="border-gray-300 mb-2"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                className="border-gray-300"
              />
            </div>

            {/* Language */}
            <div>
              <Label htmlFor="language" className="text-xs font-semibold text-gray-700 mb-2">
                Preferred Language
              </Label>
              <select
                id="language"
                defaultValue={language}
                onChange={(e) => onLanguageChange?.(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="border-t pt-4">
              <Label className="flex items-center justify-between text-sm font-semibold text-gray-900">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Email Notifications
                </span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={onNotificationsChange}
                />
              </Label>
              <p className="text-xs text-gray-600 mt-2">
                Receive updates about job matches and application status
              </p>
            </div>

            {/* Danger Zone */}
            <div className="border-t pt-4 border-red-200 bg-red-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Danger Zone
              </h4>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full sm:w-auto"
              >
                Delete Account
              </Button>
              <p className="text-xs text-red-600 mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <BillingInfo />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete your account? This action cannot be undone.
              All your resumes, job preferences, and saved jobs will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDeleteAccount?.();
                setShowDeleteDialog(false);
              }}
            >
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function BillingInfo() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
        <span className="text-sm font-semibold text-gray-900">Current Plan</span>
        <span className="text-sm font-semibold text-amber-700">Free</span>
      </div>
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
        <span className="text-sm font-semibold text-gray-900">Expiry Date</span>
        <span className="text-sm text-gray-600">-</span>
      </div>
      <Button className="w-full bg-amber-600 hover:bg-amber-700">
        Upgrade to Premium
      </Button>
      <div className="text-xs text-gray-600">
        <p className="font-semibold mb-2">Invoice History</p>
        <p>No invoices yet. Premium upgrades will appear here.</p>
      </div>
    </div>
  );
}
