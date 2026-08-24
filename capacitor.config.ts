import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'fr.maxim.partygames',
  appName: 'Soirée Jeux',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
