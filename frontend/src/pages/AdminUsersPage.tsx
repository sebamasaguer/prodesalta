import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  MailCheck,
  RefreshCw,
  Save,
  Search,
  Shield,
  UserCheck,
  UserCog,
  Users,
  UserX,
} from "lucide-react";
import {
  getAdminUserStats,
  listAdminUsers,
  updateAdminUser,
} from "../api/adminUsers";
import type { AdminUser, AdminUserFilters, UserAdminStats } from "../types/adminUsers";
import type { UserRole } from "../types/auth";
import { useAuth } from "../context/AuthContext";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  ORGANIZER: "Organizador",
  PLAYER: "Jugador",
};

function formatDate(value: string | null): string {
  if (!value) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-mundial-gold/15 text-mundial-gold">
        <Icon size={22} />
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-300">{title}</p>
    </div>
  );
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserAdminStats | null>(null);
  const [filters, setFilters] = useState<AdminUserFilters>({
    q: "",
    role: "",
    is_active: "",
    email_verified: "",
  });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    role: "PLAYER" as UserRole,
    is_active: true,
    email_verified: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function loadUsers(nextFilters = filters) {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [usersData, statsData] = await Promise.all([
        listAdminUsers(nextFilters),
        getAdminUserStats(),
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudieron cargar los usuarios",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleUsers = useMemo(() => {
    const search = normalize(filters.q || "");

    if (!search) return users;

    return users.filter((item) => {
      const value = normalize(
        `${item.first_name} ${item.last_name} ${item.username} ${item.email}`,
      );
      return value.includes(search);
    });
  }, [users, filters.q]);

  function handleFilterChange<K extends keyof AdminUserFilters>(
    field: K,
    value: AdminUserFilters[K],
  ) {
    const nextFilters = {
      ...filters,
      [field]: value,
    };

    setFilters(nextFilters);
    loadUsers(nextFilters);
  }

  function openEdit(user: AdminUser) {
    setEditingUserId(user.id);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      email_verified: Boolean(user.email_verified_at),
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  function closeEdit() {
    setEditingUserId(null);
  }

  async function handleSave(userId: number) {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updated = await updateAdminUser(userId, editForm);
      setUsers((current) => current.map((item) => (item.id === userId ? updated : item)));
      setSuccessMessage("Usuario actualizado correctamente");
      setEditingUserId(null);
      await loadUsers(filters);
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.detail || "No se pudo actualizar el usuario",
      );
    } finally {
      setIsSaving(false);
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
            Usuarios del sistema
          </h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Gestioná usuarios registrados, roles, estado de acceso y verificación de correo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadUsers(filters)}
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

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Usuarios" value={stats?.total_users || 0} icon={Users} />
        <StatCard title="Activos" value={stats?.active_users || 0} icon={UserCheck} />
        <StatCard title="Inactivos" value={stats?.inactive_users || 0} icon={UserX} />
        <StatCard title="Verificados" value={stats?.verified_users || 0} icon={MailCheck} />
        <StatCard title="Administradores" value={stats?.admin_users || 0} icon={Shield} />
      </div>

      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="grid gap-4 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">Buscar</span>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-mundial-dark/60 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={filters.q || ""}
                onChange={(event) => handleFilterChange("q", event.target.value)}
                placeholder="Nombre, usuario o email"
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">Rol</span>
            <select
              value={filters.role || ""}
              onChange={(event) => handleFilterChange("role", event.target.value as UserRole | "")}
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark/60 px-4 py-3 text-white outline-none"
            >
              <option value="">Todos</option>
              <option value="ADMIN">Administrador</option>
              <option value="ORGANIZER">Organizador</option>
              <option value="PLAYER">Jugador</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">Estado</span>
            <select
              value={filters.is_active === "" ? "" : String(filters.is_active)}
              onChange={(event) =>
                handleFilterChange(
                  "is_active",
                  event.target.value === "" ? "" : event.target.value === "true",
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark/60 px-4 py-3 text-white outline-none"
            >
              <option value="">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-200">Correo</span>
            <select
              value={filters.email_verified === "" ? "" : String(filters.email_verified)}
              onChange={(event) =>
                handleFilterChange(
                  "email_verified",
                  event.target.value === "" ? "" : event.target.value === "true",
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-mundial-dark/60 px-4 py-3 text-white outline-none"
            >
              <option value="">Todos</option>
              <option value="true">Verificados</option>
              <option value="false">Sin verificar</option>
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="font-black text-white">
            {isLoading ? "Cargando usuarios..." : `${visibleUsers.length} usuarios visibles`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Rol</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Correo</th>
                <th className="px-5 py-4">Alta</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {visibleUsers.map((item) => {
                const isEditing = editingUserId === item.id;
                const isCurrentUser = currentUser?.id === item.id;

                return (
                  <tr key={item.id} className="align-top hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            value={editForm.first_name}
                            onChange={(event) => setEditForm((current) => ({ ...current, first_name: event.target.value }))}
                            className="rounded-xl border border-white/10 bg-mundial-dark/60 px-3 py-2 text-white outline-none"
                          />
                          <input
                            value={editForm.last_name}
                            onChange={(event) => setEditForm((current) => ({ ...current, last_name: event.target.value }))}
                            className="rounded-xl border border-white/10 bg-mundial-dark/60 px-3 py-2 text-white outline-none"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="font-black text-white">
                              {item.first_name} {item.last_name}
                            </p>
                            {isCurrentUser && (
                              <span className="rounded-full bg-mundial-gold/15 px-2 py-1 text-[11px] font-black text-mundial-gold">
                                Vos
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-slate-300">@{item.username}</p>
                          <p className="mt-1 text-xs text-slate-400">{item.email}</p>
                        </>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <select
                          value={editForm.role}
                          onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value as UserRole }))}
                          className="rounded-xl border border-white/10 bg-mundial-dark/60 px-3 py-2 text-white outline-none"
                        >
                          <option value="ADMIN">Administrador</option>
                          <option value="ORGANIZER">Organizador</option>
                          <option value="PLAYER">Jugador</option>
                        </select>
                      ) : (
                        <span className="inline-flex rounded-full bg-white/10 px-3 py-1 font-black text-mundial-gold">
                          {roleLabels[item.role]}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <label className="inline-flex items-center gap-2 font-bold text-slate-200">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(event) => setEditForm((current) => ({ ...current, is_active: event.target.checked }))}
                            className="h-4 w-4"
                          />
                          Activo
                        </label>
                      ) : item.is_active ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-mundial-green/15 px-3 py-1 font-black text-mundial-greenSoft">
                          <CheckCircle2 size={15} /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-mundial-red/15 px-3 py-1 font-black text-red-100">
                          <UserX size={15} /> Inactivo
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <label className="inline-flex items-center gap-2 font-bold text-slate-200">
                          <input
                            type="checkbox"
                            checked={editForm.email_verified}
                            onChange={(event) => setEditForm((current) => ({ ...current, email_verified: event.target.checked }))}
                            className="h-4 w-4"
                          />
                          Verificado
                        </label>
                      ) : item.email_verified_at ? (
                        <span className="text-mundial-greenSoft">Verificado</span>
                      ) : (
                        <span className="text-red-100">Sin verificar</span>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(item.email_verified_at)}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-300">
                      {formatDate(item.created_at)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSave(item.id)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-mundial-green px-3 py-2 font-black text-white disabled:opacity-60"
                          >
                            <Save size={16} /> Guardar
                          </button>
                          <button
                            type="button"
                            onClick={closeEdit}
                            className="rounded-xl border border-white/10 px-3 py-2 font-black text-slate-200 hover:bg-white/10"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-black text-white hover:bg-white/10"
                        >
                          <UserCog size={16} /> Editar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!isLoading && visibleUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-300">
                    No hay usuarios para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
