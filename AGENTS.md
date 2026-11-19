# Reglas del Proyecto — ChordLab

Este repositorio sigue reglas estrictas de arquitectura y flujo de trabajo para garantizar mantenibilidad, claridad y trazabilidad.

## 1. Principio de Responsabilidad Única (SRP)
- **Ningún archivo puede tener más de una responsabilidad.**
- Está prohibido mezclar estructura (HTML), estilos (CSS), datos/constantes, estado, lógica de dominio (armonía, secuenciador, síntesis de audio), exportación o renderizado de interfaz en un mismo archivo.
- Consulta el detalle en [responsabilidad-unica.md](.agents/rules/responsabilidad-unica.md).

## 2. Convenciones de Commits y Pushes a GitHub
- **Todos los commits y pushes a GitHub deben estar escritos en español.**
- **Título en modo imperativo**: Debe iniciar con un verbo en imperativo como `Agrega`, `Añade`, `Separa`, `Corrige`, `Actualiza`, `Elimina`, `Refactoriza`, etc.
- **Cuerpo obligatorio explicando el porqué**: Todo commit debe incluir un body (separado del título por una línea en blanco) que explique **el porqué** se tomó la decisión o por qué fue necesario el cambio, no únicamente qué archivos se tocaron.
- Consulta el detalle y ejemplos en [convenciones-git.md](.agents/rules/convenciones-git.md).
