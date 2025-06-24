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
    <Path d="M3 9l-6 6v6h6v-4h4v4h6v-6l-6-6z" fill={color} />
    <Path d="M9 21v-6h6v6" stroke={color} strokeWidth="2" />
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
    <Path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" fill={color} />
  </Svg>
);

export const FuelPumpIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 5h4v14H3V5zm12 0h4v6h-4V5z" fill={color} />
    <Rect x="9" y="9" width="4" height="10" fill={color} />
    <Path d="M15 2v3h4l-2 4h-2V2h2z" fill={color} />
  </Svg>
);
