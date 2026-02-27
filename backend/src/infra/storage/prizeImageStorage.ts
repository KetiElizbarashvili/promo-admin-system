import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env';

function sanitizeFilename(filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, '').toLowerCase();
  return base.replace(/[^a-z0-9-_]/g, '-').slice(0, 60) || 'prize-image';
}

function getUploadsRootDir(): string {
  return path.isAbsolute(env.UPLOAD_DIR)
    ? env.UPLOAD_DIR
    : path.join(process.cwd(), env.UPLOAD_DIR);
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function uploadPrizeImage(fileBuffer: Buffer, originalName: string): Promise<string> {
  const uploadsRoot = getUploadsRootDir();
  const prizeDir = path.join(uploadsRoot, 'prizes');
  await mkdir(prizeDir, { recursive: true });

  const originalExt = path.extname(originalName).toLowerCase();
  const extension = originalExt || '.jpg';
  const filename = `${Date.now()}-${randomUUID()}-${sanitizeFilename(originalName)}${extension}`;
  const absolutePath = path.join(prizeDir, filename);

  await writeFile(absolutePath, fileBuffer);

  const publicBaseUrl = normalizeBaseUrl(env.PUBLIC_BASE_URL);
  return `${publicBaseUrl}/uploads/prizes/${filename}`;
}
