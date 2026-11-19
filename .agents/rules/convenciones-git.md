# Regla: Convenciones de Commits y Pushes a GitHub

## Directriz Principal
Todos los mensajes de commit y pushes a GitHub futuros deben redactarse **en español**, utilizando el **modo imperativo** en el título y explicando obligatoriamente **el porqué** en el cuerpo (*body*) del mensaje.

## Formato Obligatorio

```text
<Verbo en imperativo> <resumen conciso del cambio>

<Explicación detallada del PORQUÉ se realizó este cambio, qué problema resuelve,
qué motivación técnica o de arquitectura lo justifica y su impacto.>
```

## Reglas del Título (Subject)
1. **Idioma**: Español.
2. **Modo Imperativo**: Iniciar siempre con un verbo en imperativo en tercera persona singular (tú):
   - ✅ `Agrega exportador de progresiones en formato MIDI`
   - ✅ `Añade soporte para préstamos modales en la paleta`
   - ✅ `Separa el monolito en módulos con responsabilidad única`
   - ✅ `Corrige el cálculo de frecuencia en el sintetizador FM`
   - ❌ `Agregando exportador MIDI` (gerundio)
   - ❌ `Se agregó soporte para préstamos` (pasado)
   - ❌ `Add MIDI exporter` (inglés)
3. **Longitud**: Máximo 72 caracteres y sin punto final.

## Reglas del Cuerpo (Body)
1. **Separación**: Debe existir una línea en blanco entre el título y el cuerpo.
2. **Enfoque en el "Porqué"**: El código ya muestra *qué* cambió; el cuerpo debe explicar **por qué** se hizo el cambio:
   - ¿Qué limitación tenía el diseño anterior?
   - ¿Por qué se eligió este enfoque o arquitectura?
   - ¿Qué beneficio aporta al usuario o al mantenimiento del proyecto?
