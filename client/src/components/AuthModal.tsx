import type { User } from "../types";

type AuthModalProps = {
  show: boolean;
  onClose: () => void;
  activeTab: "login" | "register";
  setActiveTab: (value: "login" | "register") => void;
  loginForm: { email: string; password: string };
  setLoginForm: (value: { email: string; password: string }) => void;
  registerForm: { email: string; password: string; username: string };
  setRegisterForm: (value: { email: string; password: string; username: string }) => void;
  login: () => void;
  register: () => void;
  isAuthLoading: boolean;
  user: User | null;
};

const AuthModal = ({
  show,
  onClose,
  activeTab,
  setActiveTab,
  loginForm,
  setLoginForm,
  registerForm,
  setRegisterForm,
  login,
  register,
  isAuthLoading,
  user,
}: AuthModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-[32px] bg-white shadow-float">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]">
          <div className="hidden md:flex flex-col justify-between rounded-[32px] bg-navy px-8 py-10 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Movieo Access</p>
              <h3 className="mt-4 font-display text-3xl">Welcome back.</h3>
              <p className="mt-3 text-sm text-white/70">
                Secure sessions, role-based access, and a curated catalog built for cinephiles.
              </p>
            </div>
            <div className="text-xs text-white/60">Session protected with JWT and refresh rotation.</div>
          </div>
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-2xl text-ink">Account</h3>
                <p className="text-sm text-black/50">Sign in or create a profile.</p>
              </div>
              <button className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>
            <div className="mt-6 inline-flex rounded-full bg-black/5 p-1">
              <button
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  activeTab === "login" ? "bg-white shadow-sm" : "text-black/50"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  activeTab === "register" ? "bg-white shadow-sm" : "text-black/50"
                }`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </div>
            {activeTab === "login" ? (
              <div className="mt-6 grid gap-4">
                <label className="text-xs text-black/50">
                  Email
                  <input
                    type="email"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </label>
                <label className="text-xs text-black/50">
                  Password
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-primary" onClick={login} disabled={isAuthLoading}>
                    {isAuthLoading ? "Working..." : "Login"}
                  </button>
                  {user && (
                    <button className="btn btn-ghost" onClick={onClose}>
                      Close
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                <label className="text-xs text-black/50">
                  Email
                  <input
                    type="email"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  />
                </label>
                <label className="text-xs text-black/50">
                  Username
                  <input
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    placeholder="moviefan"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  />
                </label>
                <label className="text-xs text-black/50">
                  Password
                  <input
                    type="password"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                    placeholder="Minimum 8 characters"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                </label>
                <button className="btn btn-primary" onClick={register} disabled={isAuthLoading}>
                  {isAuthLoading ? "Working..." : "Create account"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
