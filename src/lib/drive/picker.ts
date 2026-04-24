"use client";

// Google Drive Picker integration — fully client-side.
// For Drive exports, Instagram creates a folder (not a ZIP).
// User picks the instagram-<username>-<date> folder,
// we find + download the relevant JSON files via Drive API.

import { parseInstagramFile } from "@/lib/instagram/parser";
import type { IGUser } from "@/lib/instagram/types";

declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function loadPicker(): Promise<void> {
  await loadScript("https://apis.google.com/js/api.js");
  await new Promise<void>((resolve) =>
    window.gapi.load("picker", { callback: resolve })
  );
}

async function loadGIS(): Promise<void> {
  await loadScript("https://accounts.google.com/gsi/client");
}

function getAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "https://www.googleapis.com/auth/drive.readonly",
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error));
        else resolve(resp.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

// Open picker in FOLDER mode — user picks instagram-<username>-<date> folder
function openFolderPicker(
  accessToken: string,
  apiKey: string
): Promise<google.picker.DocumentObject> {
  return new Promise((resolve, reject) => {
    const makeFolderView = () =>
      new window.google.picker.DocsView()
        .setSelectFolderEnabled(true)
        .setMimeTypes("application/vnd.google-apps.folder")
        .setIncludeFolders(true);

    const picker = new window.google.picker.PickerBuilder()
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setTitle('Select your "instagram-username-date" folder')
      .addView(makeFolderView())                                          // My Drive
      .addView(makeFolderView().setEnableDrives(true))                    // Shared drives
      .addView(
        new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
          .setSelectFolderEnabled(true)
          .setIncludeFolders(true)
          .setOwnedByMe(false)                                            // Shared with me
      )
      .addView(
        new window.google.picker.DocsView(window.google.picker.ViewId.RECENTLY_PICKED)
          .setSelectFolderEnabled(true)
          .setIncludeFolders(true)
      )                                                                   // Recent
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          resolve(data.docs![0]);
        } else if (data.action === window.google.picker.Action.CANCEL) {
          reject(new Error("cancelled"));
        }
      })
      .build();
    picker.setVisible(true);
  });
}

interface DriveFile {
  id: string;
  name: string;
}

// Search for JSON files inside the selected folder (and all subfolders)
async function findJsonFilesInFolder(
  folderId: string,
  accessToken: string
): Promise<DriveFile[]> {
  // Drive API: find all JSON files whose ancestors include the selected folder
  const query = encodeURIComponent(
    `'${folderId}' in ancestors and mimeType = 'application/json' and trashed = false`
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.error?.message || body?.error || res.status;
    throw new Error(`Drive API error (${res.status}): ${msg}`);
  }
  const data = await res.json();
  return data.files as DriveFile[];
}

async function downloadJsonFile(
  fileId: string,
  accessToken: string
): Promise<unknown> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Drive download failed: ${res.statusText}`);
  return res.json();
}

// Main entry point — picks folder, finds + downloads the right files, parses them
export async function pickInstagramFolderFromDrive(): Promise<{
  followers: IGUser[];
  following: IGUser[];
}> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error("Google Drive integration is not configured.");
  }

  await Promise.all([loadPicker(), loadGIS()]);

  const accessToken = await getAccessToken(clientId);
  const folder = await openFolderPicker(accessToken, apiKey);

  const files = await findJsonFilesInFolder(folder.id, accessToken);

  // Find followers pages (followers_1.json, followers_2.json, ...)
  const followerFiles = files.filter((f) =>
    /^followers_\d+\.json$/i.test(f.name)
  );
  // Find following.json
  const followingFile = files.find((f) =>
    /^following\.json$/i.test(f.name)
  );

  if (followerFiles.length === 0) {
    throw new Error(
      'No followers file found in that folder. Make sure you selected the "instagram-username-date" folder.'
    );
  }
  if (!followingFile) {
    throw new Error(
      'No following.json found in that folder. Make sure you selected the "instagram-username-date" folder.'
    );
  }

  // Download + parse all in parallel
  const followerPages = await Promise.all(
    followerFiles.map(async (f) => {
      const raw = await downloadJsonFile(f.id, accessToken);
      return parseInstagramFile(raw);
    })
  );
  const followers = followerPages.flat();

  const followingRaw = await downloadJsonFile(followingFile.id, accessToken);
  const followingArray = Array.isArray(followingRaw)
    ? followingRaw
    : (followingRaw as Record<string, unknown>)?.relationships_following ?? [];
  const following = parseInstagramFile(followingArray as unknown[]);

  return { followers, following };
}
