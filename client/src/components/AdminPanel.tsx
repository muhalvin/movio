import type { Movie } from "../types";

type AdminPanelProps = {
  showAdmin: boolean;
  onClose: () => void;
  createForm: { title: string; releaseDate: string; genres: string; description: string };
  setCreateForm: (value: { title: string; releaseDate: string; genres: string; description: string }) => void;
  updateForm: { title: string; releaseDate: string; genres: string; description: string };
  setUpdateForm: (value: { title: string; releaseDate: string; genres: string; description: string }) => void;
  createMovie: () => void;
  updateMovie: () => void;
  deleteMovie: () => void;
  isAdminLoading: boolean;
  selectedMovie: Movie | null;
};

const AdminPanel = ({
  showAdmin,
  onClose,
  createForm,
  setCreateForm,
  updateForm,
  setUpdateForm,
  createMovie,
  updateMovie,
  deleteMovie,
  isAdminLoading,
  selectedMovie,
}: AdminPanelProps) => {
  if (!showAdmin) return null;

  return (
    <section id="admin" className="mx-auto w-full max-w-6xl px-6 pb-12">
      <div className="glass rounded-[32px] p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Admin studio</h2>
            <p className="text-black/60">Create or update movies. Admin role required.</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <h3 className="font-display text-xl">Create a movie</h3>
            <div className="mt-4 grid gap-3">
              <label className="text-xs text-black/50">
                Title
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                />
              </label>
              <label className="text-xs text-black/50">
                Release date
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  value={createForm.releaseDate}
                  onChange={(e) => setCreateForm({ ...createForm, releaseDate: e.target.value })}
                />
              </label>
              <label className="text-xs text-black/50">
                Genres (comma-separated)
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  value={createForm.genres}
                  onChange={(e) => setCreateForm({ ...createForm, genres: e.target.value })}
                />
              </label>
              <label className="text-xs text-black/50">
                Description
                <textarea
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </label>
              <button className="btn btn-primary" onClick={createMovie} disabled={isAdminLoading}>
                {isAdminLoading ? "Working..." : "Create movie"}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <h3 className="font-display text-xl">Update selected movie</h3>
            <p className="text-sm text-black/50">{selectedMovie ? "Editing current selection." : "Select a movie from the catalog first."}</p>
            <div className="mt-4 grid gap-3">
              <label className="text-xs text-black/50">
                Title
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  value={updateForm.title}
                  onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                />
              </label>
              <label className="text-xs text-black/50">
                Release date
                <input
                  type="date"
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  value={updateForm.releaseDate}
                  onChange={(e) => setUpdateForm({ ...updateForm, releaseDate: e.target.value })}
                />
              </label>
              <label className="text-xs text-black/50">
                Genres (comma-separated)
                <input
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  value={updateForm.genres}
                  onChange={(e) => setUpdateForm({ ...updateForm, genres: e.target.value })}
                />
              </label>
              <label className="text-xs text-black/50">
                Description
                <textarea
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm"
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={updateMovie} disabled={isAdminLoading}>
                  {isAdminLoading ? "Working..." : "Update"}
                </button>
                <button className="btn btn-ghost" onClick={deleteMovie} disabled={isAdminLoading}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
