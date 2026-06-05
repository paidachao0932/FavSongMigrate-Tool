export interface Song {
  platformId: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
}

export interface SearchQuery {
  title: string;
  artist: string;
}

export interface SearchResult {
  query: SearchQuery;
  matched: boolean;
  confidence: number;
  candidates: Song[];
  bestMatch: Song | null;
  duplicate: boolean;
}

export interface QRCodeResult {
  key: string;
  qrImage: string;
  qrUrl?: string;
}

export type QRCheckStatus =
  | { code: 800; message: 'expired' }
  | { code: 801; message: 'waiting' }
  | { code: 802; message: 'scanned' }
  | { code: 803; message: 'authorized'; cookie: string };

export interface PlatformMeta {
  id: string;
  name: string;
  nameZh: string;
  icon: string;
  loginType: 'qrcode' | 'phone' | 'cookie';
}

export interface IPlatformAdapter {
  readonly meta: PlatformMeta;

  generateQRKey(): Promise<string>;
  createQRCode(key: string): Promise<QRCodeResult>;
  checkQRStatus(key: string): Promise<QRCheckStatus>;

  searchSongs(query: SearchQuery, cookie: string, limit?: number): Promise<Song[]>;

  getUserFavorites(cookie: string, offset?: number, limit?: number): Promise<Song[]>;

  createPlaylist(name: string, cookie: string, isPublic?: boolean): Promise<string>;
  addSongsToPlaylist(playlistId: string, songIds: string[], cookie: string): Promise<number>;
}
