import Script from 'next/script';

export function CloudflareAnalytics() {
  const token =
    process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN || '4acd7655f8804ea5bf6608b9c690451b';
  if (!token || process.env.VERCEL_ENV !== 'production') return null;
  if (!/^[a-f0-9]{32}$/i.test(token))
    throw new Error('Cloudflare analytics token must contain 32 hexadecimal characters.');
  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
      strategy="afterInteractive"
    />
  );
}
