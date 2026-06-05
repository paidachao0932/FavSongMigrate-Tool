export interface RecognizedSong {
  id: string;
  title: string;
  artist: string;
}

export interface MatchResult {
  query: { title: string; artist: string };
  matched: boolean;
  confidence: number;
  bestMatch: {
    platformId: string;
    title: string;
    artist: string;
    album?: string;
  } | null;
  duplicate: boolean;
}

export interface MigrateDetail {
  title: string;
  artist: string;
  status: 'imported' | 'duplicate' | 'not_found';
  platformId?: string;
}

export interface MigrateResult {
  playlistId: string;
  playlistName: string;
  total: number;
  imported: number;
  skippedDuplicates: number;
  notFound: number;
  details: MigrateDetail[];
}
