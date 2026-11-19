# Regla: Principio de Responsabilidad Única (SRP)

## Directriz Principal
**No puede existir ningún archivo con más de una responsabilidad en el proyecto.** Cada módulo, hoja de estilo o vista debe tener una única razón para cambiar.

## Reglas de Arquitectura
1. **Separación de Capas**:
   - **Vista (`*.html`)**: Únicamente estructura semántica del documento e inclusión de hojas de estilo y scripts. Prohibido incluir bloques `<style>` o `<script>` con lógica embebida.
   - **Estilos (`css/`)**: Separados según su propósito visual (base/tipografía, controles de formulario, componentes específicos como el Piano Roll).
   - **Datos y Catálogos (`js/data/`)**: Constantes puras y catálogos estáticos (notas, escalas, plantillas de acordes, presets). Sin lógica de interfaz ni mutación de estado.
   - **Estado (`js/state/`)**: Definición centralizada del estado de la aplicación.
   - **Motor de Audio (`js/audio/`)**: Inicialización del grafo Web Audio API separada de la síntesis de notas del instrumento.
   - **Motor Armónico (`js/harmony/`)**: Separar el análisis/identificación de acordes, la construcción de acordes (diatónicos y préstamos) y las transformaciones de *voicing*.
   - **Secuenciador (`js/sequencer/`)**: Separar el reloj/transporte de reproducción de las acciones CRUD sobre la secuencia.
   - **Exportación (`js/export/`)**: Un archivo por formato de exportación (por ejemplo, exportación binaria MIDI separada de la exportación en texto/portapapeles).
   - **Interfaz de Usuario (`js/ui/`)**: Un archivo por cada sección o responsabilidad visual (notificaciones toast, transporte, paleta de escalas/acordes, línea de tiempo, inspector de notas, piano roll, atajos globales).
   - **Inicialización (`js/main.js`)**: Punto de entrada exclusivo para arrancar la aplicación.

2. **Creación de Nuevas Funcionalidades**:
   - Antes de añadir código nuevo, verifica si corresponde exactamente a la responsabilidad de un archivo existente.
   - Si introduce una nueva responsabilidad, crea un archivo dedicado dentro del directorio correspondiente.
