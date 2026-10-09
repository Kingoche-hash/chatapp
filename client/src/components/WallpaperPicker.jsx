import { WALLPAPERS } from '../utils/wallpapers';
import Modal from './Modal';

export default function WallpaperPicker({ current, onChoose, onClose }) {
  return (
    <Modal title="Chat wallpaper" onClose={onClose}>
      <p className="mb-3 text-sm text-slate-400">Only you see this wallpaper.</p>

      <div className="grid grid-cols-4 gap-3">
        {WALLPAPERS.map((wallpaper) => (
          <button
            key={wallpaper.key}
            type="button"
            onClick={() => onChoose(wallpaper.key)}
            aria-label={wallpaper.name}
            aria-pressed={current === wallpaper.key}
            className="flex flex-col items-center gap-1 text-xs text-slate-300"
          >
            <span
              style={wallpaper.style}
              className={`block h-20 w-full rounded-lg border-2 ${
                current === wallpaper.key ? 'border-emerald-400' : 'border-slate-600'
              }`}
            />
            {wallpaper.name}
          </button>
        ))}
      </div>
    </Modal>
  );
}