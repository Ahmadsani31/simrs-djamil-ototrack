# 📱 Expo Router + Zustand + NativeWind Starter

A **React Native (Expo)** app using:

- `expo-router` for navigation
- `zustand` for state management
- `axios` for API requests
- `nativewind` (TailwindCSS for React Native)
- `expo-secure-store` for secure token storage
- `JWT Auth` with private routing

---

## ✨ Features

- Authentication (Login/Register) with JWT
- Save token securely using `SecureStore`
- Auto attach Authorization header with Axios
- Private routes (redirect to login if not authenticated)
- Auto-login on app start
- Bottom tab navigation
- Native TailwindCSS styling using `nativewind`
- Clean & scalable project structure

---

## 🦩 Stack

| Tech              | Description                                |
|-------------------|--------------------------------------------|
| Expo (TypeScript) | Fast, cross-platform mobile dev            |
| expo-router       | File-based navigation                     |
| Zustand           | Lightweight state management              |
| Axios             | Promise-based HTTP client                 |
| NativeWind        | TailwindCSS for React Native               |
| Expo Secure Store | Secure token storage (encrypted)          |

---

## 💠 Setup Instructions

1. **Clone this repository:**

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

2. **Install dependencies:**

```bash
npm install
```

3. **Run the app:**

```bash
npm run start
```

or

```bash
expo start
```

4. **Environment Variables (optional):**

Create a `.env` file if you want to configure your API URL:

```bash
API_URL=https://api.example.com
```

(You need to modify `lib/api.ts` to use `process.env.API_URL`.)

---

## 📂 Project Structure

```
/app
  /tabs
    index.tsx      // Home screen (to-do list)
    profile.tsx    // Profile screen
  login.tsx         // Login screen
  register.tsx      // Register screen
  _layout.tsx       // App layout & auth guard
/lib
  api.ts            // Axios instance
  authStore.ts      // Zustand auth store
/components
  TodoItem.tsx      // (optional) To-do item component
```

---

## 🖼 Screenshots

| Login Screen | Register Screen | Home Screen | Profile Screen |
|:------------:|:----------------:|:-----------:|:--------------:|
| ![Login](https://via.placeholder.com/200x400.png?text=Login) | ![Register](https://via.placeholder.com/200x400.png?text=Register) | ![Home](https://via.placeholder.com/200x400.png?text=Home) | ![Profile](https://via.placeholder.com/200x400.png?text=Profile) |


---

## 🔥 Upcoming Improvements

- Pull-to-refresh for To-Do list
- Persistent user data (with refresh token)
- Light/Dark mode toggle
- Form validation with `react-hook-form`
- Animated transitions

---

## 🤝 Contributions

Feel free to fork, open issues, or submit pull requests!  
Let's make mobile dev more joyful 🚀

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Made with ❤️ using **React Native** and **Expo**

