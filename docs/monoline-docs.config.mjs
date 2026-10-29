import { loadConfig } from '@chitrank2050/monoline-docs';
import { fileURLToPath } from 'node:url';

const config = await loadConfig({
  config: fileURLToPath(new URL('./monoline-docs.yml', import.meta.url)),
});
const token = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
if (process.env.VERCEL_ENV === 'production' && token) {
  if (!/^[a-f0-9]{32}$/i.test(token)) {
    throw new Error('NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN must contain 32 hexadecimal characters.');
  }
  config.integrations = {
    scripts: [`https://static.cloudflareinsights.com/beacon.min.js?token=${token}`],
  };
}
export default config;
