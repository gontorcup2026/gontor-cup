/* =========================================================================
   GONTOR CUP: konfigurasi sambungan ke Google
   =========================================================================

   SATU-SATUNYA berkas yang perlu diubah setelah Apps Script dipasang.
   Tempelkan URL Web App-nya di API di bawah, lalu simpan. Selesai.

   Cara mendapatkan URL-nya ada di apps-script/CARA-PASANG.md

   Selama API masih kosong:
     - halaman publik tetap tampil normal memakai isi bawaan di HTML,
     - formulir hanya menampilkan pesan berhasil tanpa mengirim ke mana pun,
     - halaman admin memberi tahu bahwa sambungan belum disetel.
   ========================================================================= */
window.GC = {
  // Contoh: "https://script.google.com/macros/s/AKfycb..../exec"
  API: "https://script.google.com/macros/s/AKfycbxM3AoxE9PWSici33FpQUoCU13HreVU2VmCWypxkKVSbGzvHhDVNkvq9LU1Y8FsWnwj/exec",

  // Nama situs untuk judul halaman admin
  NAMA: "Gontor Cup Antar Kampus 1448/2026"
};
