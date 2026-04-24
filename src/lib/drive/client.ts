// Stub — Google Drive integration not yet implemented.
// When building this out:
// 1. Add GOOGLE_DRIVE_CLIENT_ID / SECRET to .env.local
// 2. Implement /api/drive/route.ts for token exchange
// 3. Replace the stubs below with real fetch calls to Drive API v3

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
}

export async function listRecentExports(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _accessToken: string
): Promise<DriveFile[]> {
  throw new Error("Google Drive integration not yet enabled.");
}

export async function downloadFile(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _accessToken: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _fileId: string
): Promise<Blob> {
  throw new Error("Google Drive integration not yet enabled.");
}
