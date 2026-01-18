# Gym90

Premium 90-Tage Challenge App (Expo + React Native + TypeScript). Fokus: Premium UI, starke Micro-Interactions, hochwertige Rewards + Sound/Haptics, lokal gespeichert.

## Setup

```bash
npm install
```

Wenn npm wegen Peer-Deps meckert: `rm -rf node_modules package-lock.json` und danach `npm install --legacy-peer-deps`.

## Start (Dev Client)

```bash
# Dev Client starten (Skia erfordert Dev Build, nicht Expo Go)
npx expo start --dev-client
```

### Web Preview (localhost)

```bash
npx expo start --web
```

### iOS Simulator

```bash
# Simulator starten + Dev Client öffnen
open -a Simulator
```

## Auf iPhone installieren (Dev Build)

Skia benötigt einen Dev Client (kein Expo Go).

1) Dev Client bauen: `eas build -p ios --profile development`
2) Build installieren (TestFlight oder direkte Installation via EAS)
3) App starten: `npx expo start --dev-client` und im Dev Client öffnen

## EAS

`eas.json` ist vorkonfiguriert. Beispiele:

```bash
# Dev Client Build
eas build -p ios --profile development

# Preview/Release Build
eas build --profile preview --platform ios
```

## Sounds ersetzen

- Platzhalter-Dateien liegen in `assets/sfx`.
- Ersetze sie mit eigenen, lizenzfreien WAV/MP3-Dateien.
- Passe `src/utils/audio.ts` an, falls du die Bundled-Sounds statt der eingebauten Data-URI-Sounds nutzen willst.
- Standardmaessig sind die eingebauten Sounds stumm (Placeholder), damit keine Copyright-Risiken entstehen.

## Skia Rewards

- Reward-Animationen werden primär mit `@shopify/react-native-skia` gerendert.
- Dev Build ist Pflicht (Expo Go unterstuetzt Skia nicht).
- Skia Effects liegen in `src/components/rewards/SkiaEffects`.

## Reward Modal (Claim XP)

- Sequenz: Skia Hero Animation (2.5-5.0s oder bis Effekt fertig) -> Claim-Phase -> Close.
- Claim-Button erscheint erst nach der Animation.
- XP wird erst beim Claim gutgeschrieben, nicht vorher.

## Selected Day (Ansichtstag)

- `Startdatum` und `Ansichtstag` werden in Settings getrennt gepflegt.
- `Ansichtstag` steuert, welchen Tag Home/Checks bearbeiten.
- Keine Guardrails: jedes Datum ist zulaessig (Backfill moeglich).
- Quick-Button `Heute` setzt den Ansichtstag sofort auf Heute.

## Test Reward

- In `Settings` unter `Dev` -> `Test Reward`.
- Optionaler Seed macht Rewards deterministisch.
- `Reward Debug Info` zeigt Effect-Namen im Overlay.

## Reset

- `Challenge zuruecksetzen` loescht AsyncStorage + Store komplett und bringt dich zurueck auf `Home`.
- Startdatum und Ansichtstag werden auf Heute gesetzt.

## Defaults / Annahmen

- Sound ist standardmaessig aktiviert (dezent).
- Soft Pastel Mode zeigt den zusaetzlichen Check "Pille" (optional deaktivierbar).
- "Freundin-Mode: freche Texte" ist standardmaessig aktiv.

## Hinweise

- Reminder werden lokal geplant (expo-notifications).
- Alle Daten bleiben lokal (AsyncStorage), kein Backend.

## Was gefixt wurde

- Skia Reward Engine mit Hero-Animationen (randomized, no repeats).
- Reward Modal Sequencing: Skia Animation -> Claim -> Close, XP erst beim Claim.
- Ansichtstag ohne Einschränkung, Heute-Shortcut und persistente Auswahl.
- Progress Grid highlightet den ausgewaehlten Tag korrekt.
- Settings zeigt Skia Effects + Recent Effects im Dev-Bereich.
- Reset loescht alle gespeicherten Keys und setzt Defaults sauber.
