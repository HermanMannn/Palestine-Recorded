import { useState, useEffect } from "react";
import { User, Lock, Save, Camera, Palette, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { db } from "../firebase"; 
import { ref, update, get, query, orderByChild, equalTo } from "firebase/database";

export default function Settings() {
  const [userKey, setUserKey] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Profile State
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  // Appearance State
const [theme, setTheme] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") || "system";
  }
  return "system";
});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 1. Initial Load: Get user from LocalStorage & SessionStorage
    useEffect(() => {
      if (typeof window !== "undefined") {
        // User Session
        const savedUser = localStorage.getItem('palrec_user');
        if (savedUser) {
          setLoggedInUser(JSON.parse(savedUser));
        } else {
          setLoggedInUser({ username: "ahmed" }); 
        }

        // Theme - Crucial: Only update state if something is actually saved
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme); 
        }

        // Temporary Picture
        const tempPic = sessionStorage.getItem("temp_profile_pic");
        if (tempPic) setProfilePic(tempPic);
      }
    }, []);

  // 2. Fetch User Data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!loggedInUser?.username) return;

      try {
        const usersRef = ref(db, 'users');
        const userQuery = query(usersRef, orderByChild('username'), equalTo(loggedInUser.username)); 
        const snapshot = await get(userQuery);

        if (snapshot.exists()) {
          const key = Object.keys(snapshot.val())[0];
          const data = Object.values(snapshot.val())[0] as any;
          
          setUserKey(key);
          setUsername(data.username || "");
          setBio(data.bio || "");
          
          // Only pull DB pic if we don't have a temporary one in session storage
          if (!sessionStorage.getItem("temp_profile_pic")) {
            setProfilePic(data.profilePic || null);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [loggedInUser]);

  // 3. Theme Logic
  
    useEffect(() => {
      if (typeof window === "undefined") return;

      const root = window.document.documentElement;
      
      // Clean up existing classes
      root.classList.remove("light", "dark");

      let themeToApply = theme;

      // Handle the 'system' preference logic
      if (theme === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        themeToApply = systemPrefersDark ? "dark" : "light";
      }

      // Apply the correct class
      root.classList.add(themeToApply);
      
      // Sync with localStorage so it persists across refreshes/navigation
      localStorage.setItem("theme", theme);

      console.log(`Theme updated to: ${theme} (Applied: ${themeToApply})`);
    }, [theme]);



  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // 4. Save Profile & Image to Firebase
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userKey) return showToast("User session not found", "error");

    try {
      const specificUserRef = ref(db, `users/${userKey}`);
      const updateData = {
        username: username.trim(),
        bio: bio.trim(),
        profilePic: profilePic // Updates both the DB and the listener in Navbar
      };

      await update(specificUserRef, updateData);
      localStorage.setItem('palrec_user', JSON.stringify({ ...loggedInUser, username }));
      showToast("Profile and Navbar updated!");
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  // 5. Handle Image Upload (Store temporarily in session)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) return showToast("Image too large (Max 2MB)", "error");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePic(base64);
        sessionStorage.setItem("temp_profile_pic", base64);
        showToast("Picture selected! Save changes to apply.");
      };
      reader.readAsDataURL(file);
    }
  };

  // 6. Change Password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userKey) return showToast("Session error", "error");
    if (newPassword !== confirmPassword) return showToast("Passwords do not match", "error");

    try {
      const specificUserRef = ref(db, `users/${userKey}`);
      const snapshot = await get(specificUserRef);
      if (snapshot.exists() && snapshot.val().password === currentPassword) {
        await update(specificUserRef, { password: newPassword });
        showToast("Password updated!");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        showToast("Current password incorrect", "error");
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const scrollToSection = (e: any, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background/85 backdrop-blur-sm text-foreground transition-colors duration-300 pb-20 overflow-x-hidden">
      
      

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile, preferences, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-2">
              <a href="#profile" onClick={(e) => scrollToSection(e, "profile")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground font-medium">
                <User className="h-5 w-5" />
                Public Profile
              </a>
              <a href="#appearance" onClick={(e) => scrollToSection(e, "appearance")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground font-medium">
                <Palette className="h-5 w-5" />
                Appearance
              </a>
              <a href="#security" onClick={(e) => scrollToSection(e, "security")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground font-medium">
                <Lock className="h-5 w-5" />
                Security & Password
              </a>
            </div>
          </aside>

          <div className="md:col-span-3 space-y-12">
            
            <section id="profile" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Manager
              </h2>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative h-20 w-20 shrink-0 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors cursor-pointer">
                      <Camera className="h-4 w-4" />
                      Upload New Picture
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">Recommended: Square image, max 2MB.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Display Name</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-primary transition-colors duration-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Bio / About Me</label>
                  <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community about yourself..." className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-primary resize-none transition-colors duration-300" />
                </div>
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </form>
            </section>

            <section id="appearance" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">Customize how Palestine Recorded looks on your device.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button type="button" onClick={() => { setTheme("light"); showToast("Theme changed to Light"); }} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                    <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-300"></div>
                    <span className="font-medium text-sm">Light</span>
                  </button>
                  <button type="button" onClick={() => { setTheme("dark"); showToast("Theme changed to Dark"); }} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                    <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-700"></div>
                    <span className="font-medium text-sm">Dark</span>
                  </button>
                  <button type="button" onClick={() => { setTheme("system"); showToast("Theme synced with Device"); }} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'}`}>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-900 border border-slate-400"></div>
                    <span className="font-medium text-sm">Device Default</span>
                  </button>
                </div>
              </div>
            </section>

            <section id="security" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24 transition-colors duration-300">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Change Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showPasswords ? "text" : "password"} 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      className="w-full px-3 py-2 pr-10 rounded-md border border-border bg-background text-sm outline-none focus:border-primary transition-colors duration-300" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPasswords(!showPasswords)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords ? "text" : "password"} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="w-full px-3 py-2 pr-10 rounded-md border border-border bg-background text-sm outline-none focus:border-primary transition-colors duration-300" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showPasswords ? "text" : "password"} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="w-full px-3 py-2 pr-10 rounded-md border border-border bg-background text-sm outline-none focus:border-primary transition-colors duration-300" 
                        required 
                      />
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity">
                  <Lock className="h-4 w-4" />
                  Update Password
                </button>
              </form>
            </section>

          </div>
        </div>
      </main>

      {/* Pop-up Toast Notification */}
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