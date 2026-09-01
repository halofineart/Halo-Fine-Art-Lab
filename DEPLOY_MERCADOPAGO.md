# Poner en marcha Mercado Pago — guía rápida

El código ya está listo. Esto es lo que falta hacer **una sola vez**, desde los
paneles de Vercel / Mercado Pago (no requiere tocar código).

## 1. Variables de entorno en Vercel

Proyecto **halo-fine-art-lab** → Settings → Environment Variables. Agregar
(marcadas para Production, Preview y Development):

| Variable | De dónde sale | Secreta |
|---|---|---|
| `MP_ACCESS_TOKEN` | Mercado Pago Developers → Tu aplicación → Credenciales de producción (o de prueba) → **Access Token** | Sí |
| `MP_WEBHOOK_SECRET` | Se genera al configurar el webhook (paso 2) | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role secret** | Sí |
| `VITE_SUPABASE_URL` | Ya debería estar configurada | No |
| `VITE_SUPABASE_ANON_KEY` | Ya debería estar configurada | No |

No hace falta `VITE_MP_PUBLIC_KEY` — el checkout actual redirige a Mercado
Pago (Checkout Pro), no usa el Public Key en el navegador.

## 2. Configurar el webhook en Mercado Pago

Developers → Tu aplicación → **Webhooks** → Agregar URL:

```
https://<tu-dominio-de-producción>/api/mp-webhook
```

Evento a suscribir: **Pagos**. Al guardar, Mercado Pago te muestra una
"Firma secreta" — copiala en `MP_WEBHOOK_SECRET` (paso 1) y volvé a
desplegar (o simplemente esperá el próximo deploy).

## 3. Probar antes de cobrar de verdad

1. Cargá primero las **credenciales de prueba** (pestaña "Credenciales de
   prueba" en el mismo panel) en `MP_ACCESS_TOKEN`.
2. Hacé una compra de prueba en el sitio con un
   [usuario de prueba comprador](https://www.mercadopago.com.ar/developers/panel/test-users)
   de Mercado Pago.
3. Confirmá que:
   - Te redirige al Checkout de Mercado Pago y de vuelta al sitio.
   - La orden aparece en el panel de Admin (⚙️ Taller) con el pago
     "Acreditado".
   - El Tracker de Pedido del cliente muestra la orden.
4. Recién ahí, reemplazá `MP_ACCESS_TOKEN` por el de **producción** y volvé
   a desplegar.

## 4. Antes de anunciar que la tienda está online

- **Reemplazar los datos bancarios de ejemplo** en
  `src/data/mockData.ts` (`STORE_CONFIG.bankDetails`: CBU, alias, CUIT) —
  hoy son valores de muestra, no la cuenta real de HALO. Esto solo afecta a
  la opción "Transferencia Bancaria" (10% OFF), que sigue siendo manual (el
  cliente transfiere y ustedes confirman a mano).
- Revisar `STORE_CONFIG.whatsappRaw` / `email` en el mismo archivo.
- Un usuario con `profiles.is_admin = true` en Supabase es quien puede
  entrar al panel de Taller (botón en el footer). Si todavía no tenés uno,
  creá tu cuenta en el sitio y desde Supabase → Table Editor → `profiles`
  marcá `is_admin = true` en tu fila.

## Cómo queda el flujo de pago

1. Cliente completa el carrito y elige "Mercado Pago" o "Tarjetas" →
   ambas opciones van al mismo Checkout Pro real de Mercado Pago (ahí el
   cliente elige tarjeta, cuotas, dinero en cuenta, etc.).
2. `/api/create-preference` crea la orden en Supabase (`payment_status:
   pending`) y la preferencia de pago, y redirige al cliente a Mercado Pago.
3. El cliente paga. Mercado Pago redirige de vuelta al sitio
   (`/?mp_return=success&order=...`) y, en paralelo, notifica a
   `/api/mp-webhook` — **esa notificación es la que realmente confirma el
   pago** en la base de datos (nunca el simple regreso del navegador).
4. La pantalla de confirmación consulta `/api/order-status` hasta ver el
   pago acreditado (reintenta unos segundos si el webhook todavía no llegó).
5. "Transferencia Bancaria" sigue siendo 100% manual, como antes: se
   muestran los datos, el cliente transfiere y confirma por WhatsApp/email.
