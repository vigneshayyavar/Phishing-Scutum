const patterns = [
  { key: 'PAYMENT_REQUEST', weight: 28, re: /\b(pay|payment|fee|registration fee|deposit|processing fee|training fee|security deposit|refundable fee|upi)\b/i, reason: 'The message contains language associated with upfront fees, deposits or payment instructions.' },
  { key: 'HIGH_PRESSURE_LANGUAGE', weight: 14, re: /\b(urgent|immediately|today|within\s+\d+\s+hours?|limited slots?|act now|last chance|respond now|expire|deadline)\b/i, reason: 'The message creates urgency or pressure to act quickly.' },
  { key: 'UNREALISTIC_PROMISE', weight: 18, re: /\b(guaranteed|guarantee|100%\s+selected|instant job|no interview|work from home\s+and\s+earn|easy money|dream salary|effortless)\b/i, reason: 'The offer contains unusually strong guarantees, effortless outcomes or selection claims.' },
  { key: 'SENSITIVE_DATA_REQUEST', weight: 25, re: /\b(otp|cvv|pin|bank password|upi pin|card number|net banking|crypto wallet|seed phrase)\b/i, reason: 'The message appears to request highly sensitive credentials or financial information.' },
  { key: 'IDENTITY_IMPERSONATION', weight: 16, re: /\b(hr|recruiter|hiring manager|talent acquisition)\b.{0,100}\b(whatsapp|telegram|personal number|gmail|yahoo|outlook|hotmail)\b/i, reason: 'The message combines a recruiting identity with a personal or informal contact channel.' },
  { key: 'DOCUMENT_PRESSURE', weight: 12, re: /\b(send|share|upload)\b.{0,100}\b(aadhaar|pan card|passport|bank statement|salary slip|government id|identity proof)\b/i, reason: 'The message asks for sensitive identity or financial documents before the opportunity is independently verified.' },
];
const freeEmail = /@(gmail|yahoo|outlook|hotmail|protonmail|icloud)\.(com|in|co\.uk)$/i;
const suspiciousHost = /(free|apply-now|applynow|job-portal|jobportal|verify-account|offer|selection|careers-update|hr-team|secure-login)/i;

function normalize(input: string) { return input.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, ' ').replace(/\s+/g, ' ').trim(); }

export type RiskResult = ReturnType<typeof analyzeRisk>;

