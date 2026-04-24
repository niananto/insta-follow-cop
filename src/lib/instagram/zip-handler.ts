import JSZip from "jszip";
import { parseInstagramFile } from "./parser";
import type { IGUser } from "./types";

/**
 * Extract and parse Instagram follower/following data from a ZIP export.
 * Handles paginated follower files (followers_1.json, followers_2.json, etc.)
 */
export async function extractInstagramFiles(zipFile: File): Promise<{
  followers: IGUser[];
  following: IGUser[];
}> {
  const zip = await JSZip.loadAsync(zipFile);

  // Collect all file entries
  const fileNames = Object.keys(zip.files);

  // Find followers pages (followers_1.json, followers_2.json, ...)
  const followerFileNames = fileNames.filter((name) =>
    /connections\/followers_and_following\/followers_\d+\.json$/i.test(name)
  );

  // Find following file
  const followingFileName = fileNames.find((name) =>
    /connections\/followers_and_following\/following\.json$/i.test(name)
  );

  if (followerFileNames.length === 0) {
    throw new Error(
      "Could not find followers_1.json in the ZIP. Make sure you're uploading an Instagram data export."
    );
  }

  if (!followingFileName) {
    throw new Error(
      "Could not find following.json in the ZIP. Make sure you're uploading an Instagram data export."
    );
  }

  // Parse all follower pages and merge
  const followerPages = await Promise.all(
    followerFileNames.map(async (name) => {
      const content = await zip.files[name].async("string");
      return parseInstagramFile(JSON.parse(content));
    })
  );
  const followers = followerPages.flat();

  // Parse following
  const followingContent = await zip.files[followingFileName].async("string");
  const followingRaw = JSON.parse(followingContent);

  // following.json can be { relationships_following: [...] } or a plain array
  const followingArray =
    Array.isArray(followingRaw)
      ? followingRaw
      : followingRaw?.relationships_following ?? [];

  const following = parseInstagramFile(followingArray);

  return { followers, following };
}

/**
 * Parse Instagram files from a FileList (user selected individual JSON files).
 * Expects at least one followers*.json and one following.json.
 */
export async function parseJsonFiles(files: FileList): Promise<{
  followers: IGUser[];
  following: IGUser[];
}> {
  const fileArray = Array.from(files);

  const followerFiles = fileArray.filter((f) =>
    /followers_?\d*\.json$/i.test(f.name)
  );
  const followingFile = fileArray.find((f) =>
    /following\.json$/i.test(f.name)
  );

  if (followerFiles.length === 0) {
    throw new Error(
      'No followers file found. Please include your "followers_1.json" file.'
    );
  }
  if (!followingFile) {
    throw new Error(
      'No following file found. Please include your "following.json" file.'
    );
  }

  const readJson = (file: File) =>
    new Promise<unknown>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          resolve(JSON.parse(e.target?.result as string));
        } catch {
          reject(new Error(`Failed to parse ${file.name} as JSON`));
        }
      };
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsText(file);
    });

  const followerPages = await Promise.all(
    followerFiles.map(async (f) => parseInstagramFile(await readJson(f)))
  );
  const followers = followerPages.flat();

  const followingRaw = await readJson(followingFile);
  const followingArray = Array.isArray(followingRaw)
    ? followingRaw
    : (followingRaw as Record<string, unknown>)?.relationships_following ?? [];
  const following = parseInstagramFile(followingArray as unknown[]);

  return { followers, following };
}
