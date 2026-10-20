# Villafañe & Asociados — demo de plataforma de gestión jurídica

Prototipo funcional de Studio Villafañe: sitio institucional, CRM jurídico, expedientes, agenda con pagos de prueba, presupuestos, facturación interna y portal de clientes, con permisos por rol.

> Demostración. La firma, las personas, los casos y los importes son ficticios. No es un sistema productivo.

## Cómo está armado

Sitio estático, sin paso de compilación. Vercel lo publica tal cual.

| Archivo | Qué contiene |
|---|---|
| `index.html` | Estructura y estilos (paleta, tipografías, componentes) |
| `core.js` | Datos de demostración, reglas de negocio y control de acceso por rol |
| `ui.js` | Navegación, componentes compartidos, logotipo |
| `views-public.js` | Sitio público, ingreso, páginas legales y «Acerca de la demo» |
| `views-staff.js` | Paneles de administración y abogados |
| `views-client.js` | Portal del cliente |
| `boot.js` | Arranque |
| `img/` | Fotografías del equipo |
| `docs/schema.sql` | Modelo de base de datos para una versión productiva |

## Cómo modificarlo

1. Editá el archivo en GitHub (lápiz ✏️ en cada archivo) o en tu computadora.
2. Guardá el cambio con un *commit* en la rama `main`.
3. Vercel publica la nueva versión sola en uno o dos minutos.

Cambios frecuentes:
- **Textos del sitio:** `views-public.js`.
- **Colores y tipografías:** el bloque `:root` al comienzo del `<style>` en `index.html`.
- **Abogados, clientes, casos e importes de ejemplo:** la función `VA.seed` en `core.js`.
- **Fotos:** reemplazá los archivos en `img/` manteniendo el mismo nombre.

Los datos de la demo se guardan en el navegador de cada visitante. Si cambiás los datos de ejemplo, usá «Restablecer datos de demostración» para verlos.

## Usuarios de prueba (ficticios)

Contraseñas: administración `Demo-Admin-2026`, abogados `Demo-Abogado-2026`, clientes `Demo-Cliente-2026`. La lista completa aparece en la pantalla de ingreso.

## Probar en tu computadora

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```
