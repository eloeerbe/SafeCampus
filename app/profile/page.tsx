"use client";

// Requirements: 13.1, 13.2, 13.3, 13.4
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useUIStore } from "@/lib/store/uiStore";
import { mockUsers, mockReports, mockNotifications } from "@/lib/mockData";

export default function ProfilePage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const toggleMFA = useAuthStore((s) => s.toggleMFA);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const updateNotifPrefs = useAuthStore((s) => s.updateNotifPrefs);

  if (!currentUser) return null;

  const prefs = currentUser.notificationPrefs;

  // Req 13.2: Update notification preferences with toast
  const handleEmailToggle = (checked: boolean) => {
    updateNotifPrefs({ emailEnabled: checked });
    toast.success("Email notifications updated");
  };

  const handleInAppToggle = (checked: boolean) => {
    updateNotifPrefs({ inAppEnabled: checked });
    toast.success("In-app notifications updated");
  };

  const handleCategoryToggle = (key: keyof typeof prefs.categories, checked: boolean) => {
    updateNotifPrefs({ categories: { ...prefs.categories, [key]: checked } });
    toast.success("Category preference updated");
  };

  // Req 13.3: MFA toggle with confirmation toast
  const handleMFAToggle = () => {
    toggleMFA();
    toast.success(currentUser.mfaEnabled ? "MFA disabled" : "MFA enabled");
  };

  const handleLanguageChange = (lang: "en" | "es") => {
    updateProfile({ language: lang });
    toast.success("Language updated");
  };

  const handlePublicProfileToggle = (checked: boolean) => {
    updateProfile({ publicProfile: checked });
    toast.success("Profile visibility updated");
  };

  const handleLocationToggle = (checked: boolean) => {
    updateProfile({ locationPermission: checked });
    toast.success("Location permission updated");
  };

  // SR-031: Reset Demo Data — reload all stores with original mockData
  const handleResetDemoData = () => {
    useAuthStore.setState({ users: mockUsers, currentUser: mockUsers.find((u) => u.id === currentUser.id) ?? currentUser });
    useReportsStore.setState({ reports: mockReports });
    useNotificationStore.setState({ notifications: mockNotifications });
    useUIStore.setState({ feedFilter: null, mapFilters: { categories: [], severities: [], statuses: [], dateRange: "all" }, activeModal: null, demoBannerDismissed: false });
    toast.success("Demo data has been reset.");
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>

        {/* User Info */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar src={currentUser.avatar} alt={currentUser.name} fallback={currentUser.name.charAt(0)} size="lg" />
            <div>
              <p className="font-semibold">{currentUser.name}</p>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Notification Preferences</h2>

            <div className="flex items-center justify-between">
              <span className="text-sm">Email Notifications</span>
              <Switch checked={prefs.emailEnabled} onCheckedChange={handleEmailToggle} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">In-App Notifications</span>
              <Switch checked={prefs.inAppEnabled} onCheckedChange={handleInAppToggle} />
            </div>

            <div className="border-t pt-3">
              <p className="mb-2 text-sm font-medium text-gray-500">Category Preferences</p>
              {([
                ["safety", "Safety"],
                ["maintenance", "Maintenance"],
                ["harassment", "Harassment"],
                ["lostAndFound", "Lost & Found"],
                ["other", "Other"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <span className="text-sm">{label}</span>
                  <Switch
                    checked={prefs.categories[key]}
                    onCheckedChange={(checked) => handleCategoryToggle(key, checked)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Settings</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Require OTP on login</p>
              </div>
              <Switch checked={currentUser.mfaEnabled} onCheckedChange={handleMFAToggle} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Language</span>
              <Select
                value={currentUser.language}
                onChange={(e) => handleLanguageChange(e.target.value as "en" | "es")}
                className="w-32"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Public Profile</p>
                <p className="text-xs text-gray-500">Allow others to see your profile</p>
              </div>
              <Switch checked={currentUser.publicProfile} onCheckedChange={handlePublicProfileToggle} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Location Permission</p>
                <p className="text-xs text-gray-500">Allow map to use your location</p>
              </div>
              <Switch checked={currentUser.locationPermission} onCheckedChange={handleLocationToggle} />
            </div>
          </CardContent>
        </Card>

        {/* Reset Demo Data */}
        <Card>
          <CardContent className="p-4">
            <Button variant="outline" className="w-full text-danger border-danger hover:bg-danger/5" onClick={handleResetDemoData}>
              Reset Demo Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
