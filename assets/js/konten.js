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

  api.baca().then(function (k) {
    var baru = JSON.stringify(k);
    if (baru === sidik) return;          // tidak ada yang berubah, jangan gambar ulang
    terapkan(k);
    tulisSimpanan(k);
  }).catch(function () {
    /* Sengaja diam: pengunjung tetap melihat isi simpanan atau isi bawaan. */
  }).then(galeriSiap);
})();
