import 'dotenv/config';

export default ({ config }) => {
  const isDev = process.env.APP_ENV === 'preview';

  return {
    ...config,
    name: isDev ? 'Oto RS-Djamil Dev' : 'Oto RS-Djamil',
    slug: isDev ? 'simrs-djamil-ototrack-dev' : 'simrs-djamil-ototrack',
    version: '1.1.1',
    scheme: isDev ? 'ototrack-djamil-dev' : 'ototrack-djamil',
    orientation: 'portrait',
    icon: './assets/icon.png',
    assetBundlePatterns: ['**/*'],
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    owner: 'darma31',
    extra: {
      router: { origin: false },
      eas: {
        projectId: isDev
          ? 'f4387b14-ec17-49fb-ac2f-f5428154fc24'
          : '39b7a571-7afd-4fae-ab4a-73ba8c38030d',
      },
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    updates: {
      url: 'https://u.expo.dev/39b7a571-7afd-4fae-ab4a-73ba8c38030d',
    },
    web: {
      favicon: './assets/icon/adaptive-icon.png',
      output: 'server',
      bundler: 'metro',
    },
    experiments: {
      tsconfigPaths: true,
      newArchitecture: true,
    },
    plugins: [
      ['expo-router', { sitemap: false }],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme: 'com.googleusercontent.apps.642345658543-iju0ncqirablltugnqrtjj3jmek8e05n',
        },
      ],
      'expo-asset',
      'expo-font',
      [
        'expo-secure-store',
        {
          configureAndroidBackup: true,
          faceIDPermission: 'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Allow $(PRODUCT_NAME) to access your camera',
          microphonePermission: 'Allow $(PRODUCT_NAME) to access your microphone',
          recordAudioAndroid: true,
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.',
          locationAlwaysPermission: 'Allow $(PRODUCT_NAME) to use your location',
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true,
        },
      ],
      [
        'expo-splash-screen',
        {
          backgroundColor: '#232323',
          image: './assets/icon/splash-icon-light.png',
          dark: {
            image: './assets/icon/splash-icon-dark.png',
            backgroundColor: '#000000',
          },
          imageWidth: 200,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/icon/icon-notification.png',
          color: '#ffffff',
          defaultChannel: 'default',
          enableBackgroundRemoteNotifications: false,
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with your friends.',
        },
      ],
      'expo-web-browser',
    ],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      buildNumber: '1',
      bundleIdentifier: isDev
        ? 'com.darma31.simrsdjamilototrackdev'
        : 'com.darma31.simrsdjamilototrack',
      icon: {
        dark: './assets/icon/ios-dark.png',
        light: './assets/icon/ios-light.png',
        tinted: './assets/icon/ios-tinted.png',
      },
    },
    android: {
      edgeToEdgeEnabled: true,
      versionCode: 1,
      package: isDev ? 'com.darma31.simrsdjamilototrackdev' : 'com.darma31.simrsdjamilototrack',
      adaptiveIcon: {
        foregroundImage: './assets/icon/adaptive-icon.png',
        monochromeImage: './assets/icon/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
        'android.permission.POST_NOTIFICATIONS',
      ],
    },
  };
};
