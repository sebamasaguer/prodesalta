import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
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
  createSponsorWithUpload,
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

function resolveSponsorLogo(url?: string | null): string {
  return resolveAssetUrl(url) || "/logosistema.jpeg";
}

function handleLogoError(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.src = "/logosistema.jpeg";
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [editForm, setEditForm] = useState<SponsorPayload>(emptyForm);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);

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

  function handleCreateLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);

    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
    }

    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  function handleEditLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setEditLogoFile(file);

    if (editLogoPreview) {
      URL.revokeObjectURL(editLogoPreview);
    }

    setEditLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const created = await createSponsorWithUpload({
        name: form.name,
        phone: form.phone || null,
        logoUrl: form.logo_url || null,
        logoFile,
        displayOrder: Number(form.display_order || 1),
        isActive: form.is_active,
      });

      setSponsors((current) =>
        [...current, created].sort((a, b) => a.display_order - b.display_order),
      );
      setForm(emptyForm);
      setLogoFile(null);

      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }

      setLogoPreview(null);
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
    setEditLogoFile(null);

    if (editLogoPreview) {
      URL.revokeObjectURL(editLogoPreview);
    }

    setEditLogoPreview(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeEdit() {
    setEditingSponsor(null);
    setEditForm(emptyForm);
    setEditLogoFile(null);

    if (editLogoPreview) {
      URL.revokeObjectURL(editLogoPreview);
    }

    setEditLogoPreview(null);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingSponsor) return;

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let updated = await updateSponsor(editingSponsor.id, {
        name: editForm.name.trim(),
        phone: editForm.phone?.trim() || null,
        logo_url: editForm.logo_url?.trim() || null,
        display_order: Number(editForm.display_order || 1),
        is_active: editForm.is_active,
      });

      if (editLogoFile) {
        setIsUploadingLogo(true);
        updated = await uploadSponsorLogo(editingSponsor.id, editLogoFile);
      }

      setSponsors((current) =>
        current
          .map((sponsor) => (sponsor.id === updated.id ? updated : sponsor))
          .sort((a, b) => a.display_order - b.display_order),
      );

      closeEdit();
      setSuccessMessage("Sponsor actualizado correctamente");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo actualizar el sponsor");
    } finally {
      setIsSaving(false);
      setIsUploadingLogo(false);
    }
  }

  async function handleDelete(sponsor: Sponsor) {
    const confirmed = window.confirm(`¿Eliminar el sponsor "${sponsor.name}"?`);

    if (!confirmed) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteSponsor(sponsor.id);
      setSponsors((current) => current.filter((item) => item.id !== sponsor.id));
      setSuccessMessage("Sponsor eliminado correctamente");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.detail || "No se pudo eliminar el sponsor");
    }
  }

  const activeCount = sponsors.filter((sponsor) => sponsor.is_active).length;
  const inactiveCount = sponsors.length - activeCount;

  return (
    <div className="min-h-screen bg-mundial-dark px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-mundial-gold">
                <Megaphone size={28} />
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-red">
                  Administración
                </p>
                <h1 className="mt-1 text-3xl font-black text-white">
                  Sponsors
                </h1>
                <p className="mt-2 max-w-3xl font-semibold text-slate-300">
                  Cargá sponsors con nombre, teléfono y logo. La carga por archivo
                  es la opción principal y la más estable para producción.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadSponsors}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {successMessage}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-widest text-slate-300">
              Total
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {sponsors.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-widest text-slate-300">
              Activos
            </p>
            <p className="mt-2 text-3xl font-black text-mundial-green">
              {activeCount}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-widest text-slate-300">
              Ocultos
            </p>
            <p className="mt-2 text-3xl font-black text-mundial-red">
              {inactiveCount}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form
            onSubmit={handleCreate}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mundial-green/10 text-mundial-green">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  Nuevo sponsor
                </h2>
                <p className="text-sm font-semibold text-slate-300">
                  Primero subí el logo como archivo.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-black text-white">
                  Nombre
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                  placeholder="Nombre del sponsor"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-white">
                  Teléfono
                </span>
                <input
                  value={form.phone || ""}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                  placeholder="Ej: 387..."
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-white">
                  Logo del sponsor
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleCreateLogoChange}
                  className="mt-2 block w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white file:mr-4 file:rounded-xl file:border-0 file:bg-mundial-green file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-mundial-greenLight"
                />
                <span className="mt-2 block text-xs font-semibold text-slate-300">
                  Recomendado: PNG, JPG, WEBP o SVG. Máximo 3 MB. Para Canva,
                  descargá el diseño como PNG y subilo acá.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-black text-white">
                  URL directa de imagen{" "}
                  <span className="text-slate-300">(opcional)</span>
                </span>
                <input
                  type="url"
                  value={form.logo_url || ""}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, logo_url: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                  placeholder="https://dominio.com/logo.png"
                />
                <span className="mt-2 block text-xs font-semibold text-slate-300">
                  Usar solo URLs directas a imagen. No usar enlaces de Canva,
                  Drive, Facebook, Instagram ni páginas de vista previa.
                </span>
              </label>

              {(logoPreview || form.logo_url) && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-300">
                    Vista previa
                  </p>
                  <div className="flex h-40 items-center justify-center rounded-2xl bg-white p-5">
                    <img
                      src={logoPreview || resolveSponsorLogo(form.logo_url)}
                      alt="Vista previa del sponsor"
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={handleLogoError}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black text-white">
                    Orden
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        display_order: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-mundial-line text-mundial-green"
                  />
                  <span className="text-sm font-black text-white">
                    Visible en landing
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 text-sm font-black text-white shadow-mundialGreen transition hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {isSaving ? "Guardando..." : "Guardar sponsor"}
              </button>
            </div>
          </form>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-white">
                  Sponsors cargados
                </h2>
                <p className="text-sm font-semibold text-slate-300">
                  Administrá los sponsors visibles en el landing.
                </p>
              </div>

              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                />
                <input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-mundial-dark py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold sm:w-72"
                  placeholder="Buscar sponsor..."
                />
              </div>
            </div>

            {isLoading ? (
              <p className="rounded-2xl bg-white/5 p-4 text-sm font-bold text-slate-300">
                Cargando sponsors...
              </p>
            ) : filteredSponsors.length ? (
              <div className="space-y-3">
                {filteredSponsors.map((sponsor) => {
                  const logoUrl = resolveSponsorLogo(sponsor.logo_url);

                  return (
                    <article
                      key={sponsor.id}
                      className="rounded-3xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white p-2">
                            <img
                              src={logoUrl}
                              alt={`Logo de ${sponsor.name}`}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              onError={handleLogoError}
                            />
                          </div>

                          <div>
                            <h3 className="text-lg font-black text-white">
                              {sponsor.name}
                            </h3>

                            {sponsor.phone && (
                              <p className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-slate-300">
                                <Phone size={15} />
                                {sponsor.phone}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-300">
                                Orden {sponsor.display_order}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  sponsor.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {sponsor.is_active ? "Activo" : "Oculto"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(sponsor)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-white/15"
                          >
                            <Edit3 size={16} />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(sponsor)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-300/40 bg-red-500/10 px-3 py-2 text-sm font-black text-red-200 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl bg-white/5 p-4 text-sm font-bold text-slate-300">
                No hay sponsors para mostrar.
              </p>
            )}
          </section>
        </section>
      </div>

      {editingSponsor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={handleUpdate}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-mundial-sidebar p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-mundial-red">
                  Editar sponsor
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  {editingSponsor.name}
                </h2>
                <p className="mt-2 text-sm font-semibold text-slate-300">
                  Modificá los datos del sponsor. Si subís un nuevo archivo,
                  se reemplaza el logo actual.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-black text-white">
                  Nombre
                </span>
                <input
                  required
                  value={editForm.name}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-white">
                  Teléfono
                </span>
                <input
                  value={editForm.phone || ""}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                />
              </label>

              <label className="block">
                <span className="text-sm font-black text-white">
                  Reemplazar logo por archivo
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  onChange={handleEditLogoChange}
                  className="mt-2 block w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white file:mr-4 file:rounded-xl file:border-0 file:bg-mundial-green file:px-4 file:py-2 file:text-sm file:font-black file:text-white hover:file:bg-mundial-greenLight"
                />
                <span className="mt-2 block text-xs font-semibold text-slate-300">
                  Si seleccionás un archivo, reemplaza la URL actual del logo.
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-black text-white">
                  URL directa de imagen
                </span>
                <input
                  type="url"
                  value={editForm.logo_url || ""}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      logo_url: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                  placeholder="https://dominio.com/logo.png"
                />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-300">
                  Vista previa
                </p>
                <div className="flex h-40 items-center justify-center rounded-2xl bg-white p-5">
                  <img
                    src={editLogoPreview || resolveSponsorLogo(editForm.logo_url)}
                    alt="Vista previa del sponsor"
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                    onError={handleLogoError}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-black text-white">
                    Orden
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={editForm.display_order}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        display_order: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-mundial-gold"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-mundial-dark px-4 py-3">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-mundial-line text-mundial-green"
                  />
                  <span className="text-sm font-black text-white">
                    Visible en landing
                  </span>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving || isUploadingLogo}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-mundial-green px-5 py-3 text-sm font-black text-white shadow-mundialGreen transition hover:bg-mundial-greenLight disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ImagePlus size={18} />
                  {isSaving || isUploadingLogo ? "Actualizando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
