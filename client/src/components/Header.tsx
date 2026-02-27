import type { User } from "../types";

type HeaderProps = {
  user: User | null;
  isAdmin: boolean;
  isAdminLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenAdmin: () => void;
};

const Header = ({ user, isAdmin, isAdminLoading, onSignIn, onSignOut, onOpenAdmin }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-20 bg-sand/70 backdrop-blur-2xl border-b border-black/5">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white font-display text-lg">
            M
          </div>
          <div>
            <div className="text-lg font-semibold">Movieo</div>
            <div className="text-xs text-black/50">Review engine</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-sage/80 px-3 py-1 text-xs text-navy">
            {user ? `${user.email} (${user.role})` : "Disconnected"}
          </span>
          {user ? (
            <button className="btn btn-ghost" onClick={onSignOut}>
              Sign out
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={onSignIn}>
              Sign in
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-primary" disabled={isAdminLoading} onClick={onOpenAdmin}>
              Admin tools
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
