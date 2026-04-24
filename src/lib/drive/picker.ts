"use client";

// Google Drive Picker integration — fully client-side.
// Uses Google Identity Services (token client) + Google Picker API.
// Access token is short-lived (1hr), never stored — only held in memory.

declare global {
  interface Window {
    gapi: typeof gapi;
    google: typeof google;
  }
}

// Dynamically load a script tag once
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

// Load gapi + picker module
async function loadPicker(): Promise<void> {
  await loadScript("https://apis.google.com/js/api.js");
  await new Promise<void>((resolve) =>
    window.gapi.load("picker", { callback: resolve })
  );
}

// Load Google Identity Services
async function loadGIS(): Promise<void> {
  await loadScript("https://accounts.google.com/gsi/client");
}

// Get a short-lived access token with drive.readonly scope
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
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

// Open Google Picker and resolve with selected file metadata
function openPicker(accessToken: string, apiKey: string): Promise<google.picker.DocumentObject> {
  return new Promise((resolve, reject) => {
    const picker = new window.google.picker.PickerBuilder()
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setTitle("Select your Instagram export ZIP")
      .addView(
        new window.google.picker.DocsView()
          .setMimeTypes("application/zip,application/x-zip-compressed")
          .setSelectFolderEnabled(false)
      )
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

// Download a Drive file as a Blob using the access token
async function downloadDriveFile(fileId: string, accessToken: string): Promise<Blob> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Drive download failed: ${res.statusText}`);
  return res.blob();
}

// Main entry point — call this when user clicks "Import from Drive"
export async function pickInstagramZipFromDrive(): Promise<File> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;

  if (!clientId || !apiKey) {
    throw new Error("Google Drive integration is not configured.");
  }

  await Promise.all([loadPicker(), loadGIS()]);

  const accessToken = await getAccessToken(clientId);
  const doc = await openPicker(accessToken, apiKey);

  const blob = await downloadDriveFile(doc.id, accessToken);
  // Wrap Blob in a File so existing useFileProcessor can handle it
  return new File([blob], doc.name || "instagram-export.zip", {
    type: "application/zip",
  });
}
