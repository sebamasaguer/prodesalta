# Guía de Deploy — Prode Mundial 2026 en Dokploy

## Arquitectura

```
Internet
   │
   ▼
Dokploy / Traefik  (HTTPS, dominio público)
   │
   ▼
frontend:80  (Nginx — sirve la SPA React)
   ├── GET /api/*  ──proxy interno──▶  backend:8000  (FastAPI / uvicorn)
   └── GET /*      ──SPA fallback──▶  index.html

Backend se conecta a PostgreSQL externo: 31.97.28.11:5433
```

| Servicio   | Imagen           | Puerto interno | Expuesto externamente |
|------------|------------------|----------------|-----------------------|
| frontend   | Nginx Alpine     | 80             | Sí (via Dokploy)      |
| backend    | Python 3.12 slim | 8000           | No (proxy interno)    |
| PostgreSQL | externo          | 5433           | No (conexión directa) |

---

## Requisitos previos

- Servidor VPS con Ubuntu 22.04+ (mínimo 2 GB RAM, 20 GB disco)
- Dokploy instalado ([dokploy.com/docs](https://dokploy.com/docs))
- Dominio apuntando al servidor (DNS configurado)
- Repositorio Git accesible desde Dokploy (GitHub / GitLab / Gitea)

```bash
# Instalar Dokploy si no está instalado
curl -sSL https://dokploy.com/install.sh | sh
```

Accedé al panel en `http://<IP-del-servidor>:3000`.

---

## Variables de entorno

Estas variables se configuran en Dokploy (pestaña **Environment** del servicio).

```env
# --- Backend ---
SECRET_KEY=<generá con: openssl rand -hex 32>
BACKEND_CORS_ORIGINS=https://tu-dominio.com
FRONTEND_BASE_URL=https://tu-dominio.com
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# SMTP (opcional — si se deja vacío el backend imprime los links en consola)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=agenciasaltia@gmail.com
SMTP_PASSWORD=gskg yadp erqo wvmy
SMTP_FROM_EMAIL=no-reply@prodemundial.com
SMTP_FROM_NAME=Prode Mundial
SMTP_USE_TLS=true
SMTP_USE_SSL=false

# --- Frontend (build arg — se embebe en el bundle) ---
VITE_API_URL=/api
```

> `DATABASE_URL` viene del archivo `backend/.env.server` que ya está en el repo y se carga automáticamente vía `env_file` en el compose.
>
> `VITE_API_URL=/api` es una ruta relativa: el Nginx del frontend hace el proxy interno al backend. No hace falta exponer el backend a internet.

---

## Paso a paso en Dokploy

### Paso 1 — Crear proyecto

1. Panel Dokploy → **"Create Project"**
2. Nombre: `prode-mundial`

### Paso 2 — Agregar servicio Docker Compose

1. Dentro del proyecto → **"Create Service" → "Docker Compose"**
2. **Source:** Git → conectar repositorio
3. **Branch:** `main`
4. **Compose Path:** `docker-compose.yml` (está en la raíz)
5. Guardar

### Paso 3 — Configurar variables de entorno

1. Pestaña **"Environment"** del servicio
2. Pegar el bloque de variables de arriba con los valores reales
3. **Guardar**

> Dokploy pasa automáticamente las variables al proceso `docker build`, por eso `VITE_API_URL` llega como build arg al Dockerfile del frontend.

### Paso 4 — Configurar dominio

1. Pestaña **"Domains"** → **"Add Domain"**
2. Completar:
   - **Host:** `tu-dominio.com`
   - **Service:** `frontend`
   - **Port:** `80`
   - **HTTPS:** activar "Let's Encrypt"
3. Guardar

> El backend **no necesita dominio propio**. Todo el tráfico entra por el frontend (puerto 80) y Nginx redirige `/api/*` internamente al backend.

### Paso 5 — Primer deploy

1. Pestaña **"Deployments"** → **"Deploy"**
2. Dokploy clona el repo, ejecuta `docker compose build` y luego `docker compose up -d`
3. Orden de inicio: backend (healthcheck en `/api/health`) → frontend (espera al backend)
4. Seguir logs en tiempo real desde el panel

### Paso 6 — Verificar

```bash
# Health check del backend (a través del proxy nginx)
curl https://tu-dominio.com/api/health

# Documentación interactiva de la API
# Abrir en el navegador: https://tu-dominio.com/api/docs
```

---

## Tareas post-deploy

```bash
# Correr migraciones (Alembic) — necesario en el primer deploy
docker compose exec backend alembic upgrade head

# Crear usuario administrador
docker compose exec backend python -m app.scripts.create_admin

# Cargar datos iniciales del Mundial 2026
docker compose exec backend python -m app.scripts.reset_and_seed_worldcup_2026
docker compose exec backend python -m app.scripts.seed_scoring_rules
docker compose exec backend python -m app.scripts.seed_team_flags
```

---

## Actualizaciones

Dokploy soporta **auto-deploy por webhook**:

1. Pestaña **"Deployments"** → copiar URL del webhook
2. En GitHub/GitLab configurar webhook apuntando a esa URL
3. Cada `push` a `main` dispara un nuevo deploy automáticamente

Para deploy manual: panel Dokploy → **"Deploy"** en la pestaña Deployments.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| Backend no inicia | No puede conectar a la DB externa | Verificar que `DATABASE_URL` en `backend/.env.server` sea correcta y que el puerto 5433 sea accesible desde el servidor |
| Frontend devuelve 502 en `/api/*` | Backend no levantó o healthcheck fallando | Revisar logs del servicio backend en Dokploy |
| CORS bloqueado en el navegador | `BACKEND_CORS_ORIGINS` incorrecto | Actualizar con la URL exacta del dominio (sin trailing slash) |
| `VITE_API_URL` apunta al lugar incorrecto | Variable no seteada antes del build | Verificar que esté en Environment antes de hacer deploy y rebuildear |
| Rutas de la SPA devuelven 404 | Nginx sin fallback SPA | Verificar que `nginx.conf` tenga `try_files $uri $uri/ /index.html` |
| Error de migración Alembic | Schema inconsistente | `docker compose exec backend alembic stamp head` y volver a correr `upgrade head` |

---

## Estructura de archivos relevantes

```
prodesalta/
├── backend/
│   ├── Dockerfile          ← Python 3.12 slim + uvicorn (puerto 8000 interno)
│   └── .env.server         ← DATABASE_URL y configuración base de producción
├── frontend/
│   ├── Dockerfile          ← build Node 22 → Nginx Alpine (acepta ARG VITE_API_URL)
│   └── nginx.conf          ← SPA fallback + proxy /api/ → backend:8000
├── docker-compose.yml      ← orquestación: backend + frontend (sin postgres local)
└── requirements.txt        ← dependencias Python del backend
```
