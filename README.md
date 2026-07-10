# 🏊 Escuela de Natación · La Loma de Santi Petri

Aplicación web de reservas para las clases de natación infantil de la piscina
comunitaria "La Loma de Santi Petri" (Chiclana de la Frontera). Las familias
reservan plaza escaneando un QR físico, sin necesidad de registrarse; German
y Ainoa (instructores) gestionan sesiones e inscritos desde un panel privado.

**Stack:** React + Vite + TypeScript · Tailwind CSS v4 · Supabase (Postgres +
Auth + API REST) · Despliegue en Vercel.

## Índice

1. [Requisitos](#requisitos)
2. [Puesta en marcha en local](#puesta-en-marcha-en-local)
3. [Configurar Supabase](#configurar-supabase)
4. [Crear el primer usuario admin](#crear-el-primer-usuario-admin)
5. [Desplegar en Vercel](#desplegar-en-vercel)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Cómo funciona la protección de aforo](#cómo-funciona-la-protección-de-aforo)
8. [Cartel QR para imprimir](#cartel-qr-para-imprimir)

## Requisitos

- Node.js 20+
- Una cuenta y proyecto en [Supabase](https://supabase.com) (plan gratuito es
  suficiente)

## Puesta en marcha en local

```bash
npm install
cp .env.example .env   # y rellena tus credenciales de Supabase (ver abajo)
npm run dev
```

La app estará disponible en `http://localhost:5173`.

Otros comandos disponibles:

```bash
npm run build     # type-check + build de producción a dist/
npm run preview   # sirve el build de producción en local
npm run lint      # linting con oxlint
```

## Configurar Supabase

### 1. Crear el proyecto

Crea un proyecto nuevo en [supabase.com](https://supabase.com/dashboard) y
espera a que termine de aprovisionarse.

### 2. Ejecutar el SQL de las tablas

Ve a **SQL Editor -> New query** en el dashboard de Supabase, pega el
contenido completo de [`supabase/schema.sql`](./supabase/schema.sql) y
ejecútalo. Este script crea:

- Las tablas `sessions` y `bookings`.
- Índices únicos que impiden que el mismo teléfono/email reserve dos veces en
  la misma sesión.
- Un trigger (`check_session_capacity`) que bloquea la fila de la sesión
  antes de contar las reservas existentes, evitando overbooking aunque dos
  familias reserven al mismo tiempo (condición de carrera).
- La vista pública `session_availability` (sin datos personales) para el
  listado de disponibilidad.
- Las funciones RPC `get_booking_by_token` y `cancel_booking`, usadas por la
  página de confirmación/cancelación sin necesidad de login.
- Las políticas de Row Level Security (RLS) que separan el acceso público
  (leer sesiones, crear reservas) del acceso de administración (leer/editar/
  borrar todo, solo autenticado).

Al final del archivo hay un `insert` comentado con las 4 fechas de julio 2026
del enunciado (17, 20, 25 y 28 de julio, 11:00-12:00h) por si quieres
precargarlas rápido; descoméntalo antes de ejecutar si te resulta útil. En
producción normal, estas fechas se crean desde el panel admin (**Panel ->
+ Nueva sesión**), ya que el ciclo de clases se repite cada mes y no debe
quedar hardcodeado en el código.

### 3. Variables de entorno

En **Project Settings -> API** copia la `Project URL` y la clave pública
`anon` `public`. Rellena tu `.env` (basado en `.env.example`):

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-publica
VITE_PUBLIC_SITE_URL=https://tu-app.vercel.app
```

`VITE_PUBLIC_SITE_URL` se usa únicamente para generar el QR imprimible
(`/qr`). En local, si lo dejas vacío, se usará automáticamente la URL del
navegador.

> ⚠️ Nunca subas tu `.env` al repositorio. Solo se usa la clave `anon`
> (pública, protegida por RLS), nunca la `service_role`.

## Crear el primer usuario admin

Los administradores (German y Ainoa) se gestionan con Supabase Auth
(tabla nativa `auth.users`), no hace falta tabla propia. Para crear el
primer usuario:

1. En el dashboard de Supabase ve a **Authentication -> Users -> Add user ->
   Create new user**.
2. Introduce su email y una contraseña. Marca **Auto Confirm User** para que
   no necesite verificar el email.
3. Repite para cada instructor que necesite acceso.
4. Entra en la app por `/admin/login` con esas credenciales.

## Desplegar en Vercel

1. Sube el repositorio a GitHub (o similar) e impórtalo en
   [Vercel](https://vercel.com/new).
2. Vercel detecta automáticamente que es un proyecto Vite (`npm run build`,
   carpeta de salida `dist`).
3. En **Settings -> Environment Variables** añade las mismas variables del
   `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y
   `VITE_PUBLIC_SITE_URL` (esta última con la URL final de producción, p. ej.
   `https://escuela-natacion.vercel.app`).
4. Despliega. Como es una SPA con rutas de cliente (React Router), añade un
   archivo `vercel.json` en la raíz si necesitas reescritura de rutas (Vercel
   ya sirve `index.html` para rutas desconocidas en proyectos Vite/SPA por
   defecto, pero si ves 404 en rutas como `/admin`, añade):

   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

5. Una vez desplegado, actualiza `VITE_PUBLIC_SITE_URL` con la URL definitiva
   y vuelve a desplegar para que el cartel QR (`/qr`) apunte correctamente.

## Estructura del proyecto

```
src/
  components/
    common/      Spinner, Alert, Button, EmptyState (loading/error/empty)
    public/      Header, footer, listado y tarjeta de sesión, formulario de reserva
    admin/       Formulario de sesión, panel de resumen, RequireAuth
  hooks/         useAuth (sesión Supabase), useAsyncData (loading/error genérico)
  layouts/       PublicLayout (header/footer públicos)
  lib/           cliente supabase, funciones de API, fechas, CSV
  pages/         Home, BookingPage, ConfirmationPage, QrPage, admin/*
  types/         tipos TypeScript del esquema de datos
supabase/
  schema.sql     migraciones SQL completas (tablas, RLS, triggers, RPC, vista)
```

## Cómo funciona la protección de aforo

La validación de aforo **no depende solo del frontend**. Cada `insert` en
`bookings` dispara el trigger `check_session_capacity`, que:

1. Bloquea la fila de la sesión (`SELECT ... FOR UPDATE`), serializando
   cualquier inserción concurrente para esa misma sesión.
2. Cuenta las reservas ya existentes y compara con el aforo.
3. Si está completa, lanza una excepción y la reserva no se guarda.

Además, dos índices únicos (`session_id` + `phone` y `session_id` +
`email`) impiden que la misma familia reserve dos veces por accidente en la
misma sesión, también a nivel de base de datos.

## Cartel QR para imprimir

Visita `/qr` (no requiere login) para ver el cartel en tamaño A5 con el QR
apuntando a `VITE_PUBLIC_SITE_URL`, alto contraste y el nombre de la escuela.
Pulsa "Imprimir cartel" y selecciona tamaño de papel A5 (o A4 y recorta).
