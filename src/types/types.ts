export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  name: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface TrackingData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}


export interface DataAktif {
  name: string;
  no_polisi: string;
  created_at: boolean;
}

export interface DataKendaraan {
  id: number;
  kegiatan: string;
  reservasi_in: string;
  reservasi_out: string;
  model: string;
  no_polisi: string;
  created_at: string;
  spidometer_in: number;
  spidometer_out: number;
  total_spidometer: number;
  selisih_waktu: any;
}

export interface Checkpoint {
  id: string;
  image: string;
  checkpoint_in: string;
  created_at: string;
  bbm: CheckpointBBM[];
}

export interface CheckpointBBM {
  id: string;
  jenis: string;
  uang?: string;
  liter?: string;
  image: string;
  created_at: string;
}

