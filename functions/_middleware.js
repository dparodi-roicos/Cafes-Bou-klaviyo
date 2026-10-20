// Pide usuario y contraseña antes de enseñar la web cuando se publica en Cloudflare Pages.
// Aquí no hay ninguna contraseña: se guardan en Cloudflare (Settings > Variables and Secrets)
// como secretos USUARIO y CONTRASENA. Mientras no existan, la web no se muestra a nadie.
// En GitHub Pages este fichero no hace nada.
export async function onRequest({ request, next, env }) {
  if (!env.USUARIO || !env.CONTRASENA) {
    return new Response("Falta configurar el usuario y la contraseña en Cloudflare.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Basic ")) {
    let credenciales = "";
    try { credenciales = atob(auth.slice(6)); } catch (e) {}
    const i = credenciales.indexOf(":");
    if (i > -1 && iguales(credenciales.slice(0, i), env.USUARIO) && iguales(credenciales.slice(i + 1), env.CONTRASENA)) {
      return next();
    }
  }
  return new Response("Acceso restringido", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Informe Roicos", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

// Compara sin cortar en el primer carácter distinto, para no dar pistas por el tiempo de respuesta.
function iguales(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ (y[i % (y.length || 1)] || 0);
  return d === 0;
}
