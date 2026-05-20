import axios from 'axios';
import { Toast } from 'toastify-react-native';

/**
 * Centralised error handler. Selalu menerima `unknown` (bukan `any`) supaya
 * caller dipaksa lewat type-guard.
 *
 * Skema toast:
 * - Axios response error -> "Perhatian!" + pesan dari `error.response.data.message`
 *   (bisa string atau object `{field: msg}` yang akan digabung jadi multi-line)
 * - Axios request error (timeout / no connection) -> "Network Error!"
 * - Selain itu -> "Opps!" + `Error.message` atau pesan generik.
 */
const HandleError = (error: unknown) => {
  const baseToast = {
    position: 'center' as const,
    type: 'error' as const,
    backgroundColor: '#000',
    textColor: '#fff',
    visibilityTime: 5000,
  };

  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const raw = (error.response.data as { message?: unknown }).message;
      let msg = 'Terjadi kesalahan.';
      if (typeof raw === 'string') {
        msg = raw;
      } else if (raw && typeof raw === 'object') {
        // Backend kadang kirim message sebagai map field-error: { spidometer: '...' }
        msg = Object.values(raw as Record<string, string>).join('\n');
      }

      Toast.show({
        ...baseToast,
        text1: 'Perhatian!',
        text2: msg,
      });
      return;
    }

    if (error.request) {
      Toast.show({
        ...baseToast,
        text1: 'Network Error!',
        text2:
          'Tidak bisa terhubung ke server. Cek koneksi kamu, pastikan kamu berada dalam jangkauan internet.',
      });
      return;
    }
  }

  const fallback = error instanceof Error ? error.message : 'Terjadi kesalahan.';
  Toast.show({
    ...baseToast,
    text1: 'Opps!',
    text2: fallback,
  });
};

export default HandleError;
