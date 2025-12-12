import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference'
import Account from './routes/account';
import { cors } from 'hono/cors';

const app = new OpenAPIHono();
app.openAPIRegistry.registerComponent("securitySchemes", "OAuth2" ,{
    type: "oauth2",
    flows: {
      password: {
        tokenUrl: '/account/login',
        scopes: {}
      }
    }
});
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Michael Machohi',
  },
});
app.get(
  '/',
  Scalar({
    url: '/openapi.json',
    pageTitle: 'MM API',
    theme: 'bluePlanet',
    hideDarkModeToggle: true,
    persistAuth: true,
  })
);
app.use('*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://2025agvrobotics.tech'],
    credentials: true,
  })
)
app.route('/account', Account);

export default app;

