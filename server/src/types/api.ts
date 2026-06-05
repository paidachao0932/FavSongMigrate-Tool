export interface BatchSearchRequest {
  songs: { title: string; artist: string }[];
  cookie: string;
}

export interface BatchSearchResponse {
  results: {
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
  }[];
}

export interface CreatePlaylistRequest {
  name: string;
  cookie: string;
}

export interface AddSongsRequest {
  playlistId: string;
  songIds: string[];
  cookie: string;
}

export interface MigrateRequest {
  songs: { title: string; artist: string }[];
  playlistName: string;
  cookie: string;
  skipDuplicates: boolean;
}

export interface MigrateResponse {
  playlistId: string;
  playlistName: string;
  total: number;
  imported: number;
  skippedDuplicates: number;
  notFound: number;
  details: {
    title: string;
    artist: string;
    status: 'imported' | 'duplicate' | 'not_found';
    platformId?: string;
  }[];
}
