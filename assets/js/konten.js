/* =========================================================================
   GONTOR CUP: hidrasi isi halaman publik dari Google Spreadsheet
   =========================================================================

   Halaman tetap tampil lengkap tanpa berkas ini: isi bawaan sudah ada di
   dalam HTML. Skrip ini hanya MENIMPA bagian yang sudah diubah panitia
   lewat halaman admin. Kalau API belum disetel atau sedang tidak bisa
   dihubungi, isi bawaannya yang dipakai, tanpa pesan kesalahan ke pengunjung.
   ========================================================================= */
(function () {
  "use strict";

  var api = window.GCApi;
  if (!api || !api.siap()) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

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

    var daftarTab = $(".pill-nav", grup);
    var lama = $$('[role="tabpanel"]', grup);
    lama.forEach(function (p) { p.remove(); });

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
  api.baca().then(function (k) {
    try { pasangInfo(k.info); } catch (e) { /* biarkan isi bawaan */ }
    try { pasangPengumuman(k.pengumuman); } catch (e) {}
    try { pasangGaleri(k.galeri); } catch (e) {}
    try { pasangDrive(k.drive); } catch (e) {}
    try { pasangLomba(k.lomba); } catch (e) {}
  }).catch(function () {
    /* Sengaja diam: pengunjung tetap melihat isi bawaan halaman. */
  });
})();
