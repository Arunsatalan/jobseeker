"use client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { User, Zap } from "lucide-react";

interface UserInfoCardProps {
  user: {
    name: string;
    email: string;
    phone: string;
    accountType: "Free" | "Pro";
    profilePic: string;
  };
  profileCompletion?: number;
}

export function UserInfoCard({ user, profileCompletion = 70 }: UserInfoCardProps) {
  return (
    <Card className="p-6 mb-6 bg-white border-0 shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-20 w-20 border-2 border-amber-700">
            <AvatarImage src={user.profilePic} alt={user.name} />
            <AvatarFallback>
              <User className="h-10 w-10 text-amber-700" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-600 text-sm">{user.email}</p>
            <p className="text-gray-600 text-sm">{user.phone}</p>
            <Badge
              className={`mt-2 ${
                user.accountType === "Pro"
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {user.accountType} Account
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[160px] w-full sm:w-auto">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Edit Profile
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Profile Completion</h4>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{profileCompletion}% complete</p>
              </div>
            </HoverCardContent>
          </HoverCard>

          {user.accountType === "Free" && (
            <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
