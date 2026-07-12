import { useState, useEffect } from 'react';
import type { Room, GlobalSettings, ACMode } from './types';
import { mockRooms, mockGlobalSettings } from './mock/data';
import { useTheme } from './hooks/usetheme';
import { useBrightness } from './hooks/usebrightness';
import { useSwipe } from './hooks/useswipe';
import { MainPanel } from './components/mainpanel/mainpanel';
import { RoomPanel } from './components/roompanel/roompanel';
import { RoomList } from './components/roomlist/roomlist';
import { GlobalSettingsPanel } from './components/globalsettings/globalsettings';
import './App.css';
import './themes/tech-blue-purple.css';

type View = 'room-list' | 'main' | 'room' | 'settings';

// 视图顺序：负一屏(房间列表) | 主面板 | 房间面板 | 设置
const viewOrder: View[] = ['room-list', 'main', 'room', 'settings'];

function App() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(mockGlobalSettings);
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { setTheme } = useTheme(globalSettings.theme);
  const { brightnessConfig, updateConfig, isNight } = useBrightness(globalSettings.brightness);

  // 主题切换
  useEffect(() => {
    setTheme(globalSettings.theme);
  }, [globalSettings.theme, setTheme]);

  // 滑动导航 — 负一屏在主面板左侧
  // swipeRight(手指左→右) = 回退/显示左侧屏
  // swipeLeft(手指右→左) = 前进/显示右侧屏
  const swipeHandlers = useSwipe({
    onSwipeRight: () => {
      if (currentView === 'main') setCurrentView('room-list');
      else if (currentView === 'room') {
        setSelectedRoomId(null);
        setCurrentView('room-list');
      }
      else if (currentView === 'settings') setCurrentView('main');
    },
    onSwipeLeft: () => {
      if (currentView === 'room-list') setCurrentView('main');
    },
  });

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setCurrentView('room');
  };

  const handleRoomUpdate = (updatedRoom: Room) => {
    setRooms(prev => prev.map(r => (r.id === updatedRoom.id ? updatedRoom : r)));
  };

  const handleGlobalUpdate = (updates: Partial<GlobalSettings>) => {
    setGlobalSettings(prev => ({ ...prev, ...updates }));
  };

  const handleBrightnessUpdate = (day: number, night: number) => {
    updateConfig({ day, night });
    handleGlobalUpdate({ brightness: { day, night } });
  };

  const handlePowerToggle = () => {
    handleGlobalUpdate({ power: !globalSettings.power });
  };

  const handleModeChange = (mode: ACMode) => {
    handleGlobalUpdate({ currentMode: mode });
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;
  const mainRoom = rooms.find(r => r.id === 'living-room') || rooms[0];

  const currentIndex = viewOrder.indexOf(currentView);

  return (
    <div className="app" {...swipeHandlers}>
      <div
        className="app__track"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        <div className="app__view">
          <RoomList
            rooms={rooms}
            onRoomSelect={handleRoomSelect}
            onBack={() => setCurrentView('main')}
          />
        </div>
        <div className="app__view">
          <MainPanel
            room={mainRoom}
            settings={globalSettings}
            onModeChange={handleModeChange}
            onPowerToggle={handlePowerToggle}
            onSettingsClick={() => setCurrentView('settings')}
            onRoomUpdate={handleRoomUpdate}
          />
        </div>
        <div className="app__view">
          {selectedRoom && (
            <RoomPanel
              room={selectedRoom}
              globalPower={globalSettings.power}
              onBack={() => {
                setSelectedRoomId(null);
                setCurrentView('room-list');
              }}
              onRoomUpdate={handleRoomUpdate}
            />
          )}
        </div>
        <div className="app__view">
          <GlobalSettingsPanel
            settings={globalSettings}
            brightnessConfig={brightnessConfig}
            isNight={isNight}
            onThemeChange={(theme) => handleGlobalUpdate({ theme })}
            onBrightnessChange={handleBrightnessUpdate}
            onBack={() => setCurrentView('main')}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
