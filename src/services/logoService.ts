import crypto from 'node:crypto';

export type LogoAnalysis = {
  status: 'VERIFIED_MATCH' | 'POSSIBLE_MISMATCH' | 'UNABLE_TO_VERIFY' | 'NO_LOGO_PROVIDED';
  score: number;
  confidence: number;
  companyDomain?: string;
  officialLogoUrl?: string;
  reasons: string[];
  checks: string[];
};

const MAX_BYTES = 5 * 1024 * 1024;

function sha256(buf: Buffer) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function absoluteUrl(value: string, base: string) {
  try { return new URL(value, base).toString(); } catch { return ''; }
}

function extractCandidates(html: string, base: string): string[] {
  const candidates: string[] = [];
  const add = (v?: string) => {
    if (!v) return;
    const u = absoluteUrl(v.trim(), base);
    if (u && /^https?:\/\//i.test(u) && !candidates.includes(u)) candidates.push(u);
  };

  // OpenGraph image is commonly used as a company brand asset.
  for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi)) add(m[1]);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*>/gi)) add(m[1]);

  // Prefer image tags whose alt/class/id/title mention logo or brand.
  for (const m of html.matchAll(/<img\b([^>]+)>/gi)) {
    const tag = m[1];
    if (/logo|brand|company/i.test(tag)) {
      const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
      const srcset = tag.match(/\bsrcset\s*=\s*["']([^"']+)["']/i)?.[1];
      add(src);
      if (srcset) add(srcset.split(',')[0].trim().split(/\s+/)[0]);
    }
  }

  // Common icon links are useful fallback brand assets.
  for (const m of html.matchAll(/<link\b([^>]+)>/gi)) {
    const tag = m[1];
    if (/icon|apple-touch-icon/i.test(tag)) {
      add(tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1]);
    }
  }

  add('/favicon.ico');
  return candidates.slice(0, 8);
}

async function fetchBuffer(url: string) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Phishing Scutum-LogoVerifier/1.0' }, signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.startsWith('image/') && !url.toLowerCase().includes('.svg')) throw new Error('Not an image');
  const ab = await response.arrayBuffer();
  const buf = Buffer.from(ab);
  if (buf.length === 0 || buf.length > MAX_BYTES) throw new Error('Invalid image size');
  return buf;
}

export async function analyzeLogoAuthenticity(imageData: string | undefined, domain = ''): Promise<LogoAnalysis> {
  if (!imageData) return { status: 'NO_LOGO_PROVIDED', score: 0, confidence: 0, companyDomain: domain || undefined, reasons: ['No company logo was uploaded for analysis.'], checks: ['Upload the logo shown in the job message or application page.'] };
  if (!/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(imageData)) {
    return { status: 'UNABLE_TO_VERIFY', score: 0, confidence: 20, companyDomain: domain || undefined, reasons: ['The uploaded logo format is not supported for this verification check.'], checks: ['Use a PNG, JPG, WEBP, GIF or SVG logo image.'] };
  }
  let uploaded: Buffer;
  try {
    uploaded = Buffer.from(imageData.split(',')[1], 'base64');
    if (!uploaded.length || uploaded.length > MAX_BYTES) throw new Error('size');
  } catch {
    return { status: 'UNABLE_TO_VERIFY', score: 0, confidence: 20, companyDomain: domain || undefined, reasons: ['The uploaded logo could not be decoded safely.'], checks: ['Upload a valid logo image below 5 MB.'] };
  }

  let normalizedDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  if (!normalizedDomain || !normalizedDomain.includes('.')) {
    return { status: 'UNABLE_TO_VERIFY', score: 0, confidence: 25, reasons: ['No official company domain was available, so the logo cannot be compared with an authoritative source.'], checks: ['Enter the company’s official website/domain and compare the logo there.'] };
  }

  const base = `https://${normalizedDomain}`;
  try {
    const page = await fetch(base, { redirect: 'follow', headers: { 'User-Agent': 'Phishing Scutum-LogoVerifier/1.0' }, signal: AbortSignal.timeout(7000) });
    if (!page.ok) throw new Error(`Company site HTTP ${page.status}`);
    const html = await page.text();
    const candidates = extractCandidates(html, page.url || base);
    const uploadedHash = sha256(uploaded);

    for (const candidate of candidates) {
      try {
        const official = await fetchBuffer(candidate);
        if (sha256(official) === uploadedHash) {
          return {
            status: 'VERIFIED_MATCH', score: 0, confidence: 96, companyDomain: normalizedDomain, officialLogoUrl: candidate,
            reasons: ['The uploaded logo exactly matches a logo/brand image served by the supplied official company domain.'],
            checks: ['Logo source match confirmed. Continue checking the recruiter, message, URL and payment requests separately.']
          };
        }
      } catch { /* try the next official asset */ }
    }

    return {
      status: 'POSSIBLE_MISMATCH', score: 18, confidence: 72, companyDomain: normalizedDomain, officialLogoUrl: candidates[0],
      reasons: ['The uploaded logo did not exactly match the logo/brand assets found on the supplied official domain.', 'A copied or altered logo can be used to impersonate a legitimate company. This is a warning signal, not proof that the logo is fake.'],
      checks: ['Open the official company website independently and compare the logo, colors and wording.', 'Check the recruiter email domain and application URL against the official company domain.']
    };
  } catch (e: any) {
    return {
      status: 'UNABLE_TO_VERIFY', score: 5, confidence: 35, companyDomain: normalizedDomain,
      reasons: ['The official company website could not be reached or its logo assets could not be compared automatically.'],
      checks: ['Manually compare the logo with the official company website before trusting the opportunity.']
    };
  }
}
