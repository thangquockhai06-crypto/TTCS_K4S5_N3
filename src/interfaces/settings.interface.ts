export type ThemeModeType = 'light' | 'dark';
export type UIDensityType = 'comfortable' | 'compact';

export interface IAppearanceSettings {
  theme: ThemeModeType;
  density: UIDensityType;
  accentColor: '#2563EB' | '#8B5CF6' | '#10B981' | '#0EA5E9';
  reducedMotion: boolean;
}

export interface INotificationPreference {
  id: string;
  title: string;
  description: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  slackEnabled: boolean;
}

export interface ISecuritySession {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}
