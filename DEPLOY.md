# Guía de Deploy — Prode Mundial 2026 en Dokploy

## Descripción del sistema

| Componente | Tecnología | Puerto |
|---|---|---|
| Frontend | React 19 + Vite + Tailwind CSS → Nginx | 80 |
| Backend | FastAPI + SQLAlchemy + Alembic | 8100 |
| Base de datos | PostgreSQL 16 | 5432 (interno) |

El frontend es una SPA servida por Nginx. El backend expone la API REST en `/api/*` y la documentación en `/docs`. La base de datos es PostgreSQL y las migraciones se aplican automáticamente al iniciar el backend vía Alembic.

---

## Requisitos previos

- Servidor VPS con Ubuntu 22.04+ (mínimo 2 GB RAM, 20 GB disco)
- Dokploy instalado ([dokploy.com/docs](https://dokploy.com/docs))
- Dominio(s) apuntando al servidor (DNS configurado)
- Repositorio Git accesible desde Dokploy (GitHub / GitLab / Gitea)

### Instalar Dokploy (si no está instalado)

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

Accedé al panel en `http://<IP-del-servidor>:3000` y completá el registro inicial.

---

## Variables de entorno requeridas

Creá un archivo `.env.production` local (no lo subas al repo) como referencia:

```env
# Base de datos
POSTGRES_DB=prode_mundial_db
POSTGRES_USER=prode_user
POSTGRES_PASSWORD=<contraseña-segura>

# Backend
APP_NAME=Prode Mundial
APP_ENV=production
APP_DEBUG=false
SECRET_KEY=<clave-secreta-larga-y-aleatoria>
ACCESS_TOKEN_EXPIRE_MINUTES=1440
BACKEND_CORS_ORIGINS=https://tu-dominio-frontend.com
BACKEND_PORT=8100

# Frontend (build arg — se embebe en el bundle de producción)
VITE_API_URL=https://tu-dominio-backend.com/api
FRONTEND_PORT=80
```

> **Importante:** `SECRET_KEY` debe ser una cadena larga y aleatoria. Generá una con:
> ```bash
> openssl rand -hex 32
> ```

---

## Deploy con Docker Compose en Dokploy

### Paso 1 — Crear proyecto

1. En el panel de Dokploy, hacé clic en **"Create Project"**.
2. Poné un nombre, p. ej. `prode-mundial`.

### Paso 2 — Agregar servicio Docker Compose

1. Dentro del proyecto, clic en **"Create Service" → "Docker Compose"**.
2. En **Source**, elegí **Git** y conectá tu repositorio.
3. En **Branch** poné `main` (o la rama de producción que uses).
4. En **Compose Path** dejá `docker-compose.yml` (está en la raíz del repo).

### Paso 3 — Configurar variables de entorno

1. Andá a la pestaña **"Environment"** del servicio.
2. Ingresá todas las variables del bloque anterior, una por línea en formato `CLAVE=valor`.
3. Guardá los cambios.

> `VITE_API_URL` es un **build argument** del frontend. Dokploy la pasa automáticamente al proceso `docker build` si la incluís en las variables de entorno del servicio.

### Paso 4 — Configurar dominios

Dokploy usa Traefik como reverse proxy. Para cada servicio:

#### Frontend
1. En la sección **"Domains"** del servicio frontend, clic en **"Add Domain"**.
2. Completá:
   - **Host:** `tu-dominio-frontend.com`
   - **Port:** `80`
   - **HTTPS:** activá "Let's Encrypt" para certificado automático.

#### Backend
1. Repetí el proceso para el backend.
2. Completá:
   - **Host:** `api.tu-dominio.com` (o el subdominio que uses)
   - **Port:** `8100`
   - **HTTPS:** activá "Let's Encrypt".

> Recordá que el dominio del backend debe coincidir exactamente con el valor de `VITE_API_URL` y `BACKEND_CORS_ORIGINS`.

### Paso 5 — Primer deploy

1. Andá a la pestaña **"Deployments"**.
2. Clic en **"Deploy"**.
3. Dokploy clona el repo, ejecuta `docker compose build` y luego `docker compose up -d`.
4. Podés ver los logs en tiempo real desde el panel.

El orden de inicio es:
1. `postgres` (con healthcheck)
2. `backend` (espera a que Postgres esté saludable, luego ejecuta `alembic upgrade head`)
3. `frontend`

### Paso 6 — Verificar el deploy

```bash
# Health check del backend
curl https://api.tu-dominio.com/api/health

# Documentación interactiva
# Abrí en el navegador: https://api.tu-dominio.com/docs
```

---

## Deploy manual (sin Dokploy)

Si querés correr el stack en cualquier servidor con Docker:

```bash
# Clonar el repositorio
git clone <url-del-repo> prodesalta
cd prodesalta

# Crear el archivo .env con tus valores reales
cp .env.example .env   # editá el archivo con tus valores

# Construir y levantar todos los servicios
docker compose up -d --build

# Ver logs
docker compose logs -f

# Detener
docker compose down
```

---

## Tareas post-deploy

### Crear usuario administrador

```bash
# Ejecutar script de creación de admin dentro del contenedor backend
docker compose exec backend python -m app.scripts.create_admin
```

### Cargar datos iniciales del Mundial 2026

```bash
# Equipos, grupos y fixture base
docker compose exec backend python -m app.scripts.reset_and_seed_worldcup_2026

# Reglas de puntuación
docker compose exec backend python -m app.scripts.seed_scoring_rules

# Imágenes de banderas
docker compose exec backend python -m app.scripts.seed_team_flags
```

### Correr migraciones manualmente

```bash
docker compose exec backend alembic upgrade head
```

---

## Actualizaciones

Dokploy soporta **auto-deploy por webhook**:

1. En la pestaña **"Deployments"** copiá la URL del webhook.
2. En GitHub/GitLab, configurá un webhook apuntando a esa URL.
3. Cada `push` a `main` disparará un nuevo deploy automáticamente.

Para deploy manual:
- En el panel de Dokploy → **"Deploy"** en la pestaña Deployments.

---

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| Backend no inicia | Postgres no responde aún | Esperá el healthcheck; revisá logs de postgres |
| Error de migración | Schema inconsistente | `docker compose exec backend alembic stamp head` |
| Frontend muestra error 404 en rutas | Nginx sin fallback SPA | Verificá que `nginx.conf` esté copiado correctamente |
| CORS bloqueado | `BACKEND_CORS_ORIGINS` incorrecto | Actualizá la variable con la URL exacta del frontend |
| `VITE_API_URL` incorrecto en producción | Build arg no seteado | Verificá que la variable esté en Dokploy antes de buildear |

---

## Estructura de archivos Docker

```
prodesalta/
├── backend/
│   └── Dockerfile          ← imagen Python 3.12 + uvicorn
├── frontend/
│   ├── Dockerfile          ← build Node 20 → Nginx
│   └── nginx.conf          ← configuración Nginx con SPA fallback
├── docker-compose.yml      ← orquestación completa (postgres + backend + frontend)
└── requirements.txt        ← dependencias Python del backend
```
APP_NAME=Prode Mundial
DATABASE_URL=postgresql+psycopg://saltiadb:asdf3456@31.97.28.11:5433/prode
  POSTGRES_HOST=31.97.28.11
  POSTGRES_PASSWORD=asdf3456
  POSTGRES_USER=saltiadb
  POSTGRES_DB=prode
  POSTGRES_PORT=5433
SECRET_KEY=genera-una-con-openssl-rand-hex-32
BACKEND_CORS_ORIGINS=https://prode-api.saltia.com.ar
VITE_API_URL=https://prode-api.saltia.com.ar:8100/api
APP_ENV=production
APP_DEBUG=false
#VITE_API_URL=http://127.0.0.1:8100/api
ACCESS_TOKEN_EXPIRE_MINUTES=1440
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=agenciasaltia@gmail.com
SMTP_PASSWORD=gskg yadp erqo wvmy
SMTP_FROM_EMAIL=no-reply@prodemundial.local
SMTP_FROM_NAME=Prode Mundial
SMTP_USE_TLS=true
SMTP_USE_SSL=false