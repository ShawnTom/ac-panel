import type { Room } from '../../types';
import { Panel } from '../shared/panel';
import './roomlist.css';

interface RoomListProps {
  rooms: Room[];
  onRoomSelect: (roomId: string) => void;
  onRoomPowerToggle: (room: Room) => void;
  onBack: () => void;
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

export function RoomList({ rooms, onRoomSelect, onRoomPowerToggle, onBack }: RoomListProps) {
  // 过滤掉客厅（主控），只展示其他房间
  const roomOnlyList = rooms.filter(r => r.id !== 'living-room');

  return (
    <Panel className="room-list">
      {/* Header */}
      <div className="room-list__header">
        <button className="room-list__back-btn" onClick={onBack} aria-label="Back">
          <HomeIcon />
        </button>
        <span className="room-list__title">房间列表</span>
      </div>

      {/* 两列网格布局 */}
      <div className="room-list__grid">
        {roomOnlyList.map((room) => (
          <div
            key={room.id}
            className={`room-list__card ${!room.power ? 'room-list__card--off' : 'room-list__card--on'}`}
            onClick={() => onRoomSelect(room.id)}
          >
            <div className="room-list__card-info">
              <span className="room-list__card-name">{room.name}</span>
              <span className="room-list__card-temp">
                <span className="room-list__card-temp-value">{room.acTemp}</span>
                <span className="room-list__card-temp-unit">°C</span>
              </span>
            </div>
            <button
              className={`room-list__power-btn ${room.power ? 'room-list__power-btn--on' : 'room-list__power-btn--off'}`}
              onClick={(e) => {
                e.stopPropagation();
                onRoomPowerToggle(room);
              }}
              aria-label={room.power ? 'Turn off' : 'Turn on'}
            >
              <PowerIcon />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
