import { useState, useEffect, useRef } from 'react';
import type { Room, GlobalSettings, ACMode } from './types';
import { mockRooms, mockGlobalSettings } from './mock/data';
import { useTheme } from './hooks/usetheme';
import { useBrightness } from './hooks/usebrightness';
import { useSwipe } from './hooks/useswipe';
import { useToast } from './hooks/usetoast';
import './hooks/toast.css';
import { HomePanel } from './components/homepanel/homepanel';
import { MainPanel } from './components/mainpanel/mainpanel';
import { RoomPanel } from './components/roompanel/roompanel';
import { RoomList } from './components/roomlist/roomlist';
import { GlobalSettingsPanel } from './components/globalsettings/globalsettings';
import './app.css';
import './themes/tech-blue-purple.css';
import './themes/black-gold.css';
import './themes/gray-white.css';

type View = 'home' | 'main' | 'room-list' | 'room' | 'settings';
type HorizontalView = 'home' | 'main' | 'room-list';
type OverlayView = 'room' | 'settings';

// 横向滑动视图顺序：首页 | 主控 | 房间列表
const horizontalOrder: HorizontalView[] = ['home', 'main', 'room-list'];

// 跑马灯对应三个主要可滑动页面
const marqueeItems: { id: HorizontalView; label: string }[] = [
  { id: 'home', label: '首页' },
  { id: 'main', label: '主控' },
  { id: 'room-list', label: '房间' },
];

