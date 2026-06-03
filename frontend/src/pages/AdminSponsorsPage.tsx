import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Edit3,
  ImagePlus,
  Megaphone,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  createSponsor,
  deleteSponsor,
  listSponsors,
  updateSponsor,
  uploadSponsorLogo,
} from "../api/sponsors";
import type { Sponsor, SponsorPayload } from "../types/sponsor";
import { resolveAssetUrl } from "../utils/matchDisplay";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const emptyForm: SponsorPayload = {
  name: "",
  phone: "",
  logo_url: "",
  display_order: 1,
  is_active: true,
};

export function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [form, setForm] = useState<SponsorPayload>(emptyForm);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [editForm, setEditForm] = useState<SponsorPayload>(emptyForm);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadSponsors() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await listSponsors();
      setSponsors(data);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudieron cargar los sponsors",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSponsors();
  }, []);

  const filteredSponsors = useMemo(() => {
    const search = normalize(searchText);

    if (!search) return sponsors;

    return sponsors.filter((sponsor) => {
      const value = normalize(`${sponsor.name} ${sponsor.phone || ""}`);
      return value.includes(search);
    });
  }, [sponsors, searchText]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const created = await createSponsor({
        name: form.name.trim(),
        phone: form.phone?.trim() || null,
        logo_url: form.logo_url?.trim() || null,
        display_order: form.display_order,
        is_active: form.is_active,
      });
      setSponsors((current) => [...current, created].sort((a, b) => a.display_order - b.display_order));
      setForm(emptyForm);
      setSuccessMessage("Sponsor creado correctamente");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo crear el sponsor");
    } finally {
      setIsSaving(false);
    }
  }

  function openEdit(sponsor: Sponsor) {
    setEditingSponsor(sponsor);
    setEditForm({
      name: sponsor.name,
      phone: sponsor.phone || "",
      logo_url: sponsor.logo_url || "",
      display_order: sponsor.display_order,
      is_active: sponsor.is_active,
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeEdit() {
    setEditingSponsor(null);
  }

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingSponsor) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await updateSponsor(editingSponsor.id, {
        name: editForm.name.trim(),
        phone: editForm.phone?.trim() || null,
        logo_url: editForm.logo_url?.trim() || null,
        display_order: editForm.display_order,
        is_active: editForm.is_active,
      });
      setSponsors((current) =>
        current
          .map((item) => (item.id === updated.id ? updated : item))
          .sort((a, b) => a.display_order - b.display_order),
      );
      setEditingSponsor(updated);
      setSuccessMessage("Sponsor actualizado correctamente");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo actualizar el sponsor");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(sponsor: Sponsor) {
    const confirmed = window.confirm(`¿Eliminar el sponsor ${sponsor.name}?`);

    if (!confirmed) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteSponsor(sponsor.id);
      setSponsors((current) => current.filter((item) => item.id !== sponsor.id));
      if (editingSponsor?.id === sponsor.id) {
        setEditingSponsor(null);
      }
      setSuccessMessage("Sponsor eliminado correctamente");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo eliminar el sponsor");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!editingSponsor) return;

    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsUploadingLogo(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await uploadSponsorLogo(editingSponsor.id, file);
      setSponsors((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setEditingSponsor(updated);
      setEditForm((current) => ({
        ...current,
        logo_url: updated.logo_url || "",
      }));
      setSuccessMessage("Logo subido correctamente");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo subir el logo");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-gold">
            Administración
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Sponsors
          </h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Cargá sponsors con nombre, teléfono y logo. Los sponsors activos se muestran en la landing pública.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSponsors}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10"
        >
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-red/30 bg-mundial-red/10 px-4 py-3 font-semibold text-red-100">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 rounded-2xl border border-mundial-green/30 bg-mundial-green/10 px-4 py-3 font-semibold text-mundial-greenSoft">
          {successMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleCreate}
          className="h-fit rounded-3xl border border-white/10 bg-white/5 p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mundial-gold/15 text-mundial-gold">
              <Plus size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Nuevo sponsor</h2>
              <p className="text-sm text-slate-300">Alta rápida para la landing.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Nombre</span>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-gold"
                placeholder="Ej: Agencia Saltia"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Teléfono</span>
              <input
                value={form.phone || ""}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-gold"
                placeholder="Ej: 387 000 0000"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Logo por URL</span>
              <input
                value={form.logo_url || ""}
                onChange={(event) => setForm((current) => ({ ...current, logo_url: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-gold"
                placeholder="https://.../logo.png"
              />
              <p className="mt-2 text-xs text-slate-400">
                También podés subir una imagen después de crear el sponsor.
              </p>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Orden</span>
              <input
                type="number"
                min={1}
                max={9999}
                value={form.display_order}
                onChange={(event) => setForm((current) => ({ ...current, display_order: Number(event.target.value) }))}
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-white outline-none focus:border-mundial-gold"
              />
            </label>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-mundial-dark/60 px-4 py-3">
              <span className="font-bold text-slate-200">Mostrar en landing</span>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                className="h-5 w-5"
              />
            </label>

            <button
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 font-black text-mundial-dark hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} />
              {isSaving ? "Guardando..." : "Guardar sponsor"}
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">Listado</h2>
              <p className="text-sm text-slate-300">{sponsors.length} sponsors cargados</p>
            </div>

            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-mundial-dark px-10 py-3 text-sm text-white outline-none focus:border-mundial-gold"
                placeholder="Buscar sponsor..."
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-6 text-slate-200">
              Cargando sponsors...
            </div>
          ) : filteredSponsors.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-mundial-dark/60 p-8 text-center">
              <Megaphone className="mx-auto mb-4 text-slate-400" size={36} />
              <h3 className="text-xl font-black">No hay sponsors encontrados</h3>
              <p className="mt-2 text-sm text-slate-300">Cargá el primer sponsor para mostrarlo en la landing.</p>
            </div>
          ) : (
            <div className="grid max-h-[760px] gap-3 overflow-y-auto pr-2 md:grid-cols-2">
              {filteredSponsors.map((sponsor) => {
                const logoUrl = resolveAssetUrl(sponsor.logo_url);

                return (
                  <div
                    key={sponsor.id}
                    className="rounded-2xl border border-white/10 bg-mundial-dark/70 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={`Logo de ${sponsor.name}`}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <Megaphone className="text-slate-500" size={24} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xl font-black">{sponsor.name}</p>
                          <span className={`rounded-full px-2 py-1 text-xs font-black ${sponsor.is_active ? "bg-mundial-green/15 text-mundial-greenSoft" : "bg-white/10 text-slate-300"}`}>
                            {sponsor.is_active ? "Activo" : "Oculto"}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-300">
                          <Phone size={14} />
                          {sponsor.phone || "Sin teléfono"}
                        </p>
                        <p className="mt-1 text-xs font-bold text-mundial-gold">
                          Orden {sponsor.display_order}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEdit(sponsor)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-white/10"
                      >
                        <Edit3 size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(sponsor)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-mundial-red/30 bg-mundial-red/10 px-3 py-2 text-sm font-bold text-red-100 hover:bg-mundial-red/20"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editingSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-mundial-dark p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-gold">
                  Editar sponsor
                </p>
                <h2 className="mt-2 text-3xl font-black">{editingSponsor.name}</h2>
              </div>

              <button
                onClick={closeEdit}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white">
                  {resolveAssetUrl(editForm.logo_url) ? (
                    <img
                      src={resolveAssetUrl(editForm.logo_url) || ""}
                      alt={`Logo de ${editForm.name}`}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Megaphone className="text-slate-500" size={32} />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-200">Logo del sponsor</p>
                  <p className="mt-1 text-xs text-slate-400">Podés pegar una URL o subir una imagen desde tu equipo.</p>

                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-mundial-green px-4 py-2 text-sm font-black text-mundial-dark hover:bg-mundial-greenLight">
                    <ImagePlus size={16} />
                    {isUploadingLogo ? "Subiendo..." : "Subir logo"}
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.webp,.svg"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Nombre</span>
                <input
                  required
                  value={editForm.name}
                  onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark/70 px-4 py-3 text-white outline-none focus:border-mundial-gold"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Teléfono</span>
                <input
                  value={editForm.phone || ""}
                  onChange={(event) => setEditForm((current) => ({ ...current, phone: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark/70 px-4 py-3 text-white outline-none focus:border-mundial-gold"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Logo por URL</span>
                <input
                  value={editForm.logo_url || ""}
                  onChange={(event) => setEditForm((current) => ({ ...current, logo_url: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark/70 px-4 py-3 text-white outline-none focus:border-mundial-gold"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-200">Orden</span>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={editForm.display_order}
                  onChange={(event) => setEditForm((current) => ({ ...current, display_order: Number(event.target.value) }))}
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark/70 px-4 py-3 text-white outline-none focus:border-mundial-gold"
                />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="font-bold text-slate-200">Mostrar en landing</span>
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(event) => setEditForm((current) => ({ ...current, is_active: event.target.checked }))}
                  className="h-5 w-5"
                />
              </label>

              <button
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mundial-gold px-5 py-3 font-black text-mundial-navy hover:bg-mundial-goldSoft disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
