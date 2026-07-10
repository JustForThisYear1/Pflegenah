import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "de.pflegenah.app",
  appName: "Pflegenah",
  webDir: "www",
  server: {
    url: "http://192.168.2.8:8080",
    cleartext: true,
  },
};

export default config