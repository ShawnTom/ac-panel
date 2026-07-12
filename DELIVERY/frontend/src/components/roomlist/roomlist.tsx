import type { Room } from '../../types';
import { Panel } from '../shared/panel';
import './roomlist.css';

interface RoomListProps {
  rooms: Room[];
  onRoomSelect: (roomId: string) => void;
  onBack: () => void;
}

export function RoomList({ rooms, onRoomSelect, onBack }: RoomListProps) {
  return (
    <Panel className="room-list">
      {/* Header */}
      <div className="room-list__header">
        <button className="room-list__back-btn" onClick={onBack} aria-label="Back">
          →
        </button>
        <span className="room-list__title">房间列表</span>
      </div>

      {/* Room cards grid */}
      <div className="room-list__grid">
        {rooms.map((room) => (
          <button
            key={room.id}
            className={`room-list__card ${!room.power ? 'room-list__card--off' : ''}`}
            onClick={() => onRoomSelect(room.id)}
          >
            <div className="room-list__card-header">
              <span className="room-list__card-name">{room.name}</span>
              <span
                className={`room-list__card-status ${room.power ? 'room-list__card-status--on' : 'room-list__card-status--off'}`}
              >
                {room.power ? '●' : '○'}
              </span>
            </div>
            <div className="room-list__card-body">
              <div className="room-list__card-temp">
                <span className="room-list__card-temp-value">{room.acTemp}</span>
                <span className="room-list__card-temp-unit">°C</span>
              </div>
              <div className="room-list__card-details">
                <span className="room-list__card-detail">室内 {room.indoorTemp}°C</span>
                <span className="room-list__card-detail">湿度 {room.humidity}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Panel>
  );
}
