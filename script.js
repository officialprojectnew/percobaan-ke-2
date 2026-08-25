// ========================================================
// IMPORT FIREBASE SDK
// ========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ========================================================
// KONFIGURASI FIREBASE (GANTI DENGAN KODE MILIK ANDA)
// ========================================================
  const firebaseConfig = {
    apiKey: "AIzaSyA31kG55rU8kU-hU-9YTMOdwtG-c8oHCbE",
    authDomain: "cbt-sekolah-4081e.firebaseapp.com",
    projectId: "cbt-sekolah-4081e",
    storageBucket: "cbt-sekolah-4081e.firebasestorage.app",
    messagingSenderId: "368744876228",
    appId: "1:368744876228:web:b4adf08e091a9c858ae191"
  };

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// KONEKSI GOOGLE SCRIPT LAMA (Dipertahankan khusus untuk fungsi upload gambar ke Drive nanti)
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxQVFWzJg8WqGIHV41YxJazeXaJ0m8NJ65lxFyspj0IkZbn3lWh186UVmzovFemJJ9c/exec';

// ========================================================
// FUNGSI AUTENTIKASI GLOBAL (Dibuat global dengan 'window')
// ========================================================
window.checkAuth = function(requiredRole) {
  const user = JSON.parse(localStorage.getItem('userCBT'));
  if (!user || user.role !== requiredRole) {
    window.location.href = 'index.html';
  }
  return user;
}

window.checkIndexLogin = function() {
  const user = JSON.parse(localStorage.getItem('userCBT'));
  if (user) window.location.href = `${user.role}.html`;
}

window.logout = function() {
  localStorage.removeItem('userCBT');
  window.location.href = 'index.html';
}

// ========================================================
// LOGIKA LOGIN FIREBASE (Khusus index.html)
// ========================================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  window.onload = window.checkIndexLogin;

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Mengambil input NISN atau Username murni
    const userVal = document.getElementById('username').value.trim();
    const passVal = document.getElementById('password').value;
    const btnSubmit = document.getElementById('btnSubmit');
    const alertMsg = document.getElementById('alert-msg');

    btnSubmit.innerHTML = "Memproses...";
    btnSubmit.disabled = true;
    alertMsg.classList.add('hidden');
    
    // Trik di latar belakang: Tambahkan @cbt.com agar valid di mata Firebase
    const emailFiktif = userVal + "@cbt.com";
    
    try {
      // 1. Proses validasi NISN + Password ke sistem keamanan Firebase
      const userCredential = await signInWithEmailAndPassword(auth, emailFiktif, passVal);
      const userFirebase = userCredential.user;

      // 2. Tentukan role (Untuk uji coba awal, kita tembak statis sebagai admin)
      // Nanti kita tambahkan logika pengecekan role ke Firestore untuk guru dan siswa
      let role = "admin";
      let nama = "Administrator";

      // 3. Simpan sesi ke localStorage untuk memicu masuk ke halaman dashboard
      const userData = { role: role, nama: nama, id: userVal };
      localStorage.setItem('userCBT', JSON.stringify(userData));

      alertMsg.innerText = `Berhasil masuk sebagai ${role}!`;
      alertMsg.className = "text-center mt-3 text-sm font-semibold text-green-500 block";

      setTimeout(() => {
        window.location.href = `${role}.html`; 
      }, 500);

    } catch (error) {
      btnSubmit.innerHTML = "Masuk";
      btnSubmit.disabled = false;
      alertMsg.innerText = "Username/NISN atau Password salah!";
      alertMsg.className = "text-center mt-3 text-sm font-semibold text-red-500 block";
      console.error(error);
    }
  });
}
