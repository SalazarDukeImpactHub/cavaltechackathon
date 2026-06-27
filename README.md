# 🛡️ CAVALTEC — Autodiagnóstico de Cumplimiento (Ley 1581)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)
![Claude](https://img.shields.io/badge/IA-Claude%20(Anthropic)-D97757?logo=anthropic&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)
![Talento Tech](https://img.shields.io/badge/Talento%20Tech-MinTIC-1a73e8)
![Hecho en Colombia](https://img.shields.io/badge/Hecho%20en-Colombia%20🇨🇴-FCD116)

> Aplicación web que permite a cualquier empresa **medir su nivel de cumplimiento de la Ley 1581 de 2012** (protección de datos personales, Colombia) en la fase de diseño — detectando brechas y generando un plan de acción accionable, asistido por IA.

**[🌐 Probar la app en vivo](https://cavaltechackathon.vercel.app)** · **[🏢 Conocé CAVALTEC](https://www.cavaltec.com/)**

---

> 📸 **Capturas próximamente** — se agregarán en `docs/` (landing, cuestionario y resultado).
<!-- ![Landing](docs/landing.png) -->

## 📑 Tabla de contenidos

- [✨ Qué hace](#-qué-hace)
- [🎯 Funcionalidades](#-funcionalidades)
- [🏗️ Arquitectura](#️-arquitectura)
- [🧰 Stack tecnológico](#-stack-tecnológico)
- [📊 Cómo funciona el diagnóstico](#-cómo-funciona-el-diagnóstico)
- [🚀 Correr localmente](#-correr-localmente)
- [📁 Estructura del proyecto](#-estructura-del-proyecto)
- [🔐 Seguridad](#-seguridad)
- [⚠️ Limitaciones y roadmap](#️-limitaciones-y-roadmap)
- [👥 Equipo](#-equipo)
- [💡 Sobre Talento Tech](#-sobre-talento-tech)
- [📜 Licencia](#-licencia)

---

## ✨ Qué hace

Muchas organizaciones colombianas deben cumplir la Ley 1581 pero **no tienen una herramienta simple** para saber qué tan bien aplican *privacidad desde el diseño*. CAVALTEC resuelve eso en cuatro pasos:

1. **Ingresás** con tu cuenta de Google (OAuth) y registrás tu empresa.
2. **Respondés** un cuestionario estructurado de 11 preguntas (fase de diseño).
3. **Obtenés** un porcentaje de cumplimiento, un diagnóstico visual y tus brechas detectadas.
4. **Recibís** recomendaciones priorizadas + un análisis con IA y un reporte PDF descargable.

---

## 🎯 Funcionalidades

| Función | Detalle |
|---------|---------|
| 🧮 **Motor de diagnóstico** | 11 preguntas ponderadas, lógica condicional padre-hijo, **scoring calculado en el servidor** |
| 🆔 **Validación de NIT real** | Algoritmo **Módulo 11 de la DIAN** — validado en TypeScript *y* en PostgreSQL |
| 🏢 **Multiempresa** | Aislamiento total por empresa mediante **Row Level Security** de Supabase |
| 👤 **Roles (RBAC)** | Administrador / Evaluador / Auditor, con control real (UI + base de datos) |
| 🤖 **IA aplicada** | Claude explica las preguntas en lenguaje simple y arma un plan de acción personalizado |
| 📄 **Reportes PDF** | Descargable, generado en el servidor, **con el análisis de IA incluido** |
| 📈 **Historial** | Cada empresa guarda y reabre sus diagnósticos pasados |
| 💬 **Asesoría directa** | CTA a WhatsApp con el contexto del diagnóstico pre-cargado |
| 🔒 **Seguridad** | Auditoría OWASP propia, security headers y defensa en profundidad |

---

## 🏗️ Arquitectura

```mermaid
flowchart LR
  U([👤 Usuario]) -->|OAuth Google| AUTH[Supabase Auth]
  AUTH --> DASH[Dashboard + Roles]
  DASH --> EMP[Registro de Empresa<br/>NIT Módulo 11]
  EMP --> Q[Cuestionario<br/>11 preguntas]
  Q -->|Server Action| SCORE[🔒 Scoring en servidor]
  SCORE --> DB[(Supabase<br/>Postgres + RLS)]
  SCORE --> RES[Resultado + Gauge]
  RES --> IA[🤖 Claude<br/>explica + analiza]
  RES --> PDF[📄 Reporte PDF]
```

**Decisiones clave:**

- **El puntaje se calcula siempre en el servidor.** El cliente manda respuestas, nunca el resultado — así nadie puede falsear su cumplimiento desde la consola.
- **El cuestionario vive en código** (config tipada), no en la base: es la fuente de verdad fija del reto.
- **La seguridad la garantiza la base.** El RLS aísla cada empresa a nivel de fila; aunque el código tuviera un bug, Postgres no deja ver datos ajenos.

---

## 🧰 Stack tecnológico

| Capa | Tecnología | Rol |
|------|------------|-----|
| Frontend + Backend | **Next.js 16** (App Router) | UI, Server Actions y Route Handlers |
| UI | **React 19** + **Tailwind CSS 4** | Componentes y sistema de diseño |
| Lenguaje | **TypeScript** (strict) | Tipado seguro en todo el proyecto |
| Auth + Base de datos | **Supabase** (PostgreSQL + RLS) | OAuth, persistencia y seguridad por fila |
| Inteligencia Artificial | **Claude** (Anthropic SDK) | Explicaciones (Haiku) y análisis (Sonnet) |
| Generación de PDF | **@react-pdf/renderer** | Reportes server-side |
| Hosting + CI/CD | **Vercel** | Deploy automático en cada `push` |

---

## 📊 Cómo funciona el diagnóstico

El cuestionario sigue la tabla oficial del reto, con **3 bloques ponderados** que suman 100%:

| Bloque | Peso máximo |
|--------|:-----------:|
| Política de datos personales | 40% |
| Privacidad desde el diseño | 36% |
| Gobernanza | 24% |

**Lógica condicional (padre-hijo):** la primera pregunta de Política es un *gate*. Si la empresa **no** tiene política de tratamiento, sus preguntas hijas se anulan automáticamente (no suman). Cada respuesta afirmativa suma su peso; el resultado es el % de cumplimiento, con las preguntas falladas convertidas en brechas priorizadas.

---

## 🚀 Correr localmente

**Requisitos:** Node 20+, una cuenta de [Supabase](https://supabase.com) y una API key de [Anthropic](https://console.anthropic.com).

```bash
# 1. Clonar e instalar
git clone https://github.com/SalazarDukeImpactHub/cavaltechackathon.git
cd cavaltechackathon
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
```

Completá `.env.local` con tus valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-o-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...   # solo servidor, nunca con prefijo NEXT_PUBLIC
```

```bash
# 3. Aplicar el esquema en Supabase (SQL Editor → Run, en este orden):
#    supabase/schema.sql
#    supabase/migrations/001_nit_validacion.sql
#    supabase/migrations/002_company_membership.sql
#    supabase/migrations/003_roles.sql

# 4. Configurar OAuth de Google en Supabase
#    Authentication → Providers → Google (Client ID + Secret)
#    Redirect URLs → http://localhost:3000/**

# 5. Correr
npm run dev   # http://localhost:3000
```

> 💡 La app funciona sin la `ANTHROPIC_API_KEY` (la IA se desactiva con gracia), pero pierde las explicaciones y el análisis.

---

## 📁 Estructura del proyecto

| Carpeta / archivo | Qué contiene |
|-------------------|--------------|
| `src/lib/diagnostico/` | Motor: preguntas (config), scoring, recomendaciones |
| `src/lib/nit/` | Validación de NIT (algoritmo Módulo 11 + tests) |
| `src/lib/ia/` | Integración con Claude (lógica pura + server actions) |
| `src/lib/empresa/` | Server actions de empresa, evaluaciones y miembros |
| `src/lib/reporte/` | Documento PDF (`@react-pdf`) |
| `src/lib/supabase/` | Clientes de Supabase (browser / server / proxy) |
| `src/app/` | Rutas: landing, login, dashboard, diagnóstico, evaluación, API |
| `src/components/` | Cuestionario, gauge, resultado, gestión de miembros, footer… |
| `supabase/` | Esquema SQL + migraciones (RLS, NIT, roles) |

---

## 🔐 Seguridad

Una app que predica protección de datos **pasa su propia auditoría**. Capas implementadas:

- **Scoring en servidor** — el cliente nunca define su puntaje (frontera de confianza).
- **Row Level Security** — cada empresa aislada a nivel de fila en PostgreSQL.
- **Validación de NIT Módulo 11** — en código *y* como `CHECK` en la base.
- **Autenticación obligatoria** — sin login no hay diagnóstico (ni acceso anónimo).
- **RBAC defensivo** — el auditor es solo-lectura, validado en UI **y** en RLS.
- **Endpoints de IA/PDF protegidos** — requieren sesión + rate limit (anti abuso de costos).
- **Security headers** — CSP, `X-Frame-Options`, `HSTS`, `Referrer-Policy`, `nosniff`.
- **Defensa en profundidad** — sanitización de entradas y verificación de membresía en código, no solo en la base.

> Resultado de la auditoría OWASP A01–A10: **sin hallazgos críticos.**

---

## ⚠️ Limitaciones y roadmap

| Pendiente | Estado |
|-----------|--------|
| Tema claro / oscuro conmutable | Backlog |
| Segundo idioma (inglés) | Backlog |
| Imagen de fondo en el hero | Backlog |
| Rate limiting distribuido (Redis) | Hoy es best-effort en memoria |

---

## 👥 Equipo

- **Jennifer Salazar Duque**
- **Juan Sebastián Andraus**
- **Yeison Alexander Córdoba Mena**
- **Yeferson Giraldo Lopez**
- **Luis Gabriel Alcala Ortega**

---

## 💡 Sobre Talento Tech

Proyecto desarrollado en el marco de **[Talento Tech](https://talentotech.gov.co/)**, el programa de formación en tecnología del **Ministerio de Tecnologías de la Información y las Comunicaciones (MinTIC)** de Colombia, creado para esta hackathon.

**Empresa retadora:** CAVALTEC S.A.S.

---

## 📜 Licencia

Proyecto académico desarrollado para Talento Tech (MinTIC). Código con fines educativos.

---

Hecho con 💜 en Colombia 🇨🇴
