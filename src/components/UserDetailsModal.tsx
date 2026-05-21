import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePreferencesService } from "@/services/user.service";
import type { UserProfile } from "@/types/user.type";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PROFILE_KEY } from "@/components/UserMenu";
import { toTimeInputValue } from "@/lib/date-utils";
import { Globe, Clock, BadgeCheck, ShieldUser, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";

const timezones = Intl.supportedValuesOf("timeZone");

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  profile: UserProfile;
}

function sf(val: string | undefined | null, fallback = ""): string {
  return (val || "").trim() || fallback;
}

export function UserDetailsModal({ open, onOpenChange, profile }: UserDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const safeProfile = profile ?? ({} as UserProfile);

  const [timezone, setTimezone] = useState(sf(safeProfile.timezone, "UTC"));
  const [workingHourStart, setWorkingHourStart] = useState(toTimeInputValue(sf(safeProfile.workingHourStart, "09:00")));
  const [workingHourEnd, setWorkingHourEnd] = useState(toTimeInputValue(sf(safeProfile.workingHourEnd, "17:00")));

  useEffect(() => {
    setTimezone(sf(safeProfile.timezone, "UTC"));
    setWorkingHourStart(toTimeInputValue(sf(safeProfile.workingHourStart, "09:00")));
    setWorkingHourEnd(toTimeInputValue(sf(safeProfile.workingHourEnd, "17:00")));
  }, [safeProfile.timezone, safeProfile.workingHourStart, safeProfile.workingHourEnd]);

  const updateMutation = useMutation({
    mutationFn: (data: { workingHourStart: string; workingHourEnd: string; timezone: string }) =>
      updatePreferencesService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      toast({ title: "Cập nhật thành công" });
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast({ title: "Cập nhật thất bại", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizeTime = (val: string): string => {
      const trimmed = val.trim();
      if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
      if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
      return trimmed;
    };
    const payload = {
      timezone,
      workingHourStart: normalizeTime(workingHourStart),
      workingHourEnd: normalizeTime(workingHourEnd),
    };
    console.log("Preferences payload", payload);
    updateMutation.mutate(payload);
  };

  const fullName = sf(safeProfile.fullName);
  const email = sf(safeProfile.email);
  const roleLabel = (safeProfile.role || "").replace("ROLE_", "") || "USER";
  const emailVerified = safeProfile.isEmailVerified === true;

  console.log("[UserDetailsModal] profile prop:", safeProfile);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-blue-500/5 rounded-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-gray-800">Thông tin cá nhân</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          {/* Section 1: User Info */}
          <div className="bg-white/40 rounded-2xl p-4 space-y-3 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">User Info</h3>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Full Name</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{fullName || email || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Email</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <ShieldUser className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Role</p>
                <span className="inline-flex items-center text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                <BadgeCheck className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Email Verification</p>
                {emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[11px] font-semibold text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-full">
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Work Preferences */}
          <div className="bg-white/40 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Work Preferences</h3>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Globe className="w-4 h-4 text-gray-400" />
                Timezone
              </Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="glass-input w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="glass-card max-h-60">
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Start
                </Label>
                <Input
                  type="time"
                  value={workingHourStart}
                  onChange={e => setWorkingHourStart(e.target.value)}
                  className={cn(
                    "glass-input",
                    "focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 focus:bg-white/90",
                    "transition-all duration-150"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                  <Clock className="w-4 h-4 text-gray-400" />
                  End
                </Label>
                <Input
                  type="time"
                  value={workingHourEnd}
                  onChange={e => setWorkingHourEnd(e.target.value)}
                  className={cn(
                    "glass-input",
                    "focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/50 focus:bg-white/90",
                    "transition-all duration-150"
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="glass-button" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
