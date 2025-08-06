import { Toast } from 'toastify-react-native';

const HandleError = (error: any) => {
  if (error.response && error.response.data) {
    let msg = error.response.data.message || 'Terjadi kesalahan.';
    // Jika message adalah object (misalnya { spidometer: "..." })

    if (typeof msg === 'object' && msg !== null) {
      // Gabungkan semua pesan menjadi satu string
      msg = Object.values(msg).join('\n');
    }

    Toast.show({
      position: 'center',
      type: 'error',
      text1: 'Perhatian!',
      text2: msg,
      backgroundColor: '#000',
      textColor: '#fff',
      visibilityTime: 5000,
    });
  } else if (error.request) {
    Toast.show({
      position: 'center',
      type: 'error',
      text1: 'Network Error!',
      text2:
        'Tidak bisa terhubung ke server. Cek koneksi kamu. pastikan kamu berada dalam jangkauan internet.',
      backgroundColor: '#000',
      textColor: '#fff',
    });
  } else {
    Toast.show({
      position: 'center',
      type: 'error',
      text1: 'Opps!',
      text2: error.message,
      backgroundColor: '#000',
      textColor: '#fff',
    });
  }
};

export default HandleError;
