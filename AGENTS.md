# AGENTS.md

Repo-specific notes for OpenCode. The README is a leftover starter-template description and is largely inaccurate, prefer this file.

## Stack snapshot

- Expo SDK 55, React Native 0.83, React 19.2, **New Architecture mandatory** (no `newArchEnabled` flag in `app.json` — SDK 55 dropped legacy arch).
- `expo-router` v6 (file-based, root at `src/app/`). `main` is `expo-router/entry` in `package.json`.
- TypeScript strict (~5.9). Path aliases (`tsconfig.json` + `app.json` `experiments.tsconfigPaths: true`):
  - `@/*` -> `src/*`
  - `@asset/*` -> `assets/*`
- NativeWind v4. `babel.config.js` uses `babel-preset-expo` with `jsxImportSource: 'nativewind'` plus `nativewind/babel`. Tailwind input is `./global.css` (wired in `metro.config.js`). Use `className` on RN components, not `style`.
- State: Zustand (`src/stores/`). Server state: `@tanstack/react-query` (provider in `src/app/_layout.tsx`).
- Forms: `formik` + `yup`. `react-hook-form` is **not** installed; do not introduce it without team agreement.
- Date pickers: `@expo/ui/datetimepicker` (drop-in for the deprecated `@react-native-community/datetimepicker`). The picker is **declarative** — there is no `DateTimePickerAndroid.open()`. Use `useDatePicker` from `@/hooks/useDatePicker` for the imperative-style flow that wraps the dialog presentation.

## Commands

- `npm run start` - Metro / Expo dev menu.
- `npm run android` / `npm run ios` - `expo run:*`, requires the prebuild step below for native deps.
- `npm run prebuild` - regenerates native `android/` and `ios/`. Both directories are gitignored, never hand-edit them.
- `npm run lint` - eslint (`universe/native`) + prettier check on `**/*.{js,jsx,ts,tsx,json}`.
- `npm run format` - eslint --fix + prettier --write. Run before committing.
- `npx expo-doctor` - SDK compatibility check. Should report 17/17 passing.
- `npx expo install --fix` - bumps Expo-managed packages to versions compatible with the installed SDK. Prefer this over `npm install <expo-pkg>@latest`, which will pull versions outside the SDK band and break peer deps.
- No test runner is configured. Do not assume `jest` exists; if tests are needed, set up the framework before claiming coverage.

## Dependency hygiene

- To remove a package, **edit `package.json` manually** and run `npm install`. Avoid `npm uninstall <pkg>`: in this repo it has been observed to rewrite unrelated `expo*` versions during full resolution and leave the lockfile in an unbuildable state.
- `expo doctor` exclusions live under `expo.doctor.reactNativeDirectoryCheck.exclude` in `package.json`. Currently excludes `react-native-element-dropdown`, `uri-scheme`, `clsx` (last one flagged unmaintained but stable; not worth swapping).
- Never add `expo-modules-core` directly — `expo-doctor` will flag it. Types are exported transitively via `expo`.

## SDK 55 gotchas (post-upgrade from SDK 53)

- `app.json`: `notification`, `newArchEnabled`, and `android.edgeToEdgeEnabled` are **removed** in SDK 55 schema. Notifications config goes through the `expo-notifications` plugin only.
- `expo-notifications`: `getPermissionsAsync()` and `requestPermissionsAsync()` no longer expose `.status` on the root response — use `.granted` instead. The `.status` field still exists on `ios.status` for iOS-specific authorization states.
- `@gorhom/bottom-sheet`: `restDisplacementThreshold` and `restSpeedThreshold` no longer exist in `SpringConfig`. Remove them from `useBottomSheetSpringConfigs` calls.
- `expo-file-system`: `getInfoAsync(uri, { size: true })` option is removed; size is included by default. Read `fileInfo.size` (after narrowing on `fileInfo.exists`).
- AntDesign icon names changed to kebab-case: `closecircleo` → `close-circle`, `exclamationcircle` → `exclamation-circle`, `downcircle` → `down-circle`, etc. The `back` icon is gone, use `left` or another arrow.
- `react-native-worklets` is now a required peer of `react-native-reanimated`. `expo install` adds it automatically.

## Environments

- Three env files, all gitignored: `.env.development`, `.env.preview`, `.env.production` (template in `.env.example`).
- Required `EXPO_PUBLIC_*` vars consumed in `src/utils/constants.ts` and `src/app/(protected)/(tabs)/profile.tsx`:
  - `EXPO_PUBLIC_API_URL` (falls back to the prod backoffice URL if missing)
  - `EXPO_PUBLIC_GOOGLE_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_CLIENT_SECRET`, `EXPO_PUBLIC_APPLE_CLIENT_ID`
- These files contain real OAuth credentials. Do not echo their values back, do not commit them, and do not paste them into logs or PRs.
- EAS profiles in `eas.json`: `development` / `preview` / `production` map to channels of the same name and pick the matching env file via the `environment` field.

## Routing model (read before adding screens)

`src/app/` layout, every layout is a real auth/role gate, not just chrome:

- `_layout.tsx` - global providers (QueryClient, SafeArea, GestureHandler, Toast), runs `useAutoLogin`, requests location + camera + notification permissions, and wires the Android hardware back button. It also imports `@/utils/backgroundLocationTask` for its side effects (registers the TaskManager task at module load). Keep that import.
- `login.tsx` - public.
- `(protected)/_layout.tsx` - wraps children in `PrivateRoute` (redirects to `/login` if no token in `SecureStore`). All app screens live here.
- `(protected)/(tabs)/_layout.tsx` - **driver-only**. Redirects to `(tabs-admin)` if `user.role !== 'driver'`.
- `(protected)/(tabs-admin)/_layout.tsx` - **admin-only**. Redirects to `(tabs)` if `user.role !== 'admin'`.
- The two tab groups are siblings, not nested. Adding a screen for one role goes in exactly one of them.

