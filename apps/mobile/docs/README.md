# Testing on a device: iOS and Android

The short version of how this app gets onto a real phone from a Windows
machine. Every command is in the [package README](../README.md); every
Android pitfall is in [android.md](android.md).

Both platforms run a **development build**: a native shell installed once,
which loads the JavaScript from Metro on your PC. Expo Go cannot run this app.

## Once, for both

```bash
pnpm install                 # from the repository root (rp-webapp-ui)
cd apps/mobile
cp .env.example .env         # then set the EXPO_PUBLIC_* values
```

`.env` pointing at `https://api.novelist.world` works from any phone. A local
backend only works if the phone can reach it.

## iOS (no Mac: built in the cloud with EAS)

### One-time setup

1. **Apple Developer Program** — enroll at
   <https://developer.apple.com/programs/enroll/> ($99/year). The Apple ID needs
   two-factor authentication, and the legal name must match your ID. Approval
   takes up to 48 hours; nothing below works while it says *Pending*.
2. **Expo account** — sign up at <https://expo.dev/signup>, then:

   ```bash
   npm install -g eas-cli
   eas login
   eas whoami
   ```

3. **Link the project** (already done; recorded in `app.json` as `owner` and
   `extra.eas.projectId`). On a fresh clone there is nothing to do. For a new
   Expo account: `eas init`.
4. **Register the iPhone**:

   ```bash
   eas device:create          # choose "Website", scan the QR with the iPhone
   eas device:list            # confirm it is there
   ```

   On the phone: open the link in Safari, download the profile, then
   Settings > Profile Downloaded > Install.

### Build and install

```bash
eas build --profile development --platform ios
```

- Encryption question: **Yes** (standard/exempt only).
- Distribution certificate and provisioning profile: **Yes**, generate both,
  with the registered iPhone selected.
- Push notifications: **No** for now.

When the build finishes (15 to 40 minutes on the free tier), scan its QR code
with the iPhone to install. Then enable **Developer Mode**: Settings > Privacy &
Security > Developer Mode, restart, confirm.

A new build is only needed when native code changes (a new native module,
`app.json` plugins, an SDK upgrade) or when a new device is registered.
JavaScript changes arrive through Metro.

### Every day

```bash
pnpm start:lan
```

Phone and PC on the same Wi-Fi. Scan the terminal's QR code with the Camera,
or in the app choose *Enter URL manually* and type `http://<PC LAN IP>:8081`.

- Allow Node.js through Windows Firewall on **Private** networks.
- Allow the app's *Local Network* prompt on the phone. The first connection
  attempt is lost to that prompt; connect again after allowing it.
- `pnpm start` (without `:lan`) serves on `localhost` for Android over USB and
  will not work for an iPhone.

## Android (built locally)

### One-time setup

Android Studio's SDK, a JDK, and a short checkout path are required; the
[Android notes](android.md) cover each. On the phone,
turn on Developer options > USB debugging (and *Install via USB* on
MIUI/HyperOS), connect the cable, and check:

```bash
adb devices -l               # the phone should read "device"
```

### Build and install

```bash
pnpm exec expo prebuild      # generates android/
pnpm android                 # builds, installs, starts Metro over USB
```

### Every day

```bash
pnpm start                   # Metro over the USB cable (adb reverse)
```

Works on any network because the bundle travels over the cable. To use Wi-Fi
instead: `pnpm start:lan`, same rules as iOS above.

## When it does not load

| Symptom | Cause |
| --- | --- |
| iPhone: "No development servers found" | Different Wi-Fi, firewall blocking 8081, Local Network permission off, or Metro started with `pnpm start` instead of `pnpm start:lan` |
| iPhone: app will not open after install | Developer Mode is off |
| iPhone: build fails at credentials | Apple membership not active yet, or the device is not in the provisioning profile (register it, then rebuild) |
| Android: opens, then sits on the splash | Metro is on the LAN address but the phone cannot reach it; use `pnpm start` with the cable |
