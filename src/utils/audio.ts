import { Audio } from "expo-av";

export type SoundCue =
  | "click"
  | "success"
  | "sparkle"
  | "trophy"
  | "firework"
  | "badge"
  | "streak"
  | "soft"
  | "neon"
  | "pastel"
  | "perfect"
  | "bonus";

const silentWav =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQgAAAAA";

const soundMap: Record<SoundCue, string> = {
  click: silentWav,
  success: silentWav,
  sparkle: silentWav,
  trophy: silentWav,
  firework: silentWav,
  badge: silentWav,
  streak: silentWav,
  soft: silentWav,
  neon: silentWav,
  pastel: silentWav,
  perfect: silentWav,
  bonus: silentWav
};

export const playSound = async (cue: SoundCue, enabled: boolean) => {
  if (!enabled) return;
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: soundMap[cue] },
      { volume: 0.6, shouldPlay: true }
    );
    sound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) return;
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // Silently ignore audio failures.
  }
};

export const configureAudio = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: Audio.InterruptionModeIOS.DuckOthers,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers
    });
  } catch {
    // Ignore configuration failures.
  }
};