## Auth + API quirks

- Auth token is stored in `expo-secure-store` under the key `token` (do not switch to AsyncStorage for this).
- `src/services/auth.ts` is the **public** axios instance (no interceptor) used by `useAuthStore` for login/logout/checkAuth.
- `src/services/service.ts` (default export `secureApi`) is the **authenticated** axios instance: request interceptor injects the bearer token, response interceptor calls `useAuthStore.getState().logout()` on 401. Use `secureApi` for any authenticated call.
- Both axios instances have a hard `timeout: 10000`.

## Background location

- Task name `background-location-task` is exported as `LOCATION_TASK_NAME` from `src/utils/backgroundLocationTask.ts`. Import it from there; do not duplicate the literal.
- The TaskManager task is defined at module top-level in `utils/backgroundLocationTask.ts`. It must be imported before any `Location.startLocationUpdatesAsync` call, which is why `_layout.tsx` imports it for side effects.
- `useLocationStore` persists `coords` to AsyncStorage under key `tracking-data` (zustand `persist` middleware). `partialize` only emits `{ coords }`; actions are restored from the store initializer on rehydrate. There is no `coord` (single) field — only the array.
- Background task loops over **every** entry in `locations[]` (OS batches updates while dozing). Don't change to `locations[0]` only — coords will be lost.
- Sampling tuned for vehicle tracking + battery: `Accuracy.High`, `timeInterval: 5000` (5s), `distanceInterval: 10` (10m). Don't crank to `Accuracy.Highest` + 1s — drains battery and floods AsyncStorage.
- `useTrackingHealth` (`src/hooks/useTrackingHealth.ts`) probes task status + permission state on screen focus. Driver home tab uses it to show a "Tracking Terhenti" banner if user revokes location permission mid-trip.
- Trip flow: `detail.tsx` calls `clearCoordinates()` + `stopTracking()` before `startTracking()` on a new pemakaian; `pengembalian.tsx` reads coords via `getStoredCoords()` (lib/secureStorage), POSTs them, then `clearCoordinates()` + `stopTracking()`.

## Components layout

`src/components/` is grouped by purpose. Always import via the absolute alias path (`@/components/<group>/<File>`):

- `forms/` - inputs, buttons (`Input`, `InputArea`, `InputDate`, `InputFile`, `InputFileCamera`, `CustomNumberInput`, `ButtonCostum`, `ButtonCloseImage`).
- `modals/` - modals, dialogs, version banners (`ModalCamera`, `ModalPreviewImage`, `ModalRN`, `DialogHasilScanQRCode`, `NotifikasiNewVersion`, `NotifikasiNewVersionMinor`).
- `scanner/` - camera/QR capture (`BarcodeScanner`, `BarcodeScannerCamera`).
- `layout/` - chrome and route-level wrappers (`PrivateRoute`, `CustomHeader`, `SafeAreaView`, `RequiredPermission`).
- `feedback/` - loaders, skeletons, error/image preview (`Loader`, `LoadingIndikator`, `SkeletonItem`, `SkeletonList`, `ViewError`, `ImagePriview`).
- `sections/` - page-level building blocks composed inside route screens (`PageHome`, `PageDaily`, `PageDailyListCheckpoint`, `PageService`, `PageServiceListImage`, `ListDetailSectionSheet`, `ListDetailServiceSheet`).

Don't import via relative `./` between groups; stick to `@/components/<group>/X` so future moves stay grep-able.

`src/utils/logger.ts` exposes `logger.{log,warn}` (no-op in production via `__DEV__`) and `logger.error` (always logs). Use it instead of bare `console.*` for ad-hoc debug; reserve `console.*` for explicit `__DEV__`-guarded paths only.

## Conventions and known cruft

- Code, UI strings, and many filenames are Indonesian (`pemiliharaan`, `pengembalian`, `kendaraan`, `bbm-uang`, `bbm-voucher`). Match that when adding sibling screens.
- Brand color: use `colors.brand` (`'#205781'`) from `src/constants/colors.tsx` for native APIs / RN style props, and Tailwind class `bg-brand` / `text-brand` for `className`. Don't reintroduce raw `#205781` literals.
- `colors.primary` / `secondary` / `danger` / `warning` in the same file are **Tailwind class strings** (e.g. `'bg-[#FD8B51]'`), not hex. Don't mix the two groups.
- `expo doctor` is configured in `package.json` to skip `react-native-element-dropdown`, `uri-scheme`, and `clsx` checks. Leave that exclusion alone.
- OTA updates are enabled via `expo-updates` with `runtimeVersion.policy: appVersion`. Bumping `expo.version` in `app.json` changes the runtime version and breaks update compatibility for older binaries.
- `NotifikasiNewVersion` and `NotifikasiNewVersionMinor` poll `${API_URL}/auth/version_new_android` 5s after launch and force/suggest a Play Store update. Backend must keep that endpoint shape stable.
- `BottomSheetModalProvider` lives inside `(protected)/_layout.tsx` (wrapping the inner Stack), **not** in the root layout. Do not move it back to the root: the portal target (`BottomSheetHostingContainer`) must be inside the navigation container, otherwise `BottomSheetModal` content renders outside navigation context and crashes with "Couldn't find a navigation context."
