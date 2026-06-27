/**
 * Base de conocimiento de Vale (asistente del landing).
 * Es un FAQ chico → va directo en el system prompt (no hace falta RAG/vectores).
 */
export const CONOCIMIENTO_CAVALTEC = `
# Sobre CAVALTEC Autodiagnóstico

## ¿Qué es?
Una plataforma web que permite a cualquier empresa medir su nivel de cumplimiento de la
Ley 1581 de 2012 (protección de datos personales en Colombia), en la fase de diseño.
En ~5 minutos: respondés 11 preguntas y obtenés tu porcentaje de cumplimiento, tus brechas
y un plan de acción.

## ¿Por qué es importante cumplir la Ley 1581?
- Toda empresa que recolecte datos personales (clientes, empleados, proveedores) está obligada.
- Protege un derecho fundamental: el Habeas Data (que las personas controlen sus datos).
- "Privacidad desde el diseño" significa pensar en la protección ANTES de recolectar datos,
  no después de un problema. Es más barato y efectivo prevenir que corregir.

## ¿Qué riesgos se evitan?
- Sanciones de la Superintendencia de Industria y Comercio (SIC): multas que pueden llegar
  a miles de millones de pesos.
- Daño reputacional y pérdida de confianza de los clientes tras una filtración o mal manejo.
- Demandas y reclamos de los titulares de los datos.
- Suspensión de actividades de tratamiento de datos.

## Ventajas de la plataforma
- **Diagnóstico claro**: un porcentaje y un velocímetro fáciles de entender, sin jerga legal.
- **Brechas priorizadas**: te decimos exactamente qué falta y en qué orden resolverlo.
- **Plan de acción con IA**: recomendaciones concretas y accionables para esta semana.
- **Reportes PDF descargables**: con el análisis incluido, listos para compartir.
- **Historial**: cada empresa guarda y reabre sus diagnósticos para medir su avance.
- **Multiempresa y roles**: administrador, evaluador y auditor, cada uno con sus permisos.
- **Seguro por diseño**: datos cifrados, aislamiento por empresa, autenticación con Google.

## ¿Por qué elegirnos?
- Está alineado con la tabla oficial de la Ley 1581 (no es un test genérico).
- La IA traduce lo legal a lenguaje simple y te guía paso a paso.
- Es rápido, gratuito para diagnosticar, y pensado para PyMEs sin equipo legal propio.
- La misma plataforma practica lo que predica: pasa su propia auditoría de seguridad.

## ¿Cómo funciona?
1. Ingresás con tu cuenta de Google.
2. Registrás tu empresa (nombre, NIT, sector, tamaño).
3. Respondés las 11 preguntas (3 bloques: Política de datos, Privacidad desde el diseño, Gobernanza).
4. Ves tu resultado, tus brechas y tu plan de acción. Descargás el PDF o pedís asesoría.

## Detalles útiles
- El diagnóstico es gratuito y toma unos 5 minutos.
- Es la fase de DISEÑO: evalúa cómo está pensada la protección, antes de operar.
- Para asesoría personalizada hay un botón que conecta directo por WhatsApp con el equipo.
`;
