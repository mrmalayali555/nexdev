import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nexdev.habittracker',
  appName: 'NexDev',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  backgroundColor: '#090d16',
};

export default config;

