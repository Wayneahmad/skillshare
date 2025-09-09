// src/pages/Profile.jsx
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/** Resize an image file to ~256x256 and return dataURL */
async function fileToDataURL256(file) {
  const img = await new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = fr.result;
    };
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });

  const size = 256;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const scale = Math.min(size / img.width, size / img.height, 1);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  canvas.width = size;
  canvas.height = size;
  // fill bg
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  // center draw
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function Profile() {
  const { user, updateProfile, setAvatar, removeAvatar } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToDataURL256(file);
      setAvatar(user.id, dataUrl);
      setMsg("Profile photo updated.");
    } catch (err) {
      console.error(err);
      setMsg("Could not process that image. Try another file.");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    updateProfile(user.id, { name, bio, location });
    setMsg("Profile saved.");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Tell people who you are. A friendly bio helps others trust your
          services.
        </p>

        {msg && (
          <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 grid place-items-center text-slate-500">
                {String(name || user.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer rounded-lg px-3 py-2 bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onAvatarChange}
                  disabled={busy}
                />
                Change photo
              </label>
              {user.avatar && (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 bg-white ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
                  onClick={() => {
                    removeAvatar(user.id);
                    setMsg("Profile photo removed.");
                  }}
                  disabled={busy}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Display name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Display name
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g., Alex, Jane D., Tutor Aya"
            />
            <p className="mt-1 text-xs text-slate-500">
              This name is shown on your offers and messages.
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={120}
              placeholder="City, Country"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people what you do and how you can help."
              maxLength={500}
            />
            <p className="mt-1 text-xs text-slate-500">Max 500 characters.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl px-4 py-2 bg-slate-900 text-white hover:opacity-90 disabled:opacity-50"
              disabled={busy}
            >
              Save profile
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