function App() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(mockGlobalSettings);
  // 横向视图：首页 | 主控 | 房间列表（左右滑动切换）
  const [horizontalView, setHorizontalView] = useState<HorizontalView>('main');
  // 覆盖层视图：room | settings（直接替换 + 150ms opacity 渐变）
  const [overlayView, setOverlayView] = useState<OverlayView | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  // 覆盖层进入/退出状态：'enter' = 渐入完成，'exit' = 渐出
  const [overlayState, setOverlayState] = useState<'enter' | 'exit' | null>(null);
  const prevHorizontalViewRef = useRef<HorizontalView>('main');

  const { setTheme } = useTheme(globalSettings.theme);
  const {
    brightnessConfig,
    updateConfig,
    isNight,
    previewBrightness,
    cancelPreview,
    previewCountdown,
    previewValue,
  } = useBrightness(globalSettings.brightness);
  // 顶层 toast：用于跨页面提示（如总控关闭时单独开房间的提示）
  const { toast, showToast } = useToast();

  // 主题切换
  useEffect(() => {
    setTheme(globalSettings.theme);
  }, [globalSettings.theme, setTheme]);

  // 覆盖层进入/退出：进入时先挂载到 opacity:0（'exit'），
  // 下一帧切到 opacity:1（'enter'），由 CSS transition 完成 150ms 渐入
  useEffect(() => {
    if (overlayView) {
      setOverlayState('exit');
      // 下一帧切到 enter：触发渐入动画
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOverlayState('enter');
        });
      });
      return () => cancelAnimationFrame(id);
    } else {
      setOverlayState(null);
    }
  }, [overlayView]);

  // 横向滑动：仅在没有覆盖层时生效
  const swipeHandlers = useSwipe({
    onSwipeLeft: overlayView ? undefined : () => {
      // 前进
      if (horizontalView === 'home') setHorizontalView('main');
      else if (horizontalView === 'main') setHorizontalView('room-list');
      // room-list → room 需要已选中房间，不自动滑动切换
    },
    onSwipeRight: overlayView ? undefined : () => {
      // 回退
      if (horizontalView === 'main') setHorizontalView('home');
      else if (horizontalView === 'room-list') setHorizontalView('main');
      // settings 走返回按钮（swipe 已禁用）
    },
  });

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    prevHorizontalViewRef.current = horizontalView;
    setOverlayView('room');
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
    const newPower = !globalSettings.power;
    handleGlobalUpdate({ power: newPower });
    // 一键启动/关闭：同步所有房间的电源状态
    setRooms(prev => prev.map(r => ({ ...r, power: newPower })));
  };

  /**
   * 校验：总控关闭时，单独打开某个房间不允许
   * 用于房间列表的 power 按钮（要打开）和房间详情页的 power 按钮（要打开）
   */
  const requireMasterPower = (room: Room, nextPower: boolean): boolean => {
    if (!globalSettings.power && nextPower) {
      showToast('请先打开总控开关');
      return false;
    }
    return true;
  };

  /**
   * 房间列表的 power 按钮：包装 onRoomPowerToggle 加入总控校验
   */
  const handleRoomPowerToggleWithGuard = (room: Room) => {
    const nextPower = !room.power;
    if (!requireMasterPower(room, nextPower)) return;
    handleRoomUpdate({ ...room, power: nextPower });
  };

  /**
   * 房间详情页 power 按钮：只允许"开启"动作（关闭不受总控限制）
   */
  const handleRoomPanelPowerToggle = (room: Room) => {
    const nextPower = !room.power;
    if (!requireMasterPower(room, nextPower)) return;
    // 开启时若总控关闭（理论已被拦截）确保总控也开
    if (!globalSettings.power && nextPower) {
      handleGlobalUpdate({ power: true });
    }
    handleRoomUpdate({ ...room, power: nextPower });
  };

  const handleModeChange = (mode: ACMode) => {
    handleGlobalUpdate({ currentMode: mode });
    // 通风模式：同步所有房间切换到通风，并确保它们有风量档/模式/可调
    if (mode === 'wind') {
      setRooms(prev =>
        prev.map(r => ({
          ...r,
          // 进入通风时把每个房间都设成可调 + 默认手动/3档（如果之前没有）
          fanAdjustable: true,
          fanSpeed: r.fanSpeed ?? 3,
          fanMode: r.fanMode ?? 'manual',
        }))
      );
    }
  };

  /** 打开覆盖层（room / settings） */
  const openOverlay = (view: OverlayView) => {
    prevHorizontalViewRef.current = horizontalView;
    setOverlayView(view);
  };

  /** 关闭覆盖层：触发渐出动画后卸载 */
  const closeOverlay = () => {
    if (!overlayView) return;
    setOverlayState('exit');
    // 等动画结束后再卸载
    setTimeout(() => {
      if (overlayView === 'room') {
        setSelectedRoomId(null);
      }
      setOverlayView(null);
      setOverlayState(null);
    }, 150); // 与 CSS transition 时长保持一致
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;
  const mainRoom = rooms.find(r => r.id === 'living-room') || rooms[0];

  const horizontalIndex = horizontalOrder.indexOf(horizontalView);

  return (
    <div className="app" {...swipeHandlers}>
      {/* 横向 track：首页 | 主控 | 房间列表（左右滑动切换） */}
      <div
        className="app__track"
        style={{ transform: `translateX(-${horizontalIndex * (100 / 3)}%)` }}
      >
        <div className="app__view app__view--horizontal">
          <HomePanel rooms={rooms} settings={globalSettings} onPowerToggle={handlePowerToggle} onSettingsClick={() => openOverlay('settings')} />
        </div>
        <div className="app__view app__view--horizontal">
          <MainPanel
            room={mainRoom}
            settings={globalSettings}
            onModeChange={handleModeChange}
            onPowerToggle={handlePowerToggle}
            onSettingsClick={() => openOverlay('settings')}
            onRoomUpdate={handleRoomUpdate}
          />
        </div>
        <div className="app__view app__view--horizontal">
          <RoomList
            rooms={rooms}
            onRoomSelect={handleRoomSelect}
            onRoomPowerToggle={handleRoomPowerToggleWithGuard}
            onBack={() => setHorizontalView('main')}
            onSettingsClick={() => openOverlay('settings')}
          />
        </div>
      </div>

      {/* 覆盖层：room | settings（直接替换 + 150ms opacity 渐变） */}
      {overlayView === 'room' && selectedRoom && (
        <div className={`app__overlay app__overlay--${overlayState ?? 'enter'}`}>
          <RoomPanel
            room={selectedRoom}
            settings={globalSettings}
            globalPower={globalSettings.power}
            modeDisabled
            onBack={closeOverlay}
            onModeChange={handleModeChange}
            onPowerToggle={() => handleRoomPanelPowerToggle(selectedRoom)}
            onRoomUpdate={handleRoomUpdate}
          />
        </div>
      )}
      {overlayView === 'settings' && (
        <div className={`app__overlay app__overlay--${overlayState ?? 'enter'}`}>
          <GlobalSettingsPanel
            settings={globalSettings}
            brightnessConfig={brightnessConfig}
            isNight={isNight}
            onThemeChange={(theme) => handleGlobalUpdate({ theme })}
            onBrightnessChange={handleBrightnessUpdate}
            onBrightnessPreview={previewBrightness}
            previewValue={previewValue}
            previewCountdown={previewCountdown}
            onBack={closeOverlay}
          />
        </div>
      )}

      {/* 顶部跑马灯：三个紧挨的短条暗示首页/主控/房间列表的滚动状态
          房间详情页 / 设置页 不显示（房间有自带返回按钮；设置页独立） */}
      {!overlayView && (
        <div className="app__marquee" aria-label="页面导航指示">
          {marqueeItems.map((item) => (
            <span
              key={item.id}
              className={`app__marquee-bar ${horizontalView === item.id ? 'is-active' : ''}`}
            />
          ))}
        </div>
      )}

      {/* 顶层跨页面 toast：总控关闭时单独开房间的提示等 */}
      <div className={`toast ${toast.visible ? 'toast--visible' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}

export default App;
