/* =========================================================================
   GONTOR CUP: hidrasi isi halaman publik dari Google Spreadsheet
   =========================================================================

   Sebagian besar halaman tetap tampil lengkap tanpa berkas ini: isi bawaannya
   sudah ada di dalam HTML dan skrip ini hanya MENIMPA yang sudah diubah
   panitia lewat halaman admin. KECUALI galeri — halaman itu tidak punya foto
   bawaan sama sekali, jadi isinya sepenuhnya dari sini.
   ========================================================================= */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Galeri tampil sebagai rangka abu-abu sampai fungsi ini dipanggil. Harus
     dipanggil di SETIAP jalan keluar, termasuk saat API belum disetel dan
     saat servernya tidak bisa dihubungi — kalau tidak, rangkanya menggantung
     selamanya. */
  function galeriSiap() {
    var g = $("#galeri-tabs");
    if (g) g.classList.remove("is-memuat");
  }

  var api = window.GCApi;
  if (!api || !api.siap()) { galeriSiap(); return; }

  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var IKON = {
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'
  };
  function ic(nama) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
           'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IKON[nama] + "</svg>";
  }

  /* ---------------------------------------------------------------- info */
  function pasangInfo(info) {
    if (!info) return;
    $$("[data-gc]").forEach(function (el) {
      var nilai = info[el.dataset.gc];
      if (nilai) el.textContent = nilai;
    });
    var cd = $("[data-countdown]");
    if (cd && info.countdown) cd.dataset.countdown = info.countdown;
  }

  /* ---------------------------------------------------------- pengumuman */
  function pasangPengumuman(daftar) {
    var wadah = $("#daftar-pengumuman");
    if (!wadah || !Array.isArray(daftar)) return;

    var pinned = daftar.filter(function (p) { return p.pinned; })[0];
    var sisa = daftar.filter(function (p) { return !p.pinned; });

    var kotakPin = $("#pengumuman-pinned");
    if (kotakPin) {
      if (pinned) {
        kotakPin.hidden = false;
        $("[data-pin-label]", kotakPin).textContent = pinned.label || "Penting";
        $("[data-pin-tanggal]", kotakPin).textContent = pinned.tanggal || "";
        $("[data-pin-judul]", kotakPin).textContent = pinned.judul || "";
        $("[data-pin-isi]", kotakPin).textContent = pinned.isi || "";
      } else {
        kotakPin.hidden = true;
      }
    }

    wadah.innerHTML = sisa.map(function (p) {
      return '<article class="card reveal is-in" data-kategori="' + esc(p.kategori || "umum") + '">' +
        '<div class="row" style="margin-bottom:14px">' +
          '<span class="badge badge--' + esc(p.warna || "muted") + '">' +
            '<span class="badge-dot"></span>' + esc(p.label || "Umum") + "</span>" +
          '<span class="small muted">' + ic("calendar") + " " + esc(p.tanggal || "") + "</span>" +
        "</div>" +
        '<h3 style="font-size:1.14rem">' + esc(p.judul) + "</h3>" +
        '<p class="muted" style="margin:0">' + esc(p.isi) + "</p>" +
      "</article>";
    }).join("");

    // Beranda: tiga pengumuman terbaru
    var ringkas = $("#pengumuman-ringkas");
    if (ringkas) {
      ringkas.innerHTML = daftar.slice(0, 3).map(function (p) {
        return '<a class="card card--link reveal is-in" href="pengumuman.html">' +
          '<span class="card__top"></span>' +
          '<div class="row" style="margin-bottom:14px">' +
            '<span class="badge badge--' + esc(p.warna || "muted") + '">' +
              '<span class="badge-dot"></span>' + esc(p.label || "Umum") + "</span>" +
            '<span class="small muted">' + esc(p.tanggal || "") + "</span>" +
          "</div>" +
          '<h3 style="font-size:1.1rem">' + esc(p.judul) + "</h3>" +
          '<p class="muted">' + esc(p.isi).slice(0, 150) + "…</p>" +
          '<span class="card__meta">Baca selengkapnya' + ic("arrow") + "</span>" +
        "</a>";
      }).join("");
    }
  }

  /* -------------------------------------------------------------- galeri */
  function pasangGaleri(hari) {
    var grup = $("#galeri-tabs");
    if (!grup || !Array.isArray(hari) || !hari.length) return;

    // Buang rangka pemuatan, keadaan kosong, dan hasil pemanggilan sebelumnya.
    $$('.galeri-rangka, .galeri-kosong, .pill-nav, [role="tabpanel"]', grup)
      .forEach(function (el) { el.remove(); });

    var daftarTab = document.createElement("div");
    daftarTab.className = "pill-nav";
    daftarTab.setAttribute("role", "tablist");
    daftarTab.setAttribute("aria-label", "Pilih hari perlombaan");
    daftarTab.style.marginBottom = "32px";
    grup.appendChild(daftarTab);

    daftarTab.innerHTML = hari.map(function (h, i) {
      return '<button type="button" class="pill" role="tab" id="tab-' + esc(h.slug) + '" ' +
        'aria-controls="panel-' + esc(h.slug) + '" aria-selected="' + (i === 0) + '" ' +
        'tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(h.label) +
        '<span class="count">' + (h.foto || []).length + "</span></button>";
    }).join("");

    hari.forEach(function (h, i) {
      var foto = h.foto || [];
      var isi = foto.length
        ? foto.map(function (f) {
            return '<button type="button" class="shot" data-caption="' + esc(f.caption || "") + '">' +
              '<img src="' + esc(f.url) + '" alt="' + esc(f.caption || "Dokumentasi " + h.label) + '" ' +
              'loading="lazy" data-full="' + esc(f.penuh || f.url) + '">' +
              '<span class="shot__cap">' + esc(f.caption || "") + "</span></button>";
          }).join("")
        : '<div class="card card--flat center" style="grid-column:1/-1;padding:56px 24px">' +
          '<p class="muted" style="margin:0">Dokumentasi hari ini belum diunggah panitia.</p></div>';

      var panel = document.createElement("div");
      panel.id = "panel-" + h.slug;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", "tab-" + h.slug);
      panel.setAttribute("tabindex", "0");
      if (i) panel.hidden = true;
      panel.innerHTML =
        '<div class="between" style="margin-bottom:24px">' +
          "<div><h3 class=\"display\" style=\"margin-bottom:6px\">" + esc(h.tema || h.label) + "</h3>" +
          '<p class="muted small" style="margin:0">' + ic("calendar") + " " + esc(h.tanggal || "") +
          " &nbsp;·&nbsp; " + foto.length + " foto</p></div>" +
          '<a class="btn btn--ghost btn--sm" href="unduh-foto.html">' + ic("download") +
          '<span class="btn__label">Unduh resolusi penuh</span></a>' +
        "</div>" +
        '<div class="gallery" data-gallery>' + isi + "</div>";
      grup.appendChild(panel);
    });

    document.dispatchEvent(new CustomEvent("gc:tab-diperbarui"));
  }

  /* -------------------------------------------------------------- jadwal */
  /* Baris diurutkan menurut teks jamnya, lalu yang jamnya sama persis
     digabung jadi satu kartu. Urutan teks sudah benar karena jamnya selalu
     "HH:MM - ..." dengan angka berimbuh nol, sehingga "07:30 - 07:40"
     mendahului "07:30 - Selesai" dan "09:00" mendahului "15:45". */
  function pasangJadwal(hari) {
    var grup = $("#jadwal-tabs");
    if (!grup || !Array.isArray(hari) || !hari.length) return;

    $$('.pill-nav, [role="tabpanel"]', grup).forEach(function (el) { el.remove(); });

    var daftarTab = document.createElement("div");
    daftarTab.className = "pill-nav";
    daftarTab.setAttribute("role", "tablist");
    daftarTab.setAttribute("aria-label", "Pilih hari perlombaan");
    daftarTab.style.marginBottom = "32px";
    grup.appendChild(daftarTab);

    daftarTab.innerHTML = hari.map(function (h, i) {
      return '<button type="button" class="pill" role="tab" id="tab-' + esc(h.slug) + '" ' +
        'aria-controls="panel-' + esc(h.slug) + '" aria-selected="' + (i === 0) + '" ' +
        'tabindex="' + (i === 0 ? 0 : -1) + '">' + esc(h.label) +
        '<span class="count">' + (h.sesi || []).length + "</span></button>";
    }).join("");

    hari.forEach(function (h, i) {
      var sesi = (h.sesi || []).slice().sort(function (a, b) {
        return String(a.jam).localeCompare(String(b.jam));
      });

      var kartu = "", jam = null, tumpuk = [];
      function tutup() {
        if (!tumpuk.length) return;
        kartu += '<div class="card jadwal-slot reveal is-in">' +
          '<p class="jadwal-slot__jam">' + ic("clock") + esc(jam) + "</p>" +
          '<ul class="jadwal-daftar">' + tumpuk.map(function (b) {
            return '<li class="jadwal-baris">' +
              '<span class="jadwal-baris__lomba">' + esc(b.lomba) + "</span>" +
              (b.babak ? '<span class="badge badge--muted">' + esc(b.babak) + "</span>" : "") +
              '<span class="jadwal-baris__venue">' + ic("pin") + esc(b.venue) + "</span></li>";
          }).join("") + "</ul></div>";
        tumpuk = [];
      }
      sesi.forEach(function (b) {
        if (b.jam !== jam) { tutup(); jam = b.jam; }
        tumpuk.push(b);
      });
      tutup();

      var panel = document.createElement("div");
      panel.id = "panel-" + h.slug;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", "tab-" + h.slug);
      panel.setAttribute("tabindex", "0");
      if (i) panel.hidden = true;
      panel.innerHTML =
        '<div class="between" style="margin-bottom:24px"><div>' +
          '<h3 class="display" style="margin-bottom:6px">' + esc(h.label) + "</h3>" +
          '<p class="muted small" style="margin:0">' + ic("calendar") + " " + esc(h.tanggal || "") +
          " &nbsp;·&nbsp; " + sesi.length + " pertandingan</p></div></div>" + kartu;
      grup.appendChild(panel);
    });

    document.dispatchEvent(new CustomEvent("gc:tab-diperbarui"));
  }

  /* --------------------------------------------------------- tautan drive */
  function pasangDrive(daftar) {
    if (!Array.isArray(daftar)) return;
    daftar.forEach(function (d) {
      var kartu = $('[data-kampus="' + d.kampus + '"]');
      if (!kartu) return;
      var buka = $("[data-drive-buka]", kartu);
      var salin = $("[data-drive-salin]", kartu);
      var jml = $("[data-drive-jumlah]", kartu);
      var upd = $("[data-drive-pembaruan]", kartu);
      if (d.url) {
        if (buka) { buka.href = d.url; buka.removeAttribute("aria-disabled"); }
        if (salin) salin.dataset.copy = d.url;
      }
      if (jml) jml.textContent = (d.jumlah || "Belum ada") + " foto";
      if (upd) upd.textContent = d.pembaruan || "Menyusul";

      var baris = $('[data-kampus-baris="' + d.kampus + '"]');
      if (baris) {
        var sel = baris.querySelectorAll("td");
        if (sel[2]) sel[2].textContent = d.jumlah || "Belum ada";
        if (sel[3]) sel[3].textContent = d.pembaruan || "Menyusul";
        var a = baris.querySelector("a");
        if (a && d.url) a.href = d.url;
      }
    });
  }

  /* --------------------------------------------------------------- lomba */
  function pasangLomba(peta) {
    if (!peta) return;
    Object.keys(peta).forEach(function (slug) {
      var acc = $('.acc[data-lomba="' + slug + '"]');
      if (!acc) return;
      var l = peta[slug];
      var bPeserta = $("[data-lomba-peserta]", acc);
      var bTempat = $("[data-lomba-tempat]", acc);
      var ul = $("[data-lomba-poin]", acc);
      if (bPeserta && l.peserta) bPeserta.textContent = l.peserta;
      if (bTempat && l.tempat) bTempat.textContent = l.tempat;
      if (ul && Array.isArray(l.poin) && l.poin.length) {
        ul.innerHTML = l.poin.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
      }
    });
  }

  /* --------------------------------------------------------------- bagan */
  /* Halaman Bagan sudah memuat bagannya sendiri: pasangan lawan adalah
     keputusan panitia yang tidak menunggu apa pun, jadi ia tertanam di HTML
     dan tetap tampil tanpa sambungan Google. Yang dikerjakan di sini hanya
     MENGISI kartu yang sudah ada, bukan membangunnya ulang. Itu disengaja:
     dengan begitu tidak ada penggambar bagan kedua yang harus dijaga supaya
     sama dengan yang di tools/pages_e.py, tidak seperti jadwal dan galeri.

     Kaitnya tiga atribut: [data-bagan] tiap cabang, [data-laga] tiap
     pertandingan, [data-sisi] tiap peserta. Struktur bagannya sendiri datang
     dari window.GC_BAGAN (assets/js/bagan-bawaan.js, juga dihasilkan
     pages_e.py), jadi pasangan lawan hanya ditulis di satu tempat.

     Bentuk data hasil di sheet Konten, kunci "bagan":
       { "<slug cabang>": { "<kode laga>": { kiri, kanan, menang } } }
     `kiri` dan `kanan` adalah skor apa adanya sebagai teks (bisa "3", bisa
     "21-18"), `menang` adalah KODE KAMPUS pemenangnya, bukan sisi kiri atau
     kanan: kode kampus tetap sah dibaca walau panitia merevisi pasangannya. */

  function labelLaga(c, kode) {
    for (var i = 0; i < c.laga.length; i++) {
      if (c.laga[i].kode === kode) return c.laga[i].label;
    }
    return kode;
  }

  function hasilLaga(hasil, slug, kode) {
    var c = hasil[slug];
    return (c && c[kode]) || null;
  }

  /** Kampus di satu sisi laga, atau null kalau masih menunggu laga lain. */
  function timSisi(c, laga, arah, hasil) {
    var ref = laga[arah];                    // ["tim","G3"] atau ["menang","m1"]
    if (!ref) return null;
    if (ref[0] === "tim") return ref[1];
    var h = hasilLaga(hasil, c.slug, ref[1]);
    return (h && h.menang) || null;
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

  function gambarCabang(S, c, hasil, nama) {
    var wadah = $('[data-bagan="' + c.slug + '"]');
    if (!wadah) return;
    var juara = null;

    c.laga.forEach(function (laga) {
      var kartu = $('[data-laga="' + laga.kode + '"]', wadah);
      if (!kartu) return;
      var kiri = timSisi(c, laga, "kiri", hasil);
      var kanan = timSisi(c, laga, "kanan", hasil);
      var menang = pemenangSah(c, laga, hasil, kiri, kanan);
      var h = hasilLaga(hasil, c.slug, laga.kode) || {};
      if (laga.kode === "m4" && menang) juara = menang;

      [["kiri", kiri], ["kanan", kanan]].forEach(function (p) {
        var sisi = $('[data-sisi="' + p[0] + '"]', kartu);
        if (!sisi) return;
        var elNama = $(".laga__tim", sisi);
        var elSkor = $(".laga__skor", sisi);
        var kode = p[1];

        if (elNama) {
          if (kode) {
            elNama.textContent = nama[kode] || kode;
            elNama.classList.remove("laga__tim--nanti");
          } else {
            // Belum ketahuan: kembalikan ke tulisan bawaannya, jangan menebak.
            elNama.textContent = "Pemenang " + labelLaga(c, laga[p[0]][1]);
            elNama.classList.add("laga__tim--nanti");
          }
        }
        if (elSkor) {
          var skor = h[p[0]];
          elSkor.textContent = (skor === 0 || skor) ? String(skor) : "\u2013";
        }
        sisi.classList.toggle("is-menang", !!menang && kode === menang);
        sisi.classList.toggle("is-kalah", !!menang && !!kode && kode !== menang);
      });
    });

    var lencana = $("[data-juara-cabang]", $('[data-bagan="' + c.slug + '"]').parentNode);
    if (lencana) {
      var teks = $("span", lencana);
      if (juara) {
        if (teks) teks.textContent = "Juara: " + (nama[juara] || juara);
        lencana.hidden = false;
      } else {
        lencana.hidden = true;
      }
    }
  }

  /* ------------------------------------------------------------ klasemen */
  /* Nilai klasemen TIDAK dihitung dari bagan. Ia berasal dari SELURUH cabang
     lomba, bukan hanya delapan cabang yang berbagan, jadi panitia yang
     memasukkannya lewat panel admin sebagai satu angka kumulatif per kampus.

     Bentuk datanya di sheet Konten, kunci "klasemen":
       { "<kode kampus>": "<nilai>" }
     Nilainya disimpan apa adanya sebagai teks dan ditampilkan apa adanya;
     yang diubah jadi angka hanya untuk MENGURUTKAN. Dengan begitu panitia
     boleh menulis "1.250" atau "97,5" tanpa angkanya berubah sendiri di
     halaman.

     Daftar kampusnya diambil dari window.GC_BAGAN.kampus. Berkas itu memang
     bernama bagan, tetapi ia satu-satunya tempat kelima kampus ditulis. */

  /** Angka untuk mengurutkan, atau null kalau kotaknya memang belum diisi. */
  function nilaiUrut(teks) {
    if (teks === 0) return 0;
    if (!teks) return null;
    var bersih = String(teks).replace(/\./g, "").replace(/,/g, ".").replace(/[^\d.\-]/g, "");
    var n = parseFloat(bersih);
    return isNaN(n) ? null : n;
  }

  function gambarKlasemen(S, nilai) {
    var tbody = $("[data-klasemen]");
    if (!tbody) return;
    nilai = nilai && typeof nilai === "object" ? nilai : {};

    var baris = S.kampus.map(function (k) {
      var mentah = nilai[k.kode];
      return { kode: k.kode, nama: k.nama, teks: (mentah === 0 || mentah) ? String(mentah) : "",
               urut: nilaiUrut(mentah) };
    });
    var terisi = baris.filter(function (b) { return b.urut !== null; }).length;

    /* Kampus yang belum ada nilainya selalu di bawah, berapa pun nilai yang
       lain. Tanpa aturan ini kotak kosong terbaca sebagai nol dan kampus yang
       nilainya belum sempat dimasukkan tampak kalah telak. */
    baris.sort(function (a, b) {
      if (a.urut === null && b.urut === null) return a.kode.localeCompare(b.kode);
      if (a.urut === null) return 1;
      if (b.urut === null) return -1;
      return (b.urut - a.urut) || a.kode.localeCompare(b.kode);
    });

    tbody.innerHTML = baris.map(function (b, i) {
      // Peringkat hanya ditulis untuk kampus yang sudah punya nilai, dan sama
      // sekali tidak ditulis selama belum ada satu nilai pun: menomori lima
      // kampus yang semuanya kosong akan terbaca sebagai peringkat yang jadi.
      var pos = (terisi && b.urut !== null) ? String(i + 1) : "\u2013";
      return '<tr data-kampus="' + esc(b.kode) + '"' +
          (terisi && i === 0 && b.urut !== null ? ' class="is-puncak"' : "") + ">" +
        '<td class="klasemen__pos">' + pos + "</td>" +
        '<th scope="row"><span class="klasemen__nama">' +
          '<span class="klasemen__kode">' + esc(b.kode) + "</span>" +
          esc(b.nama) + "</span></th>" +
        '<td class="num klasemen__poin">' + (b.teks ? esc(b.teks) : "\u2013") + "</td>" +
      "</tr>";
    }).join("");

    var status = $("[data-klasemen-status]");
    if (status) {
      status.innerHTML = ic("clock") + " <span>" + (terisi
        ? "Nilai diperbarui panitia selama acara berlangsung."
        : "Belum ada nilai yang dimasukkan panitia.") + "</span>";
    }
  }

  function pasangKlasemen(nilai) {
    var S = window.GC_BAGAN;
    if (!S || !$("[data-klasemen]")) return;
    gambarKlasemen(S, nilai);
  }

  function pasangBagan(hasil) {
    var S = window.GC_BAGAN;
    if (!S || !$("#bagan-tabs")) return;       // halaman lain, tidak ada bagan
    hasil = hasil && typeof hasil === "object" ? hasil : {};
    var nama = {};
    S.kampus.forEach(function (k) { nama[k.kode] = k.nama; });
    S.cabang.forEach(function (c) { gambarCabang(S, c, hasil, nama); });
  }

  /* ----------------------------------------------------------------- muat */
  /* Membaca isi dari Apps Script makan 2 sampai 4 detik, kadang belasan detik
     kalau skripnya sedang "dingin" — itu ongkos tetap Google, bukan ukuran
     datanya (isinya cuma ±3 KB). Kalau halaman menunggu jawaban itu dulu,
     pengunjung melihat isi LAMA yang tertanam di HTML selama beberapa detik,
     lalu isinya berkedip berganti.

     Karena itu jawaban terakhir disimpan di localStorage dan dipasang LEBIH
     DULU, sebelum jaringan disentuh sama sekali. Panggilan ke server tetap
     jalan di belakang layar dan hanya menggambar ulang kalau isinya memang
     berbeda. Akibatnya: kunjungan pertama sama seperti sebelumnya, kunjungan
     berikutnya langsung tampil.

     Simpanan ini hanya salinan isi yang toh sudah publik; tidak ada data
     pribadi di dalamnya. */
  var KUNCI_SIMPANAN = "gc:konten:v1";

  function terapkan(k) {
    try { pasangInfo(k.info); } catch (e) { /* biarkan isi bawaan */ }
    try { pasangPengumuman(k.pengumuman); } catch (e) {}
    try { pasangGaleri(k.galeri); } catch (e) {}
    try { pasangJadwal(k.jadwal); } catch (e) {}
    try { pasangDrive(k.drive); } catch (e) {}
    try { pasangLomba(k.lomba); } catch (e) {}
    try { pasangBagan(k.bagan); } catch (e) {}
    try { pasangKlasemen(k.klasemen); } catch (e) {}
    /* main.js memasang ulang bagian yang membaca nilai dari HTML (hitung
       mundur) — nilai bawaannya sudah terlanjur dibaca saat boot. */
    document.dispatchEvent(new CustomEvent("gc:konten-diperbarui"));
  }

  /* localStorage bisa melempar, bukan cuma kosong: mode penyamaran, kuota
     penuh, atau situs yang ditolak menyimpan. Semua jalur di bawah harus
     tetap berakhir dengan halaman yang normal. */
  function bacaSimpanan() {
    try {
      var mentah = window.localStorage.getItem(KUNCI_SIMPANAN);
      if (!mentah) return null;
      var o = JSON.parse(mentah);
      return o && o.konten ? o.konten : null;
    } catch (e) { return null; }
  }

  function tulisSimpanan(konten) {
    try {
      window.localStorage.setItem(KUNCI_SIMPANAN,
        JSON.stringify({ waktu: Date.now(), konten: konten }));
    } catch (e) { /* tidak bisa menyimpan: cuma kehilangan percepatannya */ }
  }

  var tersimpan = bacaSimpanan();
  var sidik = null;
  if (tersimpan) {
    sidik = JSON.stringify(tersimpan);
    try { terapkan(tersimpan); } catch (e) { sidik = null; }
    galeriSiap();
  }

  /* Dipakai sekali saat halaman dibuka, dan berulang di halaman Bagan.
     `sidik` WAJIB ikut diperbarui di sini: tanpa itu pembandingnya selamanya
     membandingkan dengan isi simpanan yang pertama, dan pemanggilan kedua
     menggambar ulang seluruh halaman walau tidak ada yang berubah. */
  function segarkan() {
    return api.baca().then(function (k) {
      var baru = JSON.stringify(k);
      if (baru === sidik) return;        // tidak ada yang berubah, jangan gambar ulang
      sidik = baru;
      terapkan(k);
      tulisSimpanan(k);
    });
  }

  segarkan().catch(function () {
    /* Sengaja diam: pengunjung tetap melihat isi simpanan atau isi bawaan. */
  }).then(galeriSiap);

  /* Halaman Klasemen sendirian yang isinya berubah SELAMA dibuka: panitia
     memasukkan nilai dan skor sementara pengunjung menonton. Halaman lain
     cukup dibaca sekali saat dibuka.

     Penghitungnya berhenti saat tab tidak terlihat, lalu menyegarkan sekali
     begitu kembali terlihat. Tanpa itu, tab yang ditinggal semalaman tetap
     memanggil Apps Script sepanjang malam.

     DUA MENIT, BUKAN SATU, dan angka ini jangan diturunkan. Satu panggilan ke
     Apps Script diukur memakan sekitar 2 detik (diukur 19 September 2026 dari
     situs sungguhan: 1,9 detik, balasan 3 KB). Ongkos itu ongkos tetap Google,
     bukan ukuran datanya, dan Apps Script membatasi berapa banyak permintaan
     boleh berjalan bersamaan. Begitu batasnya kena, ia berhenti membalas JSON
     dan mulai membalas HALAMAN HTML, dan seluruh situs, termasuk panel admin,
     melaporkan "server membalas halaman web, bukan data".

     Saat acara berlangsung halaman ini yang paling banyak dibuka bersamaan.
     Tiap tab yang terbuka satu jam = 30 panggilan; seratus tab = 3.000
     panggilan per jam, seluruhnya ke satu skrip yang sama. Itu sebabnya jeda
     ini dinaikkan, bukan diturunkan, kalau nanti ragu. */
  if (document.body.getAttribute("data-page") === "bagan.html") {
    var JEDA_BAGAN = 120000;
    var jam = null;

    function mulaiJam() {
      if (!jam) jam = setInterval(function () { segarkan().catch(function () {}); }, JEDA_BAGAN);
    }
    function hentiJam() {
      if (jam) { clearInterval(jam); jam = null; }
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { hentiJam(); return; }
      segarkan().catch(function () {});
      mulaiJam();
    });
    if (!document.hidden) mulaiJam();
  }
})();
