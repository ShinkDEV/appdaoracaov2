import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qadosh.appdaoracao',
  appName: 'App da Oração',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
