// Single source of truth untuk warna brand & class shortcuts.
// - `brand` / `brandSecondary`: hex literals untuk RN style props & native APIs
//   (StatusBar, headerStyle.backgroundColor, foreground service icon, dll.)
// - `primary` / `secondary` / `danger` / `warning`: Tailwind class strings yang
//   dipakai langsung di `className`. Jangan campurkan dengan grup di atas.
//
// Untuk NativeWind class brand (`bg-brand`, `text-brand`), warna terdaftar di
// `tailwind.config.js`.
export const colors = {
  // Hex tokens
  brand: '#205781',
  brandSecondary: '#4F959D',

  // Tailwind className tokens (legacy - dipakai sebagai class string)
  primary: 'bg-[#FD8B51]',
  secondary: 'bg-[#273F4F]',
  danger: 'bg-[#8E1616]',
  warning: 'bg-[#644A07]',
};
