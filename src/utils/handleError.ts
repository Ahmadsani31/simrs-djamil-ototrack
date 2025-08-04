import { Toast } from 'toastify-react-native';

const HandleError = (error: any) => {
  if (error.response && error.response.data) {
    const msg = error.response.data.message || 'Terjadi kesalahan.';
    Toast.show({
      position: 'center',
      type: 'error',
      text1: 'Perhatian!',
      text2: msg,
      backgroundColor: '#000',
      textColor: '#fff',
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
