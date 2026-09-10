import { createWriteStream } from 'fs';
import { join } from 'path';

const logFile = join(process.cwd(), 'server-errors.log');
const logStream = createWriteStream(logFile, { flags: 'a' });

export function logError(context: string, error: any) {
  const timestamp = new Date().toISOString();
  const errorMsg = `
[${timestamp}] ${context}
Error: ${error?.message || error}
Code: ${error?.code || 'N/A'}
Stack: ${error?.stack || 'N/A'}
---
`;
  console.error(errorMsg);
  logStream.write(errorMsg);
}

export function logInfo(context: string, data: any) {
  const timestamp = new Date().toISOString();
  const msg = `[${timestamp}] ${context}: ${JSON.stringify(data, null, 2)}\n`;
  console.log(msg);
  logStream.write(msg);
}
