import { Toast } from 'toastify-react-native';

const HandleError = (error: any) => {
  if (error.response && error.response.data) {
    const msg = error.response.data.message || 'Terjadi kesalahan.';
    Toast.show({
      position: 'bottom',
      type: 'error',
      text1: 'Perhatian!',
      text2: msg,
    });
  } else if (error.request) {
    Toast.show({
      position: 'bottom',
      type: 'error',
      text1: 'Network Error!',
      text2: 'Tidak bisa terhubung ke server. Cek koneksi kamu.',
    });
  } else {
    Toast.show({
      position: 'bottom',
      type: 'error',
      text1: 'Opps!',
      text2: error.message,
    });
  }
};

export default HandleError;
