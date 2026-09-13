/* =========================================================================
   GONTOR CUP: logika panel admin
   Tanpa framework. Seluruh data hidup di objek `isi`, disimpan ke Google
   Spreadsheet per bagian lewat tombol "Simpan" masing-masing.
   ========================================================================= */
(function () {
  "use strict";

  var api = window.GCApi;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var KUNCI_TOKEN = "gc-admin-token";
  var token = null;
  var isi = { info: {}, pengumuman: [], galeri: [], drive: [], lomba: {} };

  /* -------------------------------------------------- daftar lomba bawaan */
  var LOMBA_BAWAAN = [
    ["sepakbola", "Sepakbola", "Olah Raga"], ["futsal", "Futsal", "Olah Raga"],
    ["voli", "Voli", "Olah Raga"], ["bola-basket", "Bola Basket", "Olah Raga"],
    ["sepak-takraw", "Sepak Takraw", "Olah Raga"], ["bulutangkis", "Bulutangkis", "Olah Raga"],
    ["tenis-meja", "Tenis Meja", "Olah Raga"], ["panahan", "Panahan", "Olah Raga"],
    ["kaligrafi", "Kaligrafi", "Olah Rasa"], ["musik", "Musik", "Olah Rasa"],
    ["pioneering", "Pioneering", "Olah Rasa"], ["desain-poster", "Desain Poster", "Olah Rasa"],
    ["fotografi", "Fotografi", "Olah Rasa"], ["visual-iklan", "Visual Iklan Brand Pondok", "Olah Rasa"],
    ["kti", "Karya Tulis Ilmiah", "Olah Fikir"], ["cerdas-cermat", "Cerdas Cermat", "Olah Fikir"],
    ["puisi", "Cipta & Baca Puisi", "Olah Fikir"], ["debat-indonesia", "Debat Bahasa Indonesia", "Olah Fikir"],
    ["debat-inggris", "Debat Bahasa Inggris", "Olah Fikir"], ["debat-arab", "Debat Bahasa Arab", "Olah Fikir"],
    ["fathul-munjid", "Fathu-l-Munjid", "Olah Fikir"], ["pidato-indonesia", "Pidato Bahasa Indonesia", "Olah Fikir"],
    ["pidato-arab", "Pidato Bahasa Arab", "Olah Fikir"], ["pidato-inggris", "Pidato Bahasa Inggris", "Olah Fikir"],
    ["mujawwadah", "Qiro'ah Mujawwadah", "Olah Dzikir"], ["murottalah", "Qiro'ah Murottalah", "Olah Dzikir"],
    ["hifdzul-quran", "Hifdzu-l-Qur'an", "Olah Dzikir"], ["adzan", "Adzan", "Olah Dzikir"],
    ["khutbah", "Khutbah", "Olah Dzikir"]
  ];

  var KAMPUS = [
    [1, "Gontor Kampus 1, Ponorogo"], [2, "Gontor Kampus 2, Madusari, Ponorogo"],
    [3, "Gontor Kampus 3, Darul Ma'rifat, Kediri"], [4, "Gontor Kampus 4, Darul Muttaqin, Banyuwangi"],
    [5, "Gontor Kampus 5, Darul Qiyam, Magelang"], ["arsip", "Arsip gabungan seluruh kampus"]
  ];

  var LADANG_INFO = [
    ["tanggal", "Tanggal pelaksanaan", "24 sampai 25 September 2026"],
    ["hari", "Hari", "Kamis dan Jum'at"],
    ["tanggal_hijriah", "Tanggal hijriah", "11 sampai 12 Rabiul Tsani 1448 H"],
    ["countdown", "Waktu mulai untuk hitung mundur", "2026-09-24T07:00:00+07:00"],
    ["tempat", "Tempat (ringkas)", "PM Gontor Kampus 3 Darul Ma'rifat, Gurah, Kediri"],
    ["tempat_panjang", "Tempat (lengkap)", "Pondok Modern Gontor Kampus 3 Darul Ma'rifat, Kec. Gurah, Kab. Kediri, Jawa Timur 64181"],
    ["technical_meeting", "Tanggal technical meeting", "Menyusul, diumumkan panitia"],
    ["tenggat_karya", "Batas akhir pengumpulan karya", "Kamis, 17 September 2026"],
    ["surel", "Surel panitia", "gontorcup2026@gmail.com"],
    ["wa", "WhatsApp panitia", "082245805920"],
    ["moto", "Moto acara", "Nyalakan Semangat Perjuangan, Bersinar Dalam Kebersamaan"]
  ];

  /* ---------------------------------------------------------------- utils */
  function esc(t) {
    return String(t == null ? "" : t)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var toastTimer;
  function toast(pesan, jenis) {
    var el = $("#toast");
    el.textContent = pesan;
    el.dataset.jenis = jenis || "ok";
    el.dataset.tampil = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.dataset.tampil = "false"; }, jenis === "gagal" ? 6000 : 3200);
  }

  function sibuk(btn, aktif, teksSibuk) {
    if (!btn) return;
    var label = $(".btn__label", btn) || btn;
    if (aktif) {
      btn.dataset.teksAwal = label.textContent;
      label.textContent = teksSibuk || "Menyimpan…";
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
    } else {
      if (btn.dataset.teksAwal) label.textContent = btn.dataset.teksAwal;
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
    }
  }

  /* ---------------------------------------------------------------- masuk */
  function pasangMasuk() {
    if (!api.siap()) {
      $("#peringatan-api").hidden = false;
      $("#form-masuk").hidden = true;
      return;
    }

    try { token = sessionStorage.getItem(KUNCI_TOKEN); } catch (e) { token = null; }
    if (token) { bukaPanel(); return; }

    $("#form-masuk").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var btn = $("[type=submit]", ev.target);
      var gagal = $("#masuk-gagal");
      gagal.hidden = true;
      sibuk(btn, true, "Memeriksa…");

      api.kirim({ aksi: "login", sandi: $("#sandi").value })
        .then(function (j) {
          token = j.token;
          try { sessionStorage.setItem(KUNCI_TOKEN, token); } catch (e) {}
          bukaPanel();
        })
        .catch(function (err) {
          sibuk(btn, false);
          $("#masuk-gagal-pesan").textContent = err.message || "Sandi salah.";
          gagal.hidden = false;
          $("#sandi").focus();
          $("#sandi").select();
        });
    });
  }

  function keluar() {
    try { sessionStorage.removeItem(KUNCI_TOKEN); } catch (e) {}
    location.reload();
  }

  /* ---------------------------------------------------------------- panel */
  function bukaPanel() {
    $("#layar-masuk").hidden = true;
    $("#layar-admin").hidden = false;
    document.title = "Panel Admin | Gontor Cup";

    $("#btn-keluar").addEventListener("click", keluar);

    $$("[data-panel]").forEach(function (t) {
      t.addEventListener("click", function () {
        $$("[data-panel]").forEach(function (x) {
          x.classList.toggle("is-active", x === t);
          x.setAttribute("aria-selected", x === t ? "true" : "false");
        });
        $$("[data-isi]").forEach(function (p) { p.hidden = p.dataset.isi !== t.dataset.panel; });
        if (t.dataset.panel === "kiriman") muatKiriman("Pendaftaran");
      });
    });

    $$("[data-simpan]").forEach(function (b) {
      b.addEventListener("click", function () { simpanBagian(b.dataset.simpan, b); });
    });

    $("#tambah-pengumuman").addEventListener("click", function () {
      isi.pengumuman.unshift({
        kategori: "umum", label: "Umum", warna: "muted",
        tanggal: tanggalHariIni(), judul: "", isi: "", pinned: false
      });
      gambarPengumuman();
    });

    $("#tambah-hari").addEventListener("click", function () {
      isi.galeri.push({
        slug: "hari-" + (isi.galeri.length + 1),
        label: "Hari " + (isi.galeri.length + 1),
        tanggal: "", tema: "", foto: []
      });
      gambarGaleri();
    });

    $("#cari-lomba").addEventListener("input", function () {
      var q = this.value.toLowerCase().trim();
      $$("#daftar-lomba-adm .adm-item").forEach(function (el) {
        el.hidden = q ? el.dataset.cari.indexOf(q) === -1 : false;
      });
    });

    $("#btn-ganti-sandi").addEventListener("click", function () {
      var baru = $("#sandi-baru").value;
      var btn = this;
      sibuk(btn, true);
      api.kirim({ aksi: "gantiSandi", token: token, baru: baru })
        .then(function (j) { sibuk(btn, false); $("#sandi-baru").value = ""; toast(j.pesan); })
        .catch(function (e) { sibuk(btn, false); toast(e.message, "gagal"); });
    });

    $$("[data-kiriman]").forEach(function (b) {
      b.addEventListener("click", function () {
        $$("[data-kiriman]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        muatKiriman(b.dataset.kiriman);
      });
    });
    $("#muat-ulang-kiriman").addEventListener("click", function () {
      var aktif = $("[data-kiriman].is-active");
      muatKiriman(aktif ? aktif.dataset.kiriman : "Pendaftaran");
    });

    muatIsi();
  }

  function tanggalHariIni() {
    var b = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli",
             "Agustus", "September", "Oktober", "November", "Desember"];
    var d = new Date();
    return d.getDate() + " " + b[d.getMonth()] + " " + d.getFullYear();
  }

  function muatIsi() {
    api.baca()
      .then(function (k) {
        isi.info = k.info || {};
        isi.pengumuman = Array.isArray(k.pengumuman) ? k.pengumuman : [];
        isi.galeri = Array.isArray(k.galeri) ? k.galeri : [];
        isi.drive = Array.isArray(k.drive) ? k.drive : [];
        isi.lomba = k.lomba || {};
        gambarSemua();
      })
      .catch(function (e) {
        toast("Gagal memuat isi: " + e.message, "gagal");
        gambarSemua();
      });
  }

  function gambarSemua() {
    gambarInfo();
    gambarPengumuman();
    gambarGaleri();
    gambarDrive();
    gambarLomba();
  }

  function simpanBagian(bagian, btn) {
    ambilDariForm(bagian);
    sibuk(btn, true);
    api.kirim({ aksi: "simpan", token: token, bagian: bagian, data: isi[bagian] })
      .then(function (j) { sibuk(btn, false); toast(j.pesan || "Tersimpan"); })
      .catch(function (e) {
        sibuk(btn, false);
        toast(e.message, "gagal");
        if (/sesi habis|token/i.test(e.message)) setTimeout(keluar, 1800);
      });
  }

  /** Membaca kembali seluruh isian di layar ke dalam objek `isi`. */
  function ambilDariForm(bagian) {
    if (bagian === "info") {
      LADANG_INFO.forEach(function (f) {
        var el = $("#info-" + f[0]);
        if (el) isi.info[f[0]] = el.value.trim();
      });
    }
    if (bagian === "pengumuman") {
      isi.pengumuman = $$("#daftar-pengumuman-adm .adm-item").map(function (el) {
        return {
          kategori: $("[name=kategori]", el).value,
          label: $("[name=label]", el).value.trim(),
          warna: $("[name=warna]", el).value,
          tanggal: $("[name=tanggal]", el).value.trim(),
          judul: $("[name=judul]", el).value.trim(),
          isi: $("[name=isi]", el).value.trim(),
          pinned: $("[name=pinned]", el).checked
        };
      });
    }
    if (bagian === "galeri") {
      isi.galeri = $$("#daftar-hari-adm .adm-item").map(function (el) {
        var idx = Number(el.dataset.idx);
        var lama = isi.galeri[idx] || { foto: [] };
        return {
          slug: $("[name=slug]", el).value.trim() || ("hari-" + (idx + 1)),
          label: $("[name=label]", el).value.trim(),
          tanggal: $("[name=tanggal]", el).value.trim(),
          tema: $("[name=tema]", el).value.trim(),
          foto: (lama.foto || []).map(function (f, i) {
            var cap = $('[data-caption-idx="' + idx + "-" + i + '"]', el);
            return { id: f.id, url: f.url, penuh: f.penuh, caption: cap ? cap.value : f.caption };
          })
        };
      });
    }
    if (bagian === "drive") {
      isi.drive = $$("#daftar-drive-adm .adm-item").map(function (el) {
        return {
          kampus: el.dataset.kampus,
          url: $("[name=url]", el).value.trim(),
          jumlah: $("[name=jumlah]", el).value.trim(),
          pembaruan: $("[name=pembaruan]", el).value.trim()
        };
      });
    }
    if (bagian === "lomba") {
      var hasil = {};
      $$("#daftar-lomba-adm .adm-item").forEach(function (el) {
        var slug = el.dataset.slug;
        var peserta = $("[name=peserta]", el).value.trim();
        var tempat = $("[name=tempat]", el).value.trim();
        var poin = $("[name=poin]", el).value.split("\n")
          .map(function (t) { return t.trim(); }).filter(Boolean);
        // Hanya simpan lomba yang benar-benar diisi, supaya isi bawaan tetap dipakai
        if (peserta || tempat || poin.length) {
          hasil[slug] = { peserta: peserta, tempat: tempat, poin: poin };
        }
      });
      isi.lomba = hasil;
    }
  }

  /* --------------------------------------------------------- gambar: info */
  function gambarInfo() {
    $("#form-info").innerHTML =
      '<div class="adm-grid-2">' +
      LADANG_INFO.map(function (f) {
        var nilai = isi.info[f[0]] != null && isi.info[f[0]] !== "" ? isi.info[f[0]] : "";
        var panjang = f[0] === "tempat_panjang" || f[0] === "moto";
        return '<div class="field"' + (panjang ? ' style="grid-column:1/-1"' : "") + ">" +
          '<label for="info-' + f[0] + '">' + esc(f[1]) + "</label>" +
          '<input class="input" id="info-' + f[0] + '" value="' + esc(nilai) + '" ' +
          'placeholder="' + esc(f[2]) + '">' +
          (f[0] === "countdown"
            ? '<span class="hint">Format ISO: TAHUN-BULAN-TANGGALTjam:menit:detik+07:00</span>' : "") +
          "</div>";
      }).join("") + "</div>" +
      '<p class="small muted" style="margin-top:8px">Isian yang dikosongkan akan memakai ' +
      'nilai bawaan yang sudah tertulis di halaman situs.</p>';
  }

  /* --------------------------------------------------- gambar: pengumuman */
  var WARNA = [["danger", "Merah (penting)"], ["info", "Biru (teknis)"],
               ["gold", "Emas (jadwal)"], ["muted", "Abu (umum)"]];
  var KATEGORI = [["penting", "Penting"], ["teknis", "Teknis"],
                  ["jadwal", "Jadwal"], ["umum", "Umum"]];

  function gambarPengumuman() {
    var wadah = $("#daftar-pengumuman-adm");
    if (!isi.pengumuman.length) {
      wadah.innerHTML = '<div class="adm-kosong">Belum ada pengumuman. ' +
        'Klik <strong>Tambah pengumuman</strong> di bawah.</div>';
      return;
    }
    wadah.innerHTML = isi.pengumuman.map(function (p, i) {
      return '<div class="adm-item" data-idx="' + i + '">' +
        '<div class="adm-item__kepala">' +
          '<span class="badge badge--' + esc(p.warna || "muted") + '">' + esc(p.label || "Umum") + "</span>" +
          '<span class="adm-item__judul">' + esc(p.judul || "(tanpa judul)") + "</span>" +
          '<span class="adm-aksi">' +
            '<button type="button" class="btn btn--ghost btn--sm" data-naik="' + i + '" ' +
              'aria-label="Naikkan urutan">↑</button>' +
            '<button type="button" class="btn btn--ghost btn--sm" data-turun="' + i + '" ' +
              'aria-label="Turunkan urutan">↓</button>' +
            '<button type="button" class="btn btn--danger btn--sm" data-hapus-p="' + i + '">Hapus</button>' +
          "</span>" +
        "</div>" +
        '<div class="adm-item__isi">' +
          '<div class="adm-grid-2">' +
            '<div class="field"><label>Kategori</label><select class="select" name="kategori">' +
              KATEGORI.map(function (k) {
                return '<option value="' + k[0] + '"' + (p.kategori === k[0] ? " selected" : "") +
                  ">" + k[1] + "</option>";
              }).join("") + "</select></div>" +
            '<div class="field"><label>Warna lencana</label><select class="select" name="warna">' +
              WARNA.map(function (w) {
                return '<option value="' + w[0] + '"' + (p.warna === w[0] ? " selected" : "") +
                  ">" + w[1] + "</option>";
              }).join("") + "</select></div>" +
            '<div class="field"><label>Teks lencana</label>' +
              '<input class="input" name="label" value="' + esc(p.label || "") + '" placeholder="Penting"></div>' +
            '<div class="field"><label>Tanggal terbit</label>' +
              '<input class="input" name="tanggal" value="' + esc(p.tanggal || "") + '" placeholder="13 September 2026"></div>' +
          "</div>" +
          '<div class="field"><label>Judul</label>' +
            '<input class="input" name="judul" value="' + esc(p.judul || "") + '"></div>' +
          '<div class="field"><label>Isi pengumuman</label>' +
            '<textarea class="textarea" name="isi">' + esc(p.isi || "") + "</textarea></div>" +
          '<label class="row" style="gap:10px;cursor:pointer">' +
            '<input type="checkbox" name="pinned"' + (p.pinned ? " checked" : "") +
            ' style="width:20px;height:20px;accent-color:var(--green-700)">' +
            '<span class="small">Sematkan di bagian atas halaman Pengumuman</span></label>' +
        "</div></div>";
    }).join("");

    $$("[data-hapus-p]", wadah).forEach(function (b) {
      b.addEventListener("click", function () {
        ambilDariForm("pengumuman");
        isi.pengumuman.splice(Number(b.dataset.hapusP), 1);
        gambarPengumuman();
      });
    });
    $$("[data-naik]", wadah).forEach(function (b) {
      b.addEventListener("click", function () { geser(Number(b.dataset.naik), -1); });
    });
    $$("[data-turun]", wadah).forEach(function (b) {
      b.addEventListener("click", function () { geser(Number(b.dataset.turun), 1); });
    });
    // Hanya satu pengumuman yang boleh disematkan
    $$('[name=pinned]', wadah).forEach(function (c) {
      c.addEventListener("change", function () {
        if (!c.checked) return;
        $$('[name=pinned]', wadah).forEach(function (o) { if (o !== c) o.checked = false; });
      });
    });
  }

  function geser(i, arah) {
    ambilDariForm("pengumuman");
    var j = i + arah;
    if (j < 0 || j >= isi.pengumuman.length) return;
    var t = isi.pengumuman[i];
    isi.pengumuman[i] = isi.pengumuman[j];
    isi.pengumuman[j] = t;
    gambarPengumuman();
  }

  /* ------------------------------------------------------- gambar: galeri */
  function gambarGaleri() {
    var wadah = $("#daftar-hari-adm");
    if (!isi.galeri.length) {
      wadah.innerHTML = '<div class="adm-kosong">Belum ada hari/sesi. ' +
        'Klik <strong>Tambah hari / sesi</strong> di bawah.</div>';
      return;
    }
    wadah.innerHTML = isi.galeri.map(function (h, i) {
      var foto = h.foto || [];
      return '<div class="adm-item" data-idx="' + i + '">' +
        '<div class="adm-item__kepala">' +
          '<span class="adm-item__judul">' + esc(h.label || "Hari " + (i + 1)) + "</span>" +
          '<span class="badge badge--muted">' + foto.length + " foto</span>" +
          '<span class="adm-aksi">' +
            '<button type="button" class="btn btn--danger btn--sm" data-hapus-h="' + i + '">Hapus sesi</button>' +
          "</span>" +
        "</div>" +
        '<div class="adm-item__isi">' +
          '<div class="adm-grid-2">' +
            '<div class="field"><label>Nama tab</label>' +
              '<input class="input" name="label" value="' + esc(h.label || "") + '" placeholder="Hari 1"></div>' +
            '<div class="field"><label>Tanggal</label>' +
              '<input class="input" name="tanggal" value="' + esc(h.tanggal || "") + '" placeholder="Kamis, 24 September 2026"></div>' +
            '<div class="field"><label>Judul sesi</label>' +
              '<input class="input" name="tema" value="' + esc(h.tema || "") + '" placeholder="Pembukaan &amp; Penyisihan"></div>' +
            '<div class="field"><label>Kode tab (huruf kecil, tanpa spasi)</label>' +
              '<input class="input" name="slug" value="' + esc(h.slug || "") + '" placeholder="hari-1"></div>' +
          "</div>" +
          '<div class="field"><label for="unggah-' + i + '">Tambah foto</label>' +
            '<input class="input" id="unggah-' + i + '" type="file" accept="image/*" multiple data-unggah="' + i + '">' +
            '<span class="hint">Bisa pilih banyak sekaligus. Foto otomatis diperkecil ke 1600 px sebelum diunggah.</span>' +
            '<progress data-progres="' + i + '" hidden style="width:100%;margin-top:8px"></progress></div>' +
          (foto.length
            ? '<div class="adm-foto">' + foto.map(function (f, j) {
                return "<figure>" +
                  '<img src="' + esc(f.url) + '" alt="' + esc(f.caption || "") + '" loading="lazy">' +
                  "<figcaption>" +
                    '<input class="input" data-caption-idx="' + i + "-" + j + '" ' +
                      'value="' + esc(f.caption || "") + '" placeholder="Keterangan foto" ' +
                      'aria-label="Keterangan foto ' + (j + 1) + '">' +
                    '<button type="button" class="btn btn--danger btn--sm" ' +
                      'data-hapus-f="' + i + "-" + j + '">Hapus foto</button>' +
                  "</figcaption></figure>";
              }).join("") + "</div>"
            : '<p class="small muted" style="margin:0">Belum ada foto pada sesi ini.</p>') +
        "</div></div>";
    }).join("");

    $$("[data-hapus-h]", wadah).forEach(function (b) {
      b.addEventListener("click", function () {
        ambilDariForm("galeri");
        isi.galeri.splice(Number(b.dataset.hapusH), 1);
        gambarGaleri();
      });
    });

    $$("[data-hapus-f]", wadah).forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.dataset.hapusF.split("-");
        var i = Number(p[0]), j = Number(p[1]);
        var f = isi.galeri[i].foto[j];
        ambilDariForm("galeri");
        isi.galeri[i].foto.splice(j, 1);
        gambarGaleri();
        if (f && f.id) {
          api.kirim({ aksi: "hapusFoto", token: token, id: f.id })
            .then(function () { toast("Foto dihapus dari Drive"); })
            .catch(function (e) { toast("Foto hilang dari daftar, tapi gagal dihapus di Drive: " + e.message, "gagal"); });
        }
      });
    });

    $$("[data-unggah]", wadah).forEach(function (inp) {
      inp.addEventListener("change", function () { unggahBanyak(Number(inp.dataset.unggah), inp); });
    });
  }

  function unggahBanyak(idx, input) {
    var berkas = Array.prototype.slice.call(input.files || []);
    if (!berkas.length) return;
    ambilDariForm("galeri");

    var bar = $('[data-progres="' + idx + '"]');
    bar.hidden = false;
    bar.max = berkas.length;
    bar.value = 0;
    input.disabled = true;

    var gagal = 0;
    var rantai = Promise.resolve();

    berkas.forEach(function (file) {
      rantai = rantai.then(function () {
        return api.kecilkanGambar(file, 1600, 0.82)
          .then(function (kecil) { return api.keBase64(kecil); })
          .then(function (b64) {
            return api.kirim({
              aksi: "unggahFoto", token: token,
              nama: file.name, tipe: "image/jpeg", isi: b64
            });
          })
          .then(function (j) {
            isi.galeri[idx].foto.push({
              id: j.id, url: j.url, penuh: j.penuh,
              caption: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")
            });
          })
          .catch(function () { gagal++; })
          .then(function () { bar.value = bar.value + 1; });
      });
    });

    rantai.then(function () {
      input.disabled = false;
      bar.hidden = true;
      gambarGaleri();
      if (gagal) toast(gagal + " foto gagal diunggah, sisanya berhasil.", "gagal");
      else toast(berkas.length + " foto terunggah. Jangan lupa klik Simpan Galeri.");
    });
  }

  /* -------------------------------------------------------- gambar: drive */
  function gambarDrive() {
    var wadah = $("#daftar-drive-adm");
    wadah.innerHTML = KAMPUS.map(function (k) {
      var d = isi.drive.filter(function (x) { return String(x.kampus) === String(k[0]); })[0] || {};
      return '<div class="adm-item" data-kampus="' + k[0] + '">' +
        '<div class="adm-item__kepala"><span class="adm-item__judul">' + esc(k[1]) + "</span>" +
          (d.url ? '<span class="badge">Tautan terisi</span>'
                 : '<span class="badge badge--muted">Belum diisi</span>') + "</div>" +
        '<div class="adm-item__isi">' +
          '<div class="field"><label>Tautan folder Google Drive</label>' +
            '<input class="input" name="url" type="url" value="' + esc(d.url || "") + '" ' +
            'placeholder="https://drive.google.com/drive/folders/..."></div>' +
          '<div class="adm-grid-2">' +
            '<div class="field"><label>Jumlah foto</label>' +
              '<input class="input" name="jumlah" value="' + esc(d.jumlah || "") + '" placeholder="1.248"></div>' +
            '<div class="field"><label>Pembaruan terakhir</label>' +
              '<input class="input" name="pembaruan" value="' + esc(d.pembaruan || "") + '" placeholder="25 Sep 2026, 21.30 WIB"></div>' +
          "</div>" +
        "</div></div>";
    }).join("");
  }

  /* -------------------------------------------------------- gambar: lomba */
  function gambarLomba() {
    var wadah = $("#daftar-lomba-adm");
    wadah.innerHTML = LOMBA_BAWAAN.map(function (l) {
      var slug = l[0], nama = l[1], divisi = l[2];
      var d = isi.lomba[slug] || {};
      var terisi = d.peserta || d.tempat || (d.poin && d.poin.length);
      return '<div class="adm-item" data-slug="' + slug + '" data-cari="' +
          esc((nama + " " + divisi).toLowerCase()) + '">' +
        '<div class="adm-item__kepala">' +
          '<span class="adm-item__judul">' + esc(nama) + "</span>" +
          '<span class="badge badge--muted">' + esc(divisi) + "</span>" +
          (terisi ? '<span class="badge badge--gold">Sudah diubah</span>'
                  : '<span class="badge">Pakai isi bawaan</span>') +
        "</div>" +
        '<div class="adm-item__isi">' +
          '<div class="adm-grid-2">' +
            '<div class="field"><label>Kuota / format peserta</label>' +
              '<input class="input" name="peserta" value="' + esc(d.peserta || "") + '" ' +
              'placeholder="Kosongkan untuk memakai isi bawaan"></div>' +
            '<div class="field"><label>Tempat</label>' +
              '<input class="input" name="tempat" value="' + esc(d.tempat || "") + '" ' +
              'placeholder="Kosongkan untuk memakai isi bawaan"></div>' +
          "</div>" +
          '<div class="field"><label>Butir ketentuan, satu baris satu butir</label>' +
            '<textarea class="textarea" name="poin" style="min-height:170px" ' +
            'placeholder="Kosongkan untuk memakai isi bawaan">' +
            esc((d.poin || []).join("\n")) + "</textarea></div>" +
          '<div class="field"><label for="pdf-' + slug + '">Ganti berkas PDF juknis</label>' +
            '<input class="input" id="pdf-' + slug + '" type="file" accept="application/pdf" data-pdf="' + slug + '">' +
            '<span class="hint">PDF baru diunggah ke Drive; tautannya muncul di bawah setelah selesai. ' +
            'Ganti tautan unduhan di halaman Juklak secara manual, atau minta pengembang memperbaruinya.</span>' +
            '<span class="small" data-pdf-hasil="' + slug + '"></span></div>' +
        "</div></div>";
    }).join("");

    $$("[data-pdf]", wadah).forEach(function (inp) {
      inp.addEventListener("change", function () {
        var file = inp.files && inp.files[0];
        if (!file) return;
        var slug = inp.dataset.pdf;
        var hasil = $('[data-pdf-hasil="' + slug + '"]');
        hasil.textContent = "Mengunggah…";
        inp.disabled = true;
        api.keBase64(file)
          .then(function (b64) {
            return api.kirim({ aksi: "unggahPdf", token: token, nama: slug + ".pdf", isi: b64 });
          })
          .then(function (j) {
            inp.disabled = false;
            hasil.innerHTML = 'Terunggah: <a href="' + esc(j.url) + '" target="_blank" rel="noopener" ' +
              'style="color:var(--green-700);font-weight:700">buka berkas</a>';
            toast("PDF juknis " + slug + " terunggah ke Drive");
          })
          .catch(function (e) {
            inp.disabled = false;
            hasil.textContent = "Gagal: " + e.message;
            toast("Unggah PDF gagal: " + e.message, "gagal");
          });
      });
    });
  }

  /* ------------------------------------------------------ kiriman masuk */
  function muatKiriman(sheet) {
    var wadah = $("#tabel-kiriman");
    wadah.innerHTML = '<div class="adm-kosong">Memuat data ' + esc(sheet) + "…</div>";
    api.kirim({ aksi: "ambilKiriman", token: token, sheet: sheet })
      .then(function (j) {
        if (!j.baris || !j.baris.length) {
          wadah.innerHTML = '<div class="adm-kosong">Belum ada kiriman ' + esc(sheet) + ".</div>";
          return;
        }
        wadah.innerHTML = '<p class="small muted" style="margin-bottom:12px">' +
            j.baris.length + " kiriman, terbaru di atas.</p>" +
          '<div class="table-wrap"><table><thead><tr>' +
          j.judul.map(function (h) { return "<th scope=\"col\">" + esc(h) + "</th>"; }).join("") +
          "</tr></thead><tbody>" +
          j.baris.map(function (r) {
            return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>";
          }).join("") +
          "</tbody></table></div>";
      })
      .catch(function (e) {
        wadah.innerHTML = '<div class="alert alert--danger"><div>Gagal memuat: ' +
          esc(e.message) + "</div></div>";
      });
  }

  /* ------------------------------------------------------------- jalankan */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", pasangMasuk);
  } else {
    pasangMasuk();
  }
})();
