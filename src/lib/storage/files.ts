import { mkdir, writeFile, readFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const STORAGE_DIR = process.env.STORAGE_DIR ?? "./storage";

export function getStorageDir() {
  return path.resolve(process.cwd(), STORAGE_DIR);
}

export async function ensureStorageSubdir(subdir: string) {
  const dir = path.join(getStorageDir(), subdir);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function saveBuffer(
  buffer: Buffer,
  subdir: string,
  ext: string
): Promise<{ url: string; filePath: string; filename: string }> {
  const dir = await ensureStorageSubdir(subdir);
  const filename = `${uuidv4()}.${ext}`;
  const filePath = path.join(dir, filename);
  await writeFile(filePath, buffer);
  return {
    url: `/api/files/${subdir}/${filename}`,
    filePath,
    filename,
  };
}

export async function saveBase64Image(
  dataUrl: string,
  subdir = "images"
): Promise<{ url: string; filePath: string }> {
  const match = dataUrl.match(/^data:image\/([\w+.-]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid base64 image");
  const mimeSub = match[1];
  const ext = mimeSub === "jpeg" ? "jpg" : mimeSub === "svg+xml" ? "svg" : mimeSub;
  const buffer = Buffer.from(match[2], "base64");
  const result = await saveBuffer(buffer, subdir, ext);
  return { url: result.url, filePath: result.filePath };
}

export async function saveRemoteFile(
  remoteUrl: string,
  subdir: string,
  ext: string
): Promise<{ url: string; filePath: string }> {
  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to download: ${remoteUrl}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const result = await saveBuffer(buffer, subdir, ext);
  return { url: result.url, filePath: result.filePath };
}

export function resolveStoragePath(relativePath: string): string {
  const base = getStorageDir();
  const resolved = path.resolve(base, relativePath);
  if (!resolved.startsWith(base)) throw new Error("Invalid path");
  return resolved;
}

export async function readStorageFile(relativePath: string): Promise<Buffer> {
  return readFile(resolveStoragePath(relativePath));
}
