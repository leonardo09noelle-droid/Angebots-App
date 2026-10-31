import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Das Icon ist schon randlos gestaltet: kein zusätzlicher weißer Rand auf iPhone/Android.
const full = { padding: 0, resizeOptions: { background: "#0f766e" } };

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, ...full },
    apple: { ...minimal2023Preset.apple, ...full },
  },
  images: ["public/icon.svg"],
});
