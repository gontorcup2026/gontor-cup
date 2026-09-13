/* =========================================================================
   GONTOR CUP: pembungkus panggilan ke Apps Script
   Dipakai bersama oleh halaman publik dan halaman admin.
   ========================================================================= */
(function () {
  "use strict";

  var cfg = window.GC || {};

  /**
   * Apps Script kadang membalas halaman HTML, bukan JSON. Paling sering
   * karena "Who has access" belum disetel Anyone, atau URL-nya salah tempel.
   * Tanpa penanganan ini pesannya jadi "Unexpected token '<'", yang tidak
   * memberi tahu panitia apa pun tentang penyebabnya.
   */
  function bacaJson(r) {
    return r.text().then(function (teks) {
      try {
        return JSON.parse(teks);
      } catch (e) {
        if (/^\s*</.test(teks)) {
          throw new Error("server membalas halaman web, bukan data. " +
            "Periksa URL Apps Script di config.js dan pastikan Web App disetel " +
            "“Who has access: Anyone”");
        }
        throw new Error("balasan server tidak terbaca");
      }
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
      return fetch(cfg.API + "?aksi=konten&t=" + Date.now(), { method: "GET" })
        .then(bacaJson)
        .then(function (j) {
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
      return fetch(cfg.API, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(muatan)
      })
        .then(bacaJson)
        .then(function (j) {
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
