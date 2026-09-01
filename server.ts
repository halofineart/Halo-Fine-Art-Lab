import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Simple health check for uptime monitoring / deploy platforms.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// NOTE: in production this app is deployed on Vercel, which serves
// everything under /api/*.ts as its own serverless functions and never
// runs this file at all (Vercel's "vite" framework preset only builds and
// serves the static `dist/` output — see vercel.json-less zero-config
// detection). This local Express server never sees those requests either
// way, so the routes below exist purely so `npm run dev` can exercise the
// same Mercado Pago flow without needing `vercel dev` / the Vercel CLI.
// Vercel's (req, res) handler shape is close enough to Express's that the
// same handler functions work unmodified here.
async function mountLocalApiRoutes() {
  const [{ default: createPreference }, { default: mpWebhook }, { default: orderStatus }] = await Promise.all([
    import('./api/create-preference'),
    import('./api/mp-webhook'),
    import('./api/order-status'),
  ]);
  app.post('/api/create-preference', (req, res) => createPreference(req as any, res as any));
  app.all('/api/mp-webhook', (req, res) => mpWebhook(req as any, res as any));
  app.get('/api/order-status', (req, res) => orderStatus(req as any, res as any));
}

// Vite middleware integration for development / production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    await mountLocalApiRoutes().catch((err) => {
      console.warn('No se pudieron montar las rutas /api locales (Mercado Pago):', err);
    });
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HALO Fine Art Lab server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
