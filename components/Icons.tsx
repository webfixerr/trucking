import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const HomeIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9.5L12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

export const MapMarkerIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
      fill={color}
    />
    <Circle cx="12" cy="9" r="2.5" fill="#fff" />
  </Svg>
);

export const UserIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" fill={color} />
    <Path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" fill={color} />
  </Svg>
);

export const FuelPumpIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Pump base */}
    <Rect x="4" y="18" width="10" height="3" rx="1" fill={color} />
    {/* Pump body */}
    <Rect
      x="6"
      y="6"
      width="6"
      height="12"
      rx="1"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
    />
    {/* Hose */}
    <Path
      d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
    {/* Nozzle */}
    <Path
      d="M15 7h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2l-1-2"
      fill={color}
      stroke={color}
      strokeWidth={1}
    />
    {/* Pump display/window */}
    <Rect
      x="7.5"
      y="8"
      width="3"
      height="2"
      rx="0.5"
      fill="#fff"
      stroke={color}
      strokeWidth={1}
    />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Gear outer ring */}
    <Path
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />

    {/* Gear teeth */}
    <Path
      d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />

    {/* Central hub */}
    <Circle cx="12" cy="12" r="1.8" fill={color} />
  </Svg>
);
