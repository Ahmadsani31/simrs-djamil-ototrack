import 'dotenv/config';

export default {
  expo: {
    name: 'zustandExpo',
    slug: 'zustand-expo',
    version: "1.2.4",
    orientation: 'portrait',
    extra: {
      API_URL: process.env.API_URL,
    },
  },
};
