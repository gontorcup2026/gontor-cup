/* =========================================================================
   GONTOR CUP: pembungkus panggilan ke Apps Script
   Dipakai bersama oleh halaman publik dan halaman admin.
   ========================================================================= */
(function () {
  "use strict";

  var cfg = window.GC || {};

  /**
   * Apps Script kadang membalas halaman HTML, bukan JSON. Tanpa penanganan
   * ini pesannya jadi "Unexpected token '<'", yang tidak memberi tahu panitia
   * apa pun tentang penyebabnya.
   *
   * Ada DUA sebab yang berbeda, dan keduanya butuh tindakan berbeda:
   *
   * 1. SEKALI DI AWAL, sebelum situs pernah berhasil: URL-nya salah tempel,
   *    atau Web App-nya belum disetel "Who has access: Anyone".
   * 2. SEWAKTU-WAKTU, padahal tadinya berjalan: Google sedang menolak
   *    permintaannya, biasanya karena kuota harian Apps Script (akun biasa
   *    cuma diberi 90 menit waktu jalan sehari) atau sesi Google di peramban
   *    kedaluwarsa sehingga permintaannya dialihkan ke halaman masuk. Yang
   *    kedua inilah yang bikin panel admin tiba-tiba gagal setelah lama
   *    dibuka.
   *
   * Sebab kedua sering hilang sendiri, jadi permintaannya DIULANG SEKALI
   * sebelum menyerah (lihat denganUlang di bawah), dan pesannya menyebut
   * "coba muat ulang halaman" lebih dulu, bukan menyuruh panitia mengutak-atik
   * config.js yang toh sudah benar.
   */
  function bacaJson(r) {
    return r.text().then(function (teks) {
      try {
        return JSON.parse(teks);
      } catch (e) {
        if (/^\s*</.test(teks)) {
          var err = new Error(
            "server membalas halaman web, bukan data. Coba muat ulang halaman " +
            "dan masuk lagi. Kalau tetap begini, kemungkinan kuota harian Google " +
            "Apps Script sudah habis, atau Web App-nya belum disetel " +
            "“Who has access: Anyone”");
          err.balasanHtml = true;      // dipakai denganUlang
          throw err;
        }
        throw new Error("balasan server tidak terbaca");
      }
    });
  }

  /**
   * Menjalankan sebuah permintaan, dan MENGULANGNYA SEKALI kalau yang datang
   * halaman HTML atau jaringannya putus. Jeda 1,2 detik supaya pengalihan
   * sesaat dari Google sempat lewat.
   *
   * Hanya sekali: kalau Google memang sedang menolak, mengulang terus justru
   * mempercepat habisnya kuota, dan panitia lebih butuh tahu bahwa ada yang
   * salah daripada menunggu lingkaran pemuatan yang tidak berhenti.
   */
  function denganUlang(buat) {
    return buat().catch(function (e) {
      if (!e || (!e.balasanHtml && e.name !== "TypeError")) throw e;
      return new Promise(function (res) { setTimeout(res, 1200); }).then(buat);
    });
  }

  var api = {
    /** true kalau URL Apps Script sudah diisi di config.js */
    siap: function () {
      return typeof cfg.API === "string" && cfg.API.indexOf("http") === 0;
    },

    /** Baca isi situs (publik, tanpa sandi). */
    baca: function () {
      if (!api.siap()) return Promise.reject(new Error("belum-disetel"));
      return denganUlang(function () {
        return fetch(cfg.API + "?aksi=konten&t=" + Date.now(), { method: "GET" })
          .then(bacaJson);
      }).then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.pesan) || "Gagal membaca isi situs");
        return j.konten || {};
      });
    },

    /**
     * Kirim perintah ke Apps Script.
     *
     * PENTING: Content-Type sengaja text/plain. Dengan application/json,
     * peramban mengirim permintaan preflight OPTIONS lebih dulu, dan Apps
     * Script tidak melayaninya, sehingga seluruh panggilan gagal CORS.
     * Apps Script tetap membaca badannya sebagai teks lalu di-JSON.parse.
     */
    kirim: function (muatan) {
      if (!api.siap()) return Promise.reject(new Error("belum-disetel"));
      /* Aman diulang: seluruh aksi tulis di Code.gs menimpa baris yang sama
         (simpanKonten_ mencari kuncinya dulu), jadi mengulang tidak membuat
         data ganda. Yang menambah baris cuma kiriman formulir dari pengunjung,
         dan itu tidak pernah lewat jalur yang gagal dengan balasan HTML. */
      return denganUlang(function () {
        return fetch(cfg.API, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(muatan)
        }).then(bacaJson);
      }).then(function (j) {
        if (!j || !j.ok) throw new Error((j && j.pesan) || "Permintaan ditolak server");
        return j;
      });
    },

    /** Ubah File menjadi base64 tanpa awalan data: */
    keBase64: function (file) {
      return new Promise(function (resolve, reject) {
        var fr = new FileReader();
        fr.onload = function () { resolve(String(fr.result).split(",")[1]); };
        fr.onerror = function () { reject(new Error("Berkas gagal dibaca")); };
        fr.readAsDataURL(file);
      });
    },

    /**
     * Perkecil gambar di peramban sebelum diunggah.
     * Foto kamera 6 MB menyusut jadi ±300 KB. Tanpa ini unggahan sering
     * putus karena badan permintaan Apps Script terlalu besar.
     */
    kecilkanGambar: function (file, maksSisi, mutu) {
      maksSisi = maksSisi || 1600;
      mutu = mutu || 0.82;
      return new Promise(function (resolve, reject) {
        if (!/^image\//.test(file.type)) { resolve(file); return; }
        var url = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function () {
          URL.revokeObjectURL(url);
          var w = img.naturalWidth, h = img.naturalHeight;
          var s = Math.min(1, maksSisi / Math.max(w, h));
          var c = document.createElement("canvas");
          c.width = Math.round(w * s);
          c.height = Math.round(h * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (blob) {
            if (!blob) { reject(new Error("Gambar gagal diproses")); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg",
                             { type: "image/jpeg" }));
          }, "image/jpeg", mutu);
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("Gambar tidak terbaca")); };
        img.src = url;
      });
    }
  };

  window.GCApi = api;
})();
