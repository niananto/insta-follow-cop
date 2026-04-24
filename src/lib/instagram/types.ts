// Raw shape from Instagram GDPR export JSON files
export interface InstagramEntry {
  string_list_data: Array<{
    href: string;      // "https://www.instagram.com/username"
    value: string;     // username
    timestamp: number; // Unix seconds
  }>;
}

// Normalised internal representation
export interface IGUser {
  username: string;
  profileUrl: string;
  followedAt: Date;
}

// Final analysis output
export interface AnalysisResult {
  followers: IGUser[];
  following: IGUser[];
  notFollowingBack: IGUser[]; // you follow them, they don't follow you back
  notFollowedBack: IGUser[];  // they follow you, you don't follow them back
  analyzedAt: Date;
  sourceType: "zip" | "json";
}
