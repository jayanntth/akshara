# Akshara — build the Android APK

This project is a real Capacitor Android app that wraps the Akshara web app.
The web build is already synced into the `android/` project, so it is ready to
compile. Compiling the final `.apk` needs the Android build toolchain (Android
SDK + Gradle), which downloads from Google's servers — pick whichever route
below suits you.

Your account login works in the app: accounts are stored on the device, so you
can log out and log back in with the same email and password. All learning,
letters, stories, games, quizzes, progress, and badges work offline. (Voice
*playback* needs internet if your phone has no local Indic voice; the
microphone "Say it" scoring may be unavailable in the app's WebView — every
other feature works.)

---

## Route A — Build in the cloud, no tools to install (recommended)

You only need a free GitHub account.

1. Create a new **empty GitHub repository** (e.g. `akshara`).
2. Upload every file in this folder to it (drag-and-drop in GitHub's web
   uploader works, or use `git`). Keep the folder structure — the
   `.github/workflows/android.yml` file must stay at that path.
3. GitHub automatically starts the build. Open the **Actions** tab, click the
   latest **"Build Akshara APK"** run, and wait ~3–5 minutes.
   (You can also start it by hand: Actions → Build Akshara APK → Run workflow.)
4. When it finishes, scroll to **Artifacts** and download **`akshara-apk`**.
   Unzip it to get **`app-debug.apk`**.
5. Put that file on your phone and install it (see "Install on your phone").

### With git on your computer
```bash
git init
git add .
git commit -m "Akshara app"
git branch -M main
git remote add origin https://github.com/<you>/akshara.git
git push -u origin main
```

---

## Route B — Build on your computer with Android Studio

1. Install **Android Studio** (free) — it brings the Android SDK with it.
2. In Android Studio: **Open** → select the **`android`** folder inside this
   project. Let it finish "Gradle sync" (first time downloads components).
3. Menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. When done, click **locate** in the popup — the file is at
   `android/app/build/outputs/apk/debug/app-debug.apk`.

### Command line (if you have the Android SDK set up)
```bash
npm install
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

If you change the web app later, re-run `npm run build && npx cap sync android`
before building so the app picks up your changes.

---

## Install on your phone

1. Transfer `app-debug.apk` to the phone (email it to yourself, Google Drive,
   USB cable, or `adb install app-debug.apk`).
2. Tap the file. Android will ask to allow installing from this source — enable
   **"Allow from this source"** / **"Install unknown apps"** for the app you
   opened it with (Files, Chrome, or Drive), then tap **Install**.
3. Open **Akshara** from your home screen.

This is a **debug** APK — signed with Android's debug key, which is perfect for
installing on your own phone. For a Play-Store / shareable **release** build you
would generate a signing keystore and run `./gradlew assembleRelease`; ask if
you want that set up.

---

## Instant alternative — install it as an app with no APK

The app also installs straight from the browser as a home-screen app (PWA):

1. Open your deployed Akshara site in **Chrome on the phone**.
2. Menu (⋮) → **Add to Home screen** / **Install app**.

It gets an icon, opens full-screen, keeps you logged in, and works like an app.
This needs no APK and no build step.
