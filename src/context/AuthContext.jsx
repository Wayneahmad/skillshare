// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);
const KEY = "skillshare_auth_v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function save(v) {
  localStorage.setItem(KEY, JSON.stringify(v));
}
function uid() {
  return `u_${Math.random().toString(36).slice(2, 8)}`;
}

export function AuthProvider({ children }) {
  // seed to match AppState’s seeded offers
  const seeded = {
    currentUserId: null,
    users: {
      u_seed_alex: {
        id: "u_seed_alex",
        email: "alex@seed.dev",
        password: null, // signInAs only (AccountSwitcher)
        name: "Alex (DevOps)",
        credits: 12,
        bio: "DevOps & AWS cost optimization.",
        location: "London, UK",
        avatar: null,
      },
      u_seed_jo: {
        id: "u_seed_jo",
        email: "jo@seed.dev",
        password: null,
        name: "Jo (Design)",
        credits: 5,
        bio: "Brand & product design.",
        location: "London, UK",
        avatar: null,
      },
    },
  };

  const initial = load() || seeded;

  const [users, setUsers] = useState(initial.users);
  const [currentUserId, setCurrentUserId] = useState(initial.currentUserId);

  useEffect(() => save({ users, currentUserId }), [users, currentUserId]);

  const user = currentUserId ? users[currentUserId] : null;

  // -------- Auth (email/password) --------
  function findByEmail(email) {
    const e = String(email || "")
      .trim()
      .toLowerCase();
    return (
      Object.values(users).find((u) => (u.email || "").toLowerCase() === e) ||
      null
    );
  }

  function signUp({ name, email, password }) {
    const e = String(email || "")
      .trim()
      .toLowerCase();
    const n = String(name || "").trim();
    const p = String(password || "");

    if (!e || !p)
      return { ok: false, error: "Email and password are required." };
    if (findByEmail(e))
      return { ok: false, error: "That email is already registered." };

    const id = uid();
    const newUser = {
      id,
      email: e,
      password: p, // demo only (plaintext). For production, hash on the server.
      name: n || e,
      credits: 0,
      bio: "",
      location: "",
      avatar: null,
    };

    setUsers((prev) => ({ ...prev, [id]: newUser }));
    setCurrentUserId(id);
    return { ok: true, user: newUser };
  }

  function signIn({ email, password }) {
    const e = String(email || "")
      .trim()
      .toLowerCase();
    const p = String(password || "");
    const u = findByEmail(e);
    if (!u || u.password !== p)
      return { ok: false, error: "Invalid email or password." };
    setCurrentUserId(u.id);
    return { ok: true, user: u };
  }

  function signOut() {
    setCurrentUserId(null);
  }

  // For your dev AccountSwitcher
  const allUsers = useMemo(() => Object.values(users), [users]);
  function signInAs(id) {
    if (!users[id]) return;
    setCurrentUserId(id);
  }

  // -------- Wallet helpers (unchanged names) --------
  function addCredits(n) {
    if (!user) return;
    const amt = Number(n || 0);
    setUsers((u) => ({
      ...u,
      [user.id]: { ...u[user.id], credits: (u[user.id].credits || 0) + amt },
    }));
  }
  function spendCredits(n) {
    if (!user) return;
    const amt = Number(n || 0);
    setUsers((u) => ({
      ...u,
      [user.id]: {
        ...u[user.id],
        credits: Math.max(0, (u[user.id].credits || 0) - amt),
      },
    }));
  }
  function creditById(id, n) {
    const amt = Number(n || 0);
    setUsers((u) => {
      const cur = u[id] || {
        id,
        name: id,
        credits: 0,
        bio: "",
        location: "",
        avatar: null,
        email: null,
        password: null,
      };
      return { ...u, [id]: { ...cur, credits: (cur.credits || 0) + amt } };
    });
  }
  function debitById(id, n) {
    const amt = Number(n || 0);
    setUsers((u) => {
      const cur = u[id] || {
        id,
        name: id,
        credits: 0,
        bio: "",
        location: "",
        avatar: null,
        email: null,
        password: null,
      };
      return {
        ...u,
        [id]: { ...cur, credits: Math.max(0, (cur.credits || 0) - amt) },
      };
    });
  }
  function getBalanceById(id) {
    return users[id]?.credits ?? 0;
  }

  // -------- Profile helpers --------
  function getNameById(id) {
    return users[id]?.name || id;
  }
  function getAvatarById(id) {
    return users[id]?.avatar || null;
  }
  function updateProfile(id, patch) {
    setUsers((u) => {
      const cur = u[id] || {
        id,
        name: id,
        credits: 0,
        bio: "",
        location: "",
        avatar: null,
        email: null,
        password: null,
      };
      const next = { ...cur };
      if (patch.name !== undefined)
        next.name = String(patch.name).trim() || cur.name;
      if (patch.bio !== undefined) next.bio = String(patch.bio);
      if (patch.location !== undefined) next.location = String(patch.location);
      return { ...u, [id]: next };
    });
  }
  function setAvatar(id, dataUrl) {
    setUsers((u) => {
      const cur = u[id] || {
        id,
        name: id,
        credits: 0,
        bio: "",
        location: "",
        avatar: null,
        email: null,
        password: null,
      };
      return { ...u, [id]: { ...cur, avatar: dataUrl || null } };
    });
  }
  function removeAvatar(id) {
    setUsers((u) => {
      const cur = u[id];
      if (!cur) return u;
      return { ...u, [id]: { ...cur, avatar: null } };
    });
  }

  const value = useMemo(
    () => ({
      user,
      allUsers,
      // auth
      signUp,
      signIn,
      signInAs,
      signOut,
      // wallet
      addCredits,
      spendCredits,
      creditById,
      debitById,
      getBalanceById,
      // profile
      getNameById,
      getAvatarById,
      updateProfile,
      setAvatar,
      removeAvatar,
    }),
    [user, allUsers, users]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
