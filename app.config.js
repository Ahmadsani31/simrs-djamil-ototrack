import 'dotenv/config';

export default {
  expo: {
    name: 'zustandExpo',
    slug: 'zustand-expo',
    version: "1.2.5",
    scheme: "zustand-scheme",
    orientation: 'portrait',
    userInterfaceStyle: "automatic",
    extra: {
      API_URL: process.env.API_URL,
    },
  },
};
