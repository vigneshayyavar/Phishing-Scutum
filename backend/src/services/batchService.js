import { analyzeRisk, companyFromInput } from './riskService.js';
export async function runBatch(items, concurrency = 128) {
    const results = new Array(items.length);
    let cursor = 0;
    const worker = async () => {
        while (true) {
            const index = cursor++;
            if (index >= items.length)
                return;
            const item = items[index];
            const inputText = String(item.inputText ?? '').slice(0, 12000);
            const url = String(item.url ?? '').slice(0, 2000);
            const risk = analyzeRisk(inputText, url);
            results[index] = { index, ...risk, companyVerification: companyFromInput(inputText, url) };
            // Yield regularly so a 10k batch never blocks the Node event loop for a long synchronous turn.
            if (index % 256 === 0)
                await new Promise(resolve => setImmediate(resolve));
        }
    };
    const workers = Array.from({ length: Math.min(Math.max(1, concurrency), items.length || 1) }, () => worker());
    await Promise.all(workers);
    return results;
}
export async function holdUntil(startedAt, targetMs) {
    const remaining = Math.max(0, targetMs - (Date.now() - startedAt));
    if (remaining > 0)
        await new Promise(resolve => setTimeout(resolve, remaining));
}
