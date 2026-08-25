import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'fr.maxim.jeucommu',
  appName: 'JeuCommu',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
}

export default config
