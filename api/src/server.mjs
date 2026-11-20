import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { createApp } from './app.mjs';

const env = process.env;
const database = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2, timeout: 20_000 }) : null;
const staticDir = env.STATIC_DIR ? resolve(env.STATIC_DIR) : null;
if (staticDir && !existsSync(resolve(staticDir, 'index.html'))) throw new Error('STATIC_DIR no contiene el frontend compilado.');
createApp({ env, database, stripe, staticDir }).listen(Number(env.PORT || 8788), '0.0.0.0', () => console.log('ChewyLab API lista.'));
