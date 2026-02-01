import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { endpoints } from "../api/client";
import { Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const { user, api, setUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState({
    account: false,
    avatar: false,
    cover: false,
    password: false,
  });

  const [msg, setMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const allowPasswordForm = () => setShowForm((prev) => !prev);

  const showMessage = (message) => {
    setMsg(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const saveAccount = async () => {
    setLoading((p) => ({ ...p, account: true }));
    try {
      const formattedEmail = email.trim().toLowerCase();

      const validEmailPattern =
        /^[^\s@]+@[^\s@]+\.(com|in|edu|org|net|ac\.in|co\.in)$/i;

      if (!validEmailPattern.test(formattedEmail)) {
        showMessage("❌ Enter a valid email address");
        return;
      }

      const res = await api.request("/users/update-account", {
        method: "PATCH",
        body: { fullName, email: formattedEmail },
      });

      setUser(res?.data || user);
      showMessage("✔️ Account updated successfully!");
    } catch (e) {
      showMessage(`❌ ${e.message}`);
    } finally {
      setLoading((p) => ({ ...p, account: false }));
    }
  };

  const updatePassword = async () => {
    setLoading((p) => ({ ...p, password: true }));
    try {
      await api.request(endpoints.changePassword(), {
        method: "POST",
        body: { password: oldPassword, newPassword },
      });
      setOldPassword("");
      setNewPassword("");
      showMessage("✔️ Password updated successfully!");
    } catch (error) {
      showMessage(`❌ ${error.message}`);
    } finally {
      setLoading((p) => ({ ...p, password: false }));
    }
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setLoading((p) => ({ ...p, avatar: true }));
    const fd = new FormData();
    fd.append("avatar", avatarFile);
    try {
      const res = await api.request("/users/update-avatar", {
        method: "PATCH",
        body: fd,
        isForm: true,
      });
      setUser(res?.data || user);
      showMessage("✔️ Avatar updated successfully!");
      setAvatarFile(null);
    } catch (e) {
      showMessage(`❌ ${e.message}`);
    } finally {
      setLoading((p) => ({ ...p, avatar: false }));
    }
  };

  const saveCover = async () => {
    if (!coverFile) return;
    setLoading((p) => ({ ...p, cover: true }));
    const fd = new FormData();
    fd.append("coverImage", coverFile);
    try {
      const res = await api.request("/users/update-cover", {
        method: "PATCH",
        body: fd,
        isForm: true,
      });
      setUser(res?.data || user);
      showMessage("✔️ Cover image updated successfully!");
      setCoverFile(null);
    } catch (e) {
      showMessage(`❌ ${e.message}`);
    } finally {
      setLoading((p) => ({ ...p, cover: false }));
    }
  };

  return (
    <div className="relative px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-2xl mx-auto space-y-8 sm:space-y-10">
      {/* ✅ Popup Notification */}
      {showPopup && (
        <div className="fixed top-20 right-2 sm:right-4 bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg text-xs sm:text-sm animate-fade-in z-50 max-w-[90vw]">
          {msg}
        </div>
      )}

      {/* ✅ Account Section */}
      <section className="space-y-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="text-lg sm:text-xl font-semibold text-gray-900">
          Account Details
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={saveAccount}
          disabled={loading.account}
          className={`w-full sm:w-auto px-4 py-3 rounded-lg bg-gray-900 text-white flex items-center justify-center gap-2 font-medium text-base transition-all ${
            loading.account
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-gray-800 active:scale-[0.98]"
          }`}
        >
          {loading.account && <span className="loader"></span>}
          Save
        </button>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* ✅ Password Section */}
      <section className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <button
          onClick={allowPasswordForm}
          className="w-full sm:w-auto px-4 py-3 rounded-lg bg-gray-900 text-white flex items-center justify-center gap-2 font-medium text-base hover:bg-gray-800 active:scale-[0.98] transition-all"
        >
          {showForm ? "Hide Password Form" : "Change Password"}
        </button>

        {showForm && (
          <div className="mt-4 space-y-4">
            <div className="text-lg sm:text-xl font-semibold text-gray-900">
              Change Password
            </div>

            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base pr-12"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => setShowOldPassword((prev) => !prev)}
                >
                  {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-base pr-12"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
            </div>

            <button
              onClick={updatePassword}
              disabled={loading.password}
              className={`w-full sm:w-auto px-4 py-3 rounded-lg bg-gray-900 text-white flex items-center justify-center gap-2 font-medium text-base transition-all ${
                loading.password
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-gray-800 active:scale-[0.98]"
              }`}
            >
              {loading.password && <span className="loader"></span>}
              {loading.password ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </section>

      <div className="border-t border-gray-200"></div>

      {/* ✅ Avatar Section */}
      <section className="space-y-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="text-lg sm:text-xl font-semibold text-gray-900">
          Avatar
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Avatar
          </label>
          <label className="flex flex-col items-center justify-center w-full h-36 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
              <p className="text-sm text-gray-500 text-center wrap-break-words max-w-full">
                {avatarFile ? avatarFile.name : "Click to upload avatar"}
              </p>
              {avatarFile && (
                <img
                  src={URL.createObjectURL(avatarFile)}
                  alt="Preview"
                  className="mt-3 h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-full border border-gray-200"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <button
          onClick={saveAvatar}
          disabled={!avatarFile || loading.avatar}
          className={`w-full sm:w-auto px-4 py-3 rounded-lg border border-gray-300 flex items-center justify-center gap-2 font-medium text-base transition-all ${
            !avatarFile || loading.avatar
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50 active:scale-[0.98]"
          }`}
        >
          {loading.avatar && <span className="loader"></span>}
          Update avatar
        </button>
      </section>

      <div className="border-t border-gray-200"></div>

      {/* ✅ Cover Image Section */}
      <section className="space-y-4 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="text-lg sm:text-xl font-semibold text-gray-900">
          Cover Image
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Cover Image
          </label>
          <label className="flex flex-col items-center justify-center w-full h-36 sm:h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
              <p className="text-sm text-gray-500 text-center wrap-break-words max-w-full">
                {coverFile ? coverFile.name : "Click to upload cover image"}
              </p>
              {coverFile && (
                <img
                  src={URL.createObjectURL(coverFile)}
                  alt="Preview"
                  className="mt-3 h-20 sm:h-24 object-cover rounded-lg border border-gray-200"
                />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
        <button
          onClick={saveCover}
          disabled={!coverFile || loading.cover}
          className={`w-full sm:w-auto px-4 py-3 rounded-lg border border-gray-300 flex items-center justify-center gap-2 font-medium text-base transition-all ${
            !coverFile || loading.cover
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-50 active:scale-[0.98]"
          }`}
        >
          {loading.cover && <span className="loader"></span>}
          Update cover
        </button>
      </section>

      {/* ✅ Spinner CSS */}
      <style>{`
        .loader {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #111;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
