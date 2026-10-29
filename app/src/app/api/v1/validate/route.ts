import { handleSandboxRequest } from '@/src/lib/sandbox-validation.mjs';

export const runtime = 'nodejs';
export const POST = handleSandboxRequest;
