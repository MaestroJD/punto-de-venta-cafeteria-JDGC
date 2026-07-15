# skill-ith-backend.md
## Identidad del proyecto
- Proyecto: Sistema de Punto de Venta - ITH Sistemas y Computación
- Stack: Node.js + Express + Supabase
## Convenciones de código
- Variables y funciones en inglés (camelCase)
- Comentarios en español
- Archivos en inglés, minúsculas, con guión (ej. product-routes.js)
## Respuestas de API
- Éxito { success true, data [...] }
- Error { success false, error &quot;Mensaje descriptivo&quot; }
## Manejo de errores
- Códigos HTTP estándar 200, 201, 400, 404, 500
- Siempre usar trycatch
- Nunca exponer errores internos al cliente
## Base de datos (Supabase)
- Credenciales siempre en .env, nunca en el código
- Tablas en español, plural (productos, ventas, usuarios)