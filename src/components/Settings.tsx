import { useState, useEffect } from "react";
import { User, Lock, Save, Camera, Palette, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Settings() {
  const [userId, setUserId] = useState<string | null>(null);

  // Profile State
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Security State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Appearance
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("theme") || "system";
    return "system";
  });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  // Load user + profile
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return;
      setUserId(u.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, bio, avatar_url")
        .eq("id", u.id)
        .maybeSingle();
      if (profile) {
        setUsername(profile.username || "");
        setBio(profile.bio || "");
        setProfilePic(profile.avatar_url || null);
      }
    };
    init();
  }, []);

  // Theme
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    let themeToApply = theme;
    if (theme === "system") {
      themeToApply = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    root.classList.add(themeToApply);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return showToast("Not logged in", "error");
    try {
      let avatar_url = profilePic;
      if (pendingFile) {
        const safe = pendingFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${userId}/${Date.now()}_${safe}`;
        const { error: upErr } = await supabase.storage.from("avatars").upload(path, pendingFile, { upsert: true });
        if (upErr) throw upErr;
        avatar_url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("profiles").update({
        username: username.trim(),
        bio: bio.trim(),
        avatar_url,
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
      if (error) throw error;
      setProfilePic(avatar_url);
      setPendingFile(null);
      showToast("Profile updated!");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) return showToast("Image too large (Max 5MB)", "error");
    setPendingFile(file);
    setProfilePic(URL.createObjectURL(file));
    showToast("Picture selected! Save changes to apply.");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showToast("Passwords do not match", "error");
    if (newPassword.length < 6) return showToast("Password must be at least 6 characters", "error");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return showToast(error.message, "error");
    showToast("Password updated!");
    setNewPassword(""); setConfirmPassword("");
  };

  const scrollToSection = (e: any, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background/85 backdrop-blur-sm text-foreground pb-20 overflow-x-hidden">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, preferences, and security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-2">
              <a href="#profile" onClick={(e) => scrollToSection(e, "profile")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border text-muted-foreground hover:text-foreground font-medium">
                <User className="h-5 w-5" /> Public Profile
              </a>
              <a href="#appearance" onClick={(e) => scrollToSection(e, "appearance")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border text-muted-foreground hover:text-foreground font-medium">
                <Palette className="h-5 w-5" /> Appearance
              </a>
              <a href="#security" onClick={(e) => scrollToSection(e, "security")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border text-muted-foreground hover:text-foreground font-medium">
                <Lock className="h-5 w-5" /> Security & Password
              </a>
            </div>
          </aside>

          <div className="md:col-span-3 space-y-12">
            <section id="profile" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Profile Manager
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative h-20 w-20 shrink-0 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center">
                    {profilePic ? <img src={profilePic} alt="Profile" className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div>
                    <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-accent cursor-pointer">
                      <Camera className="h-4 w-4" /> Upload New Picture
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">Recommended: Square image, max 5MB.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Display Name</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Bio / About Me</label>
                  <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community about yourself..." className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-primary resize-none" />
                </div>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </form>
            </section>

            <section id="appearance" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> Appearance
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">Customize how Palestine Recorded looks on your device.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button type="button" onClick={() => { setTheme("light"); showToast("Theme changed to Light"); }} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-300"></div>
                    <span className="font-medium text-sm">Light</span>
                  </button>
                  <button type="button" onClick={() => { setTheme("dark"); showToast("Theme changed to Dark"); }} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                    <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-700"></div>
                    <span className="font-medium text-sm">Dark</span>
                  </button>
                  <button type="button" onClick={() => { setTheme("system"); showToast("Theme synced with Device"); }} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-900 border border-slate-400"></div>
                    <span className="font-medium text-sm">Device Default</span>
                  </button>
                </div>
              </div>
            </section>

            <section id="security" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" /> Change Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">New Password</label>
                    <div className="relative">
                      <input type={showPasswords ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 pr-10 rounded-md border border-border bg-background text-sm outline-none focus:border-primary" required />
                      <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Confirm New Password</label>
                    <input type={showPasswords ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-primary" required />
                  </div>
                </div>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90">
                  <Lock className="h-4 w-4" /> Update Password
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${toast.type === "success" ? "bg-[#2a9d4a]" : "bg-[#c0392b]"}`}>
            {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
