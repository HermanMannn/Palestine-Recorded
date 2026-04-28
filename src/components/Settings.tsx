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
  const [theme, setTheme] = useState("system");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 1. Initial Load: Get user from LocalStorage & SessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem('palrec_user');
      if (savedUser) {
        setLoggedInUser(JSON.parse(savedUser));
      } else {
        console.warn("No session found, defaulting to 'ahmed' for testing.");
        setLoggedInUser({ username: "ahmed" }); 
      }

      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) setTheme(savedTheme || "system");

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
    localStorage.setItem("theme", theme);
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    const actualTheme = theme === "system" 
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    root.classList.add(actualTheme);
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
          <h1 className="text-4xl font-bold mb-3 text-foreground">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile, preferences, and security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-2">
              <a href="#profile" onClick={(e) => scrollToSection(e, "profile")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground font-medium">
                <User size={18} /> Public Profile
              </a>
              <a href="#appearance" onClick={(e) => scrollToSection(e, "appearance")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground font-medium">
                <Palette size={18} /> Appearance
              </a>
              <a href="#security" onClick={(e) => scrollToSection(e, "security")} className="flex items-center gap-3 p-3 rounded-lg hover:bg-card border border-transparent hover:border-border transition-colors text-muted-foreground hover:text-foreground font-medium">
                <Lock size={18} /> Security
              </a>
            </div>
          </aside>

          {/* Main Content Sections */}
          <div className="md:col-span-3 space-y-12">
            
            {/* PROFILE SECTION */}
            <section id="profile" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><User className="text-primary" size={20}/> Profile Manager</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative h-20 w-20 shrink-0 rounded-full bg-muted border-2 border-border overflow-hidden">
                    {profilePic ? <img src={profilePic} className="h-full w-full object-cover" /> : <User className="m-auto h-full w-1/2 opacity-20"/>}
                  </div>
                  <div>
                    <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-md text-sm font-medium hover:bg-accent cursor-pointer transition-colors">
                      <Camera size={16} /> Upload New Picture
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Display Name</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Bio</label>
                  <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background outline-none focus:border-primary resize-none transition-all" />
                </div>
                <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-[#2a9d4a] text-white rounded-md font-bold hover:opacity-90 transition-opacity shadow-md">
                  <Save size={18} /> Save Changes
                </button>
              </form>
            </section>

            {/* APPEARANCE SECTION */}
            <section id="appearance" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Palette className="text-primary" size={20}/> Appearance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['light', 'dark', 'system'].map((m) => (
                  <button key={m} onClick={() => setTheme(m)} className={`p-4 rounded-xl border-2 transition-all ${theme === m ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                    <span className="capitalize font-medium text-sm">{m} Mode</span>
                  </button>
                ))}
              </div>
            </section>

            {/* SECURITY SECTION */}
            <section id="security" className="rounded-2xl border border-border bg-card/95 p-6 shadow-sm scroll-mt-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Lock className="text-primary" size={20}/> Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <input type={showPasswords ? "text" : "password"} placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-background outline-none focus:border-primary" />
                <div className="grid grid-cols-2 gap-4">
                  <input type={showPasswords ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-background outline-none focus:border-primary" />
                  <input type={showPasswords ? "text" : "password"} placeholder="Confirm New" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="px-3 py-2 rounded-md border border-border bg-background outline-none focus:border-primary" />
                </div>
                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="text-xs text-primary font-medium hover:underline">
                  {showPasswords ? "Hide Passwords" : "Show Passwords"}
                </button>
                <button type="submit" className="block w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md font-bold">Update Password</button>
              </form>
            </section>

          </div>
        </div>
      </main>

      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white font-medium animate-in slide-in-from-bottom-5 ${toast.type === "success" ? "bg-[#2a9d4a]" : "bg-[#c0392b]"}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}