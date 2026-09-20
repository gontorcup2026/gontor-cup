/* =========================================================================
   GONTOR CUP: pembaca bagan dan penghitung poin Olah Raga
   =========================================================================

   DIPAKAI BERSAMA halaman publik (assets/js/konten.js) dan panel admin
   (admin/admin.js). Itu sebabnya ia berkas sendiri, dan itu bukan sekadar
   kerapian: logika "siapa di sisi mana" sempat ada dua salinan yang sudah
   BERBEDA ISI, dan yang di panel admin merambatkan pemenang tanpa
   memvalidasinya. Menumpuk perhitungan poin di atas dua salinan yang berbeda
   berarti panel admin dan halaman publik bisa menampilkan angka berbeda untuk
   data yang sama persis.

   JANGAN menambahkan ketergantungan ke api.js atau config.js di sini. Berkas
   ini dimuat lebih dulu daripada keduanya di panel admin, dan konten.js
   sendiri keluar lebih awal kalau API belum disetel.

   Bentuk data hasil (sheet Konten, kunci "bagan"):
     { "<slug cabang>": { "<kode laga>": { kiri: skor, kanan: skor,
                                           menang: "<kode kampus>" } } }
   ========================================================================= */
(function () {
  "use strict";

  function hasilLaga(hasil, slug, kode) {
    var c = hasil && hasil[slug];
    return (c && c[kode]) || null;
  }

  /** Laga dalam cabang ini menurut kodenya, atau null. */
  function lagaBerkode(c, kode) {
    for (var i = 0; i < c.laga.length; i++) {
      if (c.laga[i].kode === kode) return c.laga[i];
    }
    return null;
  }

  /** Pemenang laga, hanya kalau kodenya memang salah satu dari dua sisinya.

     Data lama bisa menyebut kampus yang tidak lagi ada di pasangan itu, mis.
     kalau panitia merevisi bagan setelah skornya terisi. Yang begitu
     diabaikan: menandai pemenang yang tidak ikut bermain jauh lebih buruk
     daripada menampilkan laga itu sebagai belum ada hasilnya. */
  function pemenangSah(c, laga, hasil, kiri, kanan) {
    var h = hasilLaga(hasil, c.slug, laga.kode);
    if (!h || !h.menang) return null;
    if (h.menang !== kiri && h.menang !== kanan) return null;
    return h.menang;
  }

  /** Pemenang SAH sebuah laga menurut kodenya, atau null.

     Dipakai timSisi, dan itu yang penting: pemenang yang tidak cocok dengan
     pasangan lawannya harus berhenti DI SITU, tidak boleh merambat ke babak
     berikutnya. Dulu tidak begitu, dan akibatnya kartu laganya sendiri benar
     (tidak menandai siapa pun menang) sementara babak berikutnya memajang
     kampus yang tidak pernah bermain di situ, malah tanpa kelas
     `laga__tim--nanti` sehingga terbaca sebagai sudah pasti.

     `dalam` cuma pengaman kalau data bagannya kelak salah sunting dan
     melingkar; rantai sungguhannya paling dalam tiga tingkat. */
  function pemenangLaga(c, kode, hasil, dalam) {
    dalam = dalam || 0;
    var laga = lagaBerkode(c, kode);
    if (!laga || dalam > 8) return null;
    var kiri = timSisi(c, laga, "kiri", hasil, dalam + 1);
    var kanan = timSisi(c, laga, "kanan", hasil, dalam + 1);
    return pemenangSah(c, laga, hasil, kiri, kanan);
  }

  /** Kampus di satu sisi laga, atau null kalau masih menunggu laga lain. */
  function timSisi(c, laga, arah, hasil, dalam) {
    var ref = laga[arah];                    // ["tim","G3"] atau ["menang","m1"]
    if (!ref) return null;
    if (ref[0] === "tim") return ref[1];
    return pemenangLaga(c, ref[1], hasil, dalam);
  }

  /* --------------------------------------------------------------- poin */
  /* Poin tiap laga ada di dalam laga itu sendiri (`laga.poin`), disalin
     tools/data_bagan.py dari kotak poin di Bagan Lomba.pptx. Di situ pula
     alasan kenapa Pertandingan II bernilai dua kali lipat.

     POIN BYE DITUNDA sampai Pertandingan I punya pemenang sah. Bye adalah
     ganti karena tidak bermain di Pertandingan I, jadi ia jatuh tempo tepat
     ketika pertandingan itu selesai. Kalau diberikan sejak awal, papan
     klasemen menampilkan G2 memimpin 175-0 sebelum satu laga pun dimainkan,
     sebab slot bye tidak terbagi rata: G2 kebagian lima kali, G5 tidak
     sekali pun. Totalnya di akhir acara tetap sama persis dengan aturan
     panitia; yang berubah hanya kapan angkanya muncul. */
  function hitungPoin(S, hasil) {
    var poin = {};
    if (!S || !S.kampus || !S.cabang) return poin;
    S.kampus.forEach(function (k) { poin[k.kode] = 0; });

    function beri(kode, n) {
      if (kode && Object.prototype.hasOwnProperty.call(poin, kode)) poin[kode] += n;
    }

    S.cabang.forEach(function (c) {
      c.laga.forEach(function (laga) {
        if (!laga.poin) return;
        var kiri = timSisi(c, laga, "kiri", hasil);
        var kanan = timSisi(c, laga, "kanan", hasil);
        var menang = pemenangSah(c, laga, hasil, kiri, kanan);
        if (!menang) return;               // belum ada hasil, atau hasilnya tidak sah
        beri(menang, laga.poin.menang);
        beri(menang === kiri ? kanan : kiri, laga.poin.kalah);
      });
      if (c.poin_bye && pemenangLaga(c, "m1", hasil)) beri(c.bye, c.poin_bye);
    });
    return poin;
  }

  /** Angka dari kotak isian klasemen, atau null kalau kotaknya memang kosong.

     Bukan urusan bagan, tetapi tinggal di sini karena dibutuhkan halaman DAN
     panel admin, dan dua salinan aturan "kosong bukan nol" adalah cara paling
     mudah membuat keduanya tidak sepakat. Kotak yang dikosongkan berarti
     BELUM DIISI, bukan nol; "1.250" dan "97,5" ditulis dengan cara Indonesia,
     jadi titik dibuang dan koma menjadi titik. */
  function angkaKlasemen(teks) {
    if (teks === 0) return 0;
    if (!teks) return null;
    var bersih = String(teks).replace(/\./g, "").replace(/,/g, ".").replace(/[^\d.\-]/g, "");
    var n = parseFloat(bersih);
    return isNaN(n) ? null : n;
  }

  /** Angka ditulis dengan cara Indonesia: titik ribuan, koma desimal.

     Dibutuhkan sejak poin manual DIJUMLAHKAN dengan poin Olah Raga. Dulu
     nilai manual ditampilkan sebagai teks apa adanya, jadi "1.250" yang
     diketik panitia tampil "1.250" tanpa usaha. Begitu ia jadi hasil
     penjumlahan, yang tersisa cuma angka, dan JavaScript menuliskannya
     "1250" dan "97.5" — keduanya salah untuk pembaca Indonesia.

     Intl dipakai kalau ada, dengan jalan mundur yang sederhana kalau tidak:
     halaman tidak boleh gagal hanya karena pemformat angka. */
  function tulisAngka(n) {
    if (typeof n !== "number" || !isFinite(n)) return "";
    try {
      return n.toLocaleString("id-ID", { maximumFractionDigits: 2 });
    } catch (e) {
      return String(n).replace(".", ",");
    }
  }

  window.GCBagan = {
    angkaKlasemen: angkaKlasemen,
    tulisAngka: tulisAngka,
    lagaBerkode: lagaBerkode,
    pemenangSah: pemenangSah,
    pemenangLaga: pemenangLaga,
    timSisi: timSisi,
    hitungPoin: hitungPoin,
  };
})();
