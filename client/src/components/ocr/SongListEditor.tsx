import { useMigrationStore } from '../../store/migrationStore';
import { Button } from '../shared/Button';
import type { RecognizedSong } from '../../types/song';

interface SongListEditorProps {
  onNext: () => void;
}

export function SongListEditor({ onNext }: SongListEditorProps) {
  const { recognizedSongs, setRecognizedSongs, uploadedUrls } = useMigrationStore();

  const updateSong = (id: string, field: 'title' | 'artist', value: string) => {
    setRecognizedSongs(
      recognizedSongs.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const deleteSong = (id: string) => {
    setRecognizedSongs(recognizedSongs.filter((s) => s.id !== id));
  };

  const addBlank = () => {
    setRecognizedSongs([
      ...recognizedSongs,
      { id: `manual-${Date.now()}`, title: '', artist: '' },
    ]);
  };

  return (
    <div className="max-w-md mx-auto py-4">
      <h2 className="text-xl font-semibold mb-1 text-center">输入歌单歌曲</h2>
      <p className="text-white/40 text-sm text-center mb-2">
        对照截图输入歌名和歌手，每行一首
      </p>

      {/* Show uploaded images for reference */}
      {uploadedUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3">
          {uploadedUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer">
              <img
                src={url}
                alt={`Reference ${i + 1}`}
                className="w-16 h-24 object-cover rounded-lg border border-white/10 flex-shrink-0"
              />
            </a>
          ))}
          <p className="text-white/20 text-[10px] self-end pb-1">点击放大</p>
        </div>
      )}

      <div className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto">
        {recognizedSongs.map((song, idx) => (
          <SongRow
            key={song.id}
            song={song}
            index={idx + 1}
            onChange={(field, val) => updateSong(song.id, field, val)}
            onDelete={() => deleteSong(song.id)}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={addBlank}>
          + 添加歌曲
        </Button>
      </div>

      <div className="mt-4">
        <Button size="lg" onClick={onNext} disabled={recognizedSongs.length === 0}>
          确认，下一步
        </Button>
      </div>
    </div>
  );
}

function SongRow({
  song,
  index,
  onChange,
  onDelete,
}: {
  song: RecognizedSong;
  index: number;
  onChange: (field: 'title' | 'artist', value: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2.5">
      <span className="text-white/20 text-xs w-6 text-center flex-shrink-0">{index}</span>
      <div className="flex-1 min-w-0 space-y-1">
        <input
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
          value={song.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="歌名"
        />
        <input
          className="w-full bg-transparent text-xs text-white/50 outline-none placeholder:text-white/15"
          value={song.artist}
          onChange={(e) => onChange('artist', e.target.value)}
          placeholder="歌手"
        />
      </div>
      <button
        className="text-white/20 hover:text-red-400 p-1 flex-shrink-0"
        onClick={onDelete}
      >
        ✕
      </button>
    </div>
  );
}
