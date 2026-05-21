import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMeService } from "@/services/user.service";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserDetailsModal } from "@/components/UserDetailsModal";
import { UserCircle2, Settings, LogOut, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const PROFILE_KEY = ["user-profile"];

function getInitials(raw: string): string {
  const name = (raw || "").trim();
  if (!name) return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  return parts
    .map(p => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserMenu() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: getMeService,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  console.log("[UserMenu] profile:", profile);
  if (error) console.error("[UserMenu] error:", error);

  if (error) {
    const axiosErr = error as { message?: string };
    if (axiosErr?.message?.includes("401") || axiosErr?.message?.toLowerCase().includes("unauthorized")) {
      localStorage.clear();
      queryClient.clear();
      setLocation("/auth");
      return null;
    }
  }

  const rawFullName = (profile?.fullName || "").trim();
  const rawEmail = (profile?.email || "").trim();
  const displayName = rawFullName || rawEmail || "Unknown User";
  const displayEmail = rawEmail;
  const initials = getInitials(rawFullName || rawEmail);

  const handleLogout = () => {
    localStorage.clear();
    queryClient.clear();
    setLocation("/auth");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/20 transition-all duration-150 overflow-hidden"
          >
            {isLoading ? (
              <UserCircle2 className="w-6 h-6 text-gray-500" />
            ) : (
              <Avatar className="w-8 h-8">
                <AvatarFallback
                  className={cn(
                    "text-xs font-semibold bg-gradient-to-br from-blue-400 to-indigo-500 text-white",
                  )}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64 bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-blue-500/5 rounded-2xl p-2"
        >
          <DropdownMenuLabel className="px-3 py-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 truncate">{displayName}</div>
                {displayEmail && (
                  <div className="text-xs text-gray-500 truncate">{displayEmail}</div>
                )}
                {profile && (
                  <div className="flex items-center gap-1 mt-1">
                    {profile.isEmailVerified ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-100/70 px-1.5 py-0.5 rounded-full">
                        <BadgeCheck className="w-2.5 h-2.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-medium text-amber-600 bg-amber-100/70 px-1.5 py-0.5 rounded-full">
                        Unverified
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-white/20 mx-2" />

          <DropdownMenuItem
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl cursor-pointer py-2.5 px-3 hover:bg-white/60 transition-colors duration-150"
          >
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Thông tin cá nhân</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/20 mx-2" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="rounded-xl cursor-pointer py-2.5 px-3 text-red-500 hover:bg-red-50/60 hover:text-red-600 transition-colors duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {profile && (
        <UserDetailsModal open={isModalOpen} onOpenChange={setIsModalOpen} profile={profile} />
      )}
    </>
  );
}
