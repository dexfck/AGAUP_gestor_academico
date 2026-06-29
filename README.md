# Sistema de Gestión Académica (SGA) - v1.0 Estable

Bienvenido al **Sistema de Gestión Académica (SGA)**, una aplicación moderna de escritorio construida con Tauri y React. Diseñada con un enfoque minimalista y funcional, esta herramienta permite a los estudiantes organizar integralmente su vida universitaria.

---

## Características Principales

###  1. Dashboard Interactivo
- Panel de bienvenida que personaliza el saludo según la hora del día.
- Resumen global del estado académico: **GPA General** y **GPA del Último Cuatrimestre**.
- Visualización de materias activas y organización cronológica automática de próximas tareas (indicadores de estado: *Completada, Pendiente, Entrega Hoy, Retrasada*).

###  2. Gestión de Calificaciones y Materias
- **Catálogo de Materias:** Registro dinámico de materias (códigos y créditos) y sistema de inscripción por cuatrimestre.
- **Asignación de Notas:** Interfaz detallada para registrar acumulados (parciales, prácticas y examen final).
- **Reporte Académico:** Cálculo automático del índice proyectado, conversión a escala de letras (A, B, C, D, F) y promedio segmentado por cuatrimestres.
- **Calculadora de Índice:** Simulador en tiempo real para proyectar índices futuros basados en calificaciones hipotéticas.

###  3. Horario Semanal
- Interfaz en formato de lista interactiva (Lunes a Sábado).
- Uso de selectores fijos para estandarizar las horas (00:00 - 23:00) y validación de aulas.
- Diseño minimalista con sistema de estados vacíos dinámicos.

###  4. Gestor de Tareas Inteligente
- Búsqueda unificada en tiempo real (por título o materia).
- Detección automática del estado basándose en la fecha actual contra la fecha de entrega.
- Selector interactivo para garantizar ingresos estandarizados de fechas (DD-MM-YYYY).

###  5. Directorio de Contactos
- Tarjetas formales de diseño horizontal con generación automática de avatares iniciales.
- Campos específicos para organización: profesor/compañero, correo institucional y enlaces rápidos.
- Accesibilidad mejorada con select-none y vistas tabulares adaptativas.

###  6. Editor de Notas Markdown
- Panel de escritura libre y vista previa nativa con soporte para formato Markdown (negritas, cursivas, listas, etc.).
- Guardado automático e integración de atajos de teclado (`Ctrl + S`).
- Módulo optimizado de pantalla vacía ("Ninguna nota seleccionada") para mejorar el UX general.

---

## 🛠 Tecnologías y Arquitectura

Este proyecto se ha desarrollado siguiendo estrictas reglas de UI/UX, utilizando una paleta académica, componentes unificados de altura (`h-screen`) y superposición global de errores (`ErrorToast`).

- **Frontend:** React 18, Vite.
- **Desktop Wrapper:** Tauri (Rust).
- **Estilos:** Tailwind CSS (sin dependencias excesivas, priorizando un diseño limpio, estricto y escalable).
- **Iconografía:** Lucide React.
- **Animaciones:** Framer Motion (Transiciones y micro-interacciones de tabla `-10x` a `0`).
- **Peticiones:** Axios configurado con interceptores globales para manejo de auth tokens y errores en capa superior (`z-[9999]`).
- **Markdown:** marked, DOMPurify.

---

## 📦 Instalación y Desarrollo Local

### Requisitos Previos
1. [Node.js](https://nodejs.org/) (Versión recomendada: v18 o superior).
2. [Rust y Cargo](https://rustup.rs/) (Requeridos por Tauri).

### Pasos
1. Clona el repositorio e instala las dependencias frontend:
   ```bash
   npm install
   ```
2. Ejecuta el entorno de desarrollo de Tauri:
   ```bash
   npm run tauri dev
   ```
3. Para compilar el ejecutable final (v1.0):
   ```bash
   npm run tauri build
   ```

---

