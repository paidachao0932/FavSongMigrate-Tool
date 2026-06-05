import type {
  IPlatformAdapter,
  Song,
  SearchQuery,
  QRCodeResult,
  QRCheckStatus,
  PlatformMeta,
} from '../base.adapter.js';

// NeteaseCloudMusicApi types are loosely typed, use dynamic import
type NeteaseAPI = {
  login_qr_key: (params?: Record<string, unknown>) => Promise<{ body: Record<string, unknown> }>;
  login_qr_create: (params: Record<string, unknown>) => Promise<{ body: Record<string, unknown> }>;
  login_qr_check: (params: Record<string, unknown>) => Promise<{ body: Record<string, unknown> }>;
  search: (params: Record<string, unknown>) => Promise<{ body: { result?: { songs?: unknown[] } } }>;
  playlist_create: (params: Record<string, unknown>) => Promise<{ body: Record<string, unknown> }>;
  playlist_tracks: (params: Record<string, unknown>) => Promise<{ body: Record<string, unknown> }>;
  playlist_detail: (params: Record<string, unknown>) => Promise<{ body: { playlist?: { tracks?: unknown[] } } }>;
  user_playlist: (params: Record<string, unknown>) => Promise<{ body: { playlist?: unknown[] } }>;
  like_list: (params: Record<string, unknown>) => Promise<{ body: { ids?: unknown[] } }>;
};

export class NeteaseAdapter implements IPlatformAdapter {
  readonly meta: PlatformMeta = {
    id: 'netease',
    name: 'NetEase Cloud Music',
    nameZh: '网易云音乐',
    icon: 'netease',
    loginType: 'qrcode',
  };

  private api: NeteaseAPI | null = null;

  private async getApi(): Promise<NeteaseAPI> {
    if (!this.api) {
      this.api = (await import('NeteaseCloudMusicApi')) as unknown as NeteaseAPI;
    }
    return this.api;
  }

  async generateQRKey(): Promise<string> {
    const api = await this.getApi();
    const res = await api.login_qr_key({});
    const body = res.body as { data?: { unikey?: string } };
    return body?.data?.unikey || (body as Record<string, unknown>).unikey as string || '';
  }

  async createQRCode(key: string): Promise<QRCodeResult> {
    const api = await this.getApi();
    const res = await api.login_qr_create({ key, qrimg: 'true' });
    const body = res.body as { data?: { qrimg?: string } };
    const qrImage = body?.data?.qrimg || (body as Record<string, unknown>).qrimg as string || '';
    return { key, qrImage };
  }

  async checkQRStatus(key: string): Promise<QRCheckStatus> {
    const api = await this.getApi();
    const res = await api.login_qr_check({ key });
    const body = res.body as Record<string, unknown>;
    const code = body.code as number;

    if (code === 803) {
      return { code: 803, message: 'authorized', cookie: (body.cookie || '') as string };
    }
    if (code === 802) {
      return { code: 802, message: 'scanned' };
    }
    if (code === 800) {
      return { code: 800, message: 'expired' };
    }
    return { code: 801, message: 'waiting' };
  }

  async searchSongs(query: SearchQuery, cookie: string, limit = 10): Promise<Song[]> {
    const api = await this.getApi();
    const keywords = `${query.title} ${query.artist}`.trim();
    const res = await api.search({ keywords, limit, type: 1, cookie });
    const songs = (res.body?.result?.songs || []) as Array<Record<string, unknown>>;

    return songs.slice(0, limit).map((s) => ({
      platformId: String(s.id || ''),
      title: String(s.name || ''),
      artist: (() => {
        const ar = s.ar || s.artists;
        if (Array.isArray(ar)) {
          return (ar as Array<Record<string, unknown>>).map((a) => String(a.name || '')).join('/');
        }
        return '';
      })(),
      album: (() => {
        const al = s.al || s.album;
        if (al && typeof al === 'object') {
          return String((al as Record<string, unknown>).name || '');
        }
        return undefined;
      })(),
      duration: Number(s.dt || s.duration || 0),
    }));
  }

  async getUserFavorites(cookie: string, offset = 0, limit = 2000): Promise<Song[]> {
    const api = await this.getApi();
    try {
      const res = await api.like_list({ uid: (await this.getUserId(cookie)), cookie });
      const ids = (res.body?.ids || []) as unknown[];

      // Netease like_list only returns IDs. For a full implementation,
      // we'd call song_detail to get titles. For now, we compare by ID
      // and supplement with playlist track data instead.
      // This is a known limitation; we work around it by fetching playlists.
      const allFavorites: Song[] = [];

      // Fetch user's liked songs playlist detail
      // We need the user ID first — let's fetch all playlists and find the liked one
      const playlists = await api.user_playlist({ uid: (await this.getUserId(cookie)), cookie });
      const likedPlaylist = ((playlists.body?.playlist || []) as Array<Record<string, unknown>>).find(
        (p) => p.specialType === 5
      );

      if (likedPlaylist) {
        const detail = await api.playlist_detail({ id: likedPlaylist.id, cookie });
        const tracks = detail.body?.playlist?.tracks || [];
        for (const t of tracks as Array<Record<string, unknown>>) {
          allFavorites.push(this.mapTrack(t));
        }
      }

      return allFavorites.slice(offset, offset + limit);
    } catch {
      return [];
    }
  }

  async createPlaylist(name: string, cookie: string, isPublic = false): Promise<string> {
    const api = await this.getApi();
    const res = await api.playlist_create({ name, privacy: isPublic ? 0 : 10, cookie });
    const body = res.body as Record<string, unknown>;
    return String(body.id || '');
  }

  async addSongsToPlaylist(playlistId: string, songIds: string[], cookie: string): Promise<number> {
    const api = await this.getApi();
    const res = await api.playlist_tracks({
      op: 'add',
      pid: playlistId,
      tracks: songIds.join(','),
      cookie,
    });
    const body = res.body as Record<string, unknown>;
    if (body.code === 200) return songIds.length;
    return 0;
  }

  private async getUserId(cookie: string): Promise<string> {
    try {
      const api = await this.getApi();
      // NeteaseCloudMusicApi doesn't expose a direct get-account endpoint.
      // We parse the MUSIC_U from cookie or use a default.
      const match = cookie.match(/MUSIC_U=([^;]+)/);
      if (match) {
        // Use a temporary approach: fetch user playlists with empty uid first
        const res = await api.user_playlist({ cookie });
        const playlists = (res.body?.playlist || []) as Array<Record<string, unknown>>;
        if (playlists.length > 0) {
          return String(playlists[0].userId || '');
        }
      }
      return '';
    } catch {
      return '';
    }
  }

  private mapTrack(t: Record<string, unknown>): Song {
    return {
      platformId: String(t.id || ''),
      title: String(t.name || ''),
      artist: (() => {
        const ar = t.ar;
        if (Array.isArray(ar)) {
          return (ar as Array<Record<string, unknown>>).map((a) => String(a.name || '')).join('/');
        }
        return '';
      })(),
      album: (() => {
        const al = t.al || t.album;
        if (al && typeof al === 'object') {
          return String((al as Record<string, unknown>).name || '');
        }
        return undefined;
      })(),
    };
  }
}