export function analyzeRisk(inputText: string, url = '') {
  const text = normalize(inputText);
  let score = 8;
  const categories: string[] = [];
  const reasons: string[] = [];
  const psychologicalTriggers: {type:string; label:string; evidence:string; severity:'LOW'|'MEDIUM'|'HIGH'}[] = [];
  const verificationChecks: string[] = [];
  const signalBreakdown: {signal:string; impact:number; explanation:string}[] = [];

  for (const p of patterns) {
    if (p.re.test(text)) {
      score += p.weight; categories.push(p.key); reasons.push(p.reason);
      signalBreakdown.push({ signal: p.key, impact: p.weight, explanation: p.reason });
    }
  }

  // Psychological manipulation layer from the Cyber Attacks Analysis brief.
  if (/\b(urgent|immediately|today|within\s+\d+\s+hours?|limited slots?|act now|last chance|respond now|expire|deadline)\b/i.test(text)) {
    psychologicalTriggers.push({ type:'SCARCITY_URGENCY', label:'Scarcity & urgency', evidence:'Creates a deadline, limited-slot or immediate-action pressure.', severity:'HIGH' });
    verificationChecks.push('Pause before acting on deadlines or “limited slot” claims; verify independently first.');
  }
  if (/\b(guaranteed|100%\s+selected|instant job|no interview|easy money|dream salary|effortless|earn\s+\₹?\s*[\d,]+\s*(per|\/)?\s*(day|week|month)?)\b/i.test(text)) {
    psychologicalTriggers.push({ type:'GREED_DESIRE', label:'Greed & desire', evidence:'Uses unusually attractive salary, guaranteed selection or effortless-career promises.', severity:'HIGH' });
    verificationChecks.push('Compare salary, role and selection claims with the employer’s official careers information.');
  }
  if (/\b(terminate|blacklist|legal action|account will be closed|last warning|penalty|police|deactivate|you will lose)\b/i.test(text)) {
    psychologicalTriggers.push({ type:'FEAR_ANXIETY', label:'Fear & anxiety', evidence:'Uses threats, penalties or consequences to make the recipient act without checking.', severity:'HIGH' });
    verificationChecks.push('Do not respond to threats or penalties through the provided link; contact the organization through an independent channel.');
  }

  if (url.trim()) {
    try {
      const u = new URL(url.trim()); const host = u.hostname.toLowerCase();
      if (!['https:', 'http:'].includes(u.protocol)) { score += 20; categories.push('UNSUPPORTED_URL'); reasons.push('The supplied link uses an unexpected URL protocol.'); signalBreakdown.push({signal:'UNSUPPORTED_URL',impact:20,explanation:'Unexpected URL protocol.'}); }
      if (u.protocol === 'http:') { score += 12; categories.push('INSECURE_URL'); reasons.push('The application link uses HTTP instead of HTTPS.'); signalBreakdown.push({signal:'INSECURE_URL',impact:12,explanation:'Application link is not using HTTPS.'}); }
      if (suspiciousHost.test(host)) { score += 16; categories.push('SUSPICIOUS_URL'); reasons.push('The URL hostname contains patterns that warrant independent verification.'); signalBreakdown.push({signal:'SUSPICIOUS_URL',impact:16,explanation:'Hostname contains suspicious job/account/offer patterns.'}); }
      if (host.split('.').length > 3) { score += 8; categories.push('COMPLEX_DOMAIN'); reasons.push('The application URL uses a multi-level hostname that warrants additional verification.'); signalBreakdown.push({signal:'COMPLEX_DOMAIN',impact:8,explanation:'Multi-level hostname needs extra scrutiny.'}); }
      if (u.username || u.password) { score += 20; categories.push('CREDENTIAL_URL'); reasons.push('The URL contains embedded credentials, which is unusual for a normal job application link.'); signalBreakdown.push({signal:'CREDENTIAL_URL',impact:20,explanation:'URL contains embedded credentials.'}); }
      verificationChecks.push(`Open the employer’s official website separately and confirm that this exact domain is listed for recruitment.`);
    } catch { score += 20; categories.push('INVALID_URL'); reasons.push('The supplied URL could not be parsed as a normal web address.'); signalBreakdown.push({signal:'INVALID_URL',impact:20,explanation:'URL could not be parsed.'}); }
  }

  const emailMatch = text.match(/[\w.+-]+@([\w.-]+\.[A-Za-z]{2,})/);
  if (emailMatch && freeEmail.test(emailMatch[0])) {
    score += 10; categories.push('UNVERIFIED_RECRUITER'); reasons.push('The message uses a consumer email provider rather than an identifiable company domain.'); signalBreakdown.push({signal:'UNVERIFIED_RECRUITER',impact:10,explanation:'Consumer email domain makes recruiter identity harder to verify.'});
    verificationChecks.push('Verify the recruiter from the company’s official careers page instead of trusting the email signature.');
  }
  if (/\b(whatsapp|telegram)\b/i.test(text)) {
    score += 7; categories.push('OFF_PLATFORM_CONTACT'); reasons.push('The message asks or encourages communication through an off-platform messaging service.'); signalBreakdown.push({signal:'OFF_PLATFORM_CONTACT',impact:7,explanation:'Recruitment is being moved to an informal messaging channel.'});
  }
  if (/\b(pay|payment|fee|deposit|registration fee|processing fee|training fee)\b/i.test(text)) verificationChecks.push('Never pay to apply, interview, receive an offer or unlock a job.');
  if (/\b(otp|cvv|pin|bank password|upi pin|card number|net banking)\b/i.test(text)) verificationChecks.push('Never share OTPs, PINs, CVV, passwords or banking credentials with a recruiter.');
  if (/\b(aadhaar|pan card|passport|bank statement|salary slip|government id)\b/i.test(text)) verificationChecks.push('Share identity documents only after independently confirming the employer and legitimate onboarding process.');

  if (categories.length === 0) reasons.push('No strong scam signals were detected in the supplied content. Continue normal verification before sharing sensitive information.');
  score = Math.min(100, Math.max(0, score));
  const riskLevel = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
  const recommendations = score >= 60
    ? ['Do not make any upfront payment.', 'Verify the recruiter through the company’s official website or published contact details.', 'Do not submit sensitive financial or identity credentials until the opportunity is independently verified.', 'Pause if the message uses urgency, fear or unusually attractive promises.']
    : ['Verify the recruiter and company using official channels.', 'Review the application domain carefully before submitting documents.', 'Treat this assessment as a risk signal, not proof of legitimacy.'];
  const confidence = Math.min(98, 55 + categories.length * 7 + psychologicalTriggers.length * 8);
  const aiSummary = riskLevel === 'LOW'
    ? 'No strong career-scam pattern was detected. Continue independent verification before applying.'
    : `The assessment combines ${categories.length || 1} technical/recruiter signal${categories.length === 1 ? '' : 's'}${psychologicalTriggers.length ? ` and ${psychologicalTriggers.length} psychological trigger${psychologicalTriggers.length === 1 ? '' : 's'}` : ''}. The result is a contextual risk estimate, not a verdict.`;
  return { riskScore: score, riskLevel, confidence, categories: [...new Set(categories)], reasons, recommendations, psychologicalTriggers, verificationChecks: [...new Set(verificationChecks)], signalBreakdown, aiSummary };
}

export function companyFromInput(inputText: string, url = '') {
  let domain = ''; try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch {}
  const email = inputText.match(/[\w.+-]+@([\w.-]+\.[A-Za-z]{2,})/)?.[1]; domain = domain || email || '';
  return { name: domain ? domain.split('.')[0].replace(/[-_]/g, ' ') : 'Unknown company', domain: domain || undefined, verified: false, status: domain ? 'Verification incomplete — independently verify this company/domain' : 'No company signal available' };
}
