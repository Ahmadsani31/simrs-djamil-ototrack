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


export interface dataAktif {
    id: number;
    name: string;
    no_polisi: string;
    kegiatan: string;
    created_at: string
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
  spidometer_file_in:string;
  spidometer_file_out:string;
}


export interface Checkpoint {
    id: number;
    checkpoint_name: string;
    checkpoint_in: string;
    checkpoint_out: string;
    image: string;
    data: CheckpointBBM[];
}

export interface CheckpointBBM {
    id: number;
    reservasi_id: string;
    checkpoint_id: string;
    jenis: string;
    uang: string;
    liter: string;
    image: string;
    created_at: string;
}

export interface CheckpointReservasi {
    id: number;
    checkpoint_in: string;
    image: string;
    created_at: string;
    data: bbmReservasi[];
}

export interface bbmReservasi {
    id: number;
    jenis: string;
    uang: string;
    liter: string;
    image: string;
    created_at: string;
}


export interface KendaraanItemProps {
  model: string;
  no_polisi: string;
  kondisi: string;
}

export interface Kendaraan {
  id: number;
  model: string;
  no_polisi: string;
  kondisi: string;
}
