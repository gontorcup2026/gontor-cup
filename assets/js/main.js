/* =========================================================================
   GONTOR CUP: perilaku antarmuka
   Vanilla JS, tanpa dependensi. Semua modul aman dijalankan di halaman
   yang tidak memiliki elemennya (selalu memeriksa dulu).
   ========================================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------------- 1
     JENDELA WELCOME
     Tampil sekali per sesi peramban. Fokus dikunci selama terbuka,
     Esc menutupnya, dan fokus dikembalikan ke isi utama.
  ------------------------------------------------------------------ */
  function initWelcome() {
    var el = $("#welcome");
    if (!el) return;

    var KEY = "gc-welcome-seen";
    var seen;
    try { seen = sessionStorage.getItem(KEY); } catch (e) { seen = null; }

    if (seen) { el.remove(); return; }

    document.body.classList.add("is-locked");
    el.hidden = false;

    var enterBtn = $("[data-welcome-enter]", el);
    if (enterBtn) enterBtn.focus({ preventScroll: true });

    function close() {
      try { sessionStorage.setItem(KEY, "1"); } catch (e) { /* mode privat */ }
      document.body.classList.remove("is-locked");
      document.removeEventListener("keydown", onKey, true);

      var done = function () {
        el.remove();
        var main = $("#isi-utama");
        if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); }
      };

      if (reduceMotion) { done(); return; }
      el.classList.add("is-closing");
      var fired = false;
      var once = function () { if (!fired) { fired = true; done(); } };
      el.addEventListener("animationend", once, { once: true });
      setTimeout(once, 700); // jaring pengaman kalau animationend tidak terkirim
    }

    function onKey(ev) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if (ev.key !== "Tab") return;
      // kunci fokus di dalam jendela welcome
      var f = $$("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])", el)
        .filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", onKey, true);
    $$("[data-welcome-close]", el).forEach(function (b) { b.addEventListener("click", close); });
  }

  /* ---------------------------------------------------------------- 2
     HEADER LENGKET + LACI NAVIGASI SELULER
  ------------------------------------------------------------------ */
  function initHeader() {
    var header = $(".site-header");
    if (header) {
      var onScroll = function () {
        header.classList.toggle("is-stuck", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    var drawer = $("#laci");
    var opener = $("[data-drawer-open]");
    if (!drawer || !opener) return;

    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.dataset.open = "true";
      document.body.classList.add("is-locked");
      opener.setAttribute("aria-expanded", "true");
      var f = $(".drawer__close", drawer);
      if (f) f.focus();
      document.addEventListener("keydown", onKey, true);
    }
    function close() {
      drawer.dataset.open = "false";
      document.body.classList.remove("is-locked");
      opener.setAttribute("aria-expanded", "false");
      document.removeEventListener("keydown", onKey, true);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(ev) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if (ev.key !== "Tab") return;
      var panel = $(".drawer__panel", drawer);
      var f = $$("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])", panel);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    }

    opener.addEventListener("click", open);
    $$("[data-drawer-close]", drawer).forEach(function (b) { b.addEventListener("click", close); });
  }

  /* ---------------------------------------------------------------- 3
     ANIMASI MASUK SAAT DIGULIR
  ------------------------------------------------------------------ */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    items.forEach(function (n, i) {
      // penahapan halus antar kartu bersaudara (maks 5 langkah)
      var d = parseInt(n.dataset.delay || (i % 5) * 60, 10);
      n.style.transitionDelay = d + "ms";
      io.observe(n);
    });
  }

  /* ---------------------------------------------------------------- 4
     PARALAKS ORNAMEN (sangat halus, transform saja)
  ------------------------------------------------------------------ */
  function initParallax() {
    var items = $$("[data-parallax]");
    if (!items.length || reduceMotion) return;
    var ticking = false;

    function frame() {
      var y = window.scrollY;
      items.forEach(function (n) {
        var k = parseFloat(n.dataset.parallax) || 0.06;
        n.style.transform = "translate3d(0," + (y * k).toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(frame);
    }, { passive: true });
    frame();
  }

  /* ---------------------------------------------------------------- 5
     HITUNG MUNDUR
  ------------------------------------------------------------------ */
  function initCountdown() {
    var box = $("[data-countdown]");
    if (!box) return;
    var target = new Date(box.dataset.countdown).getTime();
    if (isNaN(target)) return;

    var cells = {
      hari: $("[data-cd='hari']", box),
      jam: $("[data-cd='jam']", box),
      menit: $("[data-cd='menit']", box),
      detik: $("[data-cd='detik']", box)
    };
    var pad = function (n) { return String(n).padStart(2, "0"); };

    function tick() {
      var d = target - Date.now();
      if (d <= 0) {
        box.innerHTML = '<p class="lead" style="margin:0;color:var(--gold-300);font-weight:700">' +
          "Gontor Cup sedang berlangsung. Selamat bertanding!</p>";
        clearInterval(timer);
        return;
      }
      var s = Math.floor(d / 1000);
      if (cells.hari) cells.hari.textContent = Math.floor(s / 86400);
      if (cells.jam) cells.jam.textContent = pad(Math.floor(s % 86400 / 3600));
      if (cells.menit) cells.menit.textContent = pad(Math.floor(s % 3600 / 60));
      if (cells.detik) cells.detik.textContent = pad(s % 60);
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------- 6
     TAB (dipakai galeri per hari & juknis per cabang)
  ------------------------------------------------------------------ */
  function initTabs() {
    $$("[data-tabs]").forEach(function (group) {
      var tabs = $$("[role='tab']", group);
      if (!tabs.length) return;

      function select(tab, moveFocus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        if (moveFocus) tab.focus();
      }

      tabs.forEach(function (t) {
        t.addEventListener("click", function () { select(t, false); });
        t.addEventListener("keydown", function (ev) {
          var i = tabs.indexOf(t), n = null;
          if (ev.key === "ArrowRight" || ev.key === "ArrowDown") n = tabs[(i + 1) % tabs.length];
          else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (ev.key === "Home") n = tabs[0];
          else if (ev.key === "End") n = tabs[tabs.length - 1];
          if (n) { ev.preventDefault(); select(n, true); }
        });
      });
    });
  }

  /* ---------------------------------------------------------------- 7
     LIGHTBOX GALERI
  ------------------------------------------------------------------ */
  function initLightbox() {
    var lb = $("#lightbox");
    if (!lb) return;

    var stage = $(".lightbox__stage", lb);
    var cap = $(".lightbox__cap", lb);
    var list = [], idx = 0, lastFocus = null;

    function render() {
      var s = list[idx];
      if (!s) return;
      var img = s.querySelector("img");
      var text = s.dataset.caption || (img && img.alt) || "";
      stage.innerHTML = "";
      if (img) {
        var big = document.createElement("img");
        big.src = img.dataset.full || img.currentSrc || img.src;
        big.alt = img.alt || text;
        stage.appendChild(big);
      } else {
        var ph = document.createElement("div");
        ph.className = "lightbox__ph";
        ph.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' +
          '<path d="m21 15-5-5L5 21"/></svg><span>Foto menyusul</span>';
        stage.appendChild(ph);
      }
      cap.textContent = text + " · " + (idx + 1) + " dari " + list.length;
    }

    function open(scope, item) {
      list = $$(".shot", scope);
      idx = Math.max(0, list.indexOf(item));
      lastFocus = document.activeElement;
      lb.dataset.open = "true";
      document.body.classList.add("is-locked");
      render();
      $(".lightbox__close", lb).focus();
      document.addEventListener("keydown", onKey, true);
    }
    function close() {
      lb.dataset.open = "false";
      document.body.classList.remove("is-locked");
      document.removeEventListener("keydown", onKey, true);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function step(d) { idx = (idx + d + list.length) % list.length; render(); }

    function onKey(ev) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); }
      else if (ev.key === "ArrowRight") { ev.preventDefault(); step(1); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); step(-1); }
      else if (ev.key === "Tab") {
        var f = $$("button", lb);
        var first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener("click", function (ev) {
      var s = ev.target.closest ? ev.target.closest(".shot") : null;
      if (!s) return;
      var scope = s.closest("[data-gallery]") || document;
      open(scope, s);
    });

    $(".lightbox__close", lb).addEventListener("click", close);
    $(".lightbox__nav.prev", lb).addEventListener("click", function () { step(-1); });
    $(".lightbox__nav.next", lb).addEventListener("click", function () { step(1); });
    lb.addEventListener("click", function (ev) { if (ev.target === lb) close(); });
  }

  /* ---------------------------------------------------------------- 8
     AREA UNGGAH BERKAS
  ------------------------------------------------------------------ */
  function initDropzone() {
    $$("[data-dropzone]").forEach(function (zone) {
      var input = $("input[type='file']", zone.parentNode) || $("input[type='file']", zone);
      var listEl = $("[data-filelist]", zone.parentNode);
      if (!input || !listEl) return;

      var files = [];

      function fmt(b) {
        if (b < 1024) return b + " B";
        if (b < 1048576) return (b / 1024).toFixed(0) + " KB";
        return (b / 1048576).toFixed(1) + " MB";
      }

      function render() {
        listEl.innerHTML = "";
        files.forEach(function (f, i) {
          var row = document.createElement("div");
          row.className = "file-row";
          row.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>' +
            '<span class="name"></span><span class="size">' + fmt(f.size) + "</span>";
          row.querySelector(".name").textContent = f.name;

          var del = document.createElement("button");
          del.type = "button";
          del.setAttribute("aria-label", "Hapus berkas " + f.name);
          del.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
            'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
          del.addEventListener("click", function () {
            files.splice(i, 1);
            render();
            zone.setAttribute("aria-describedby", "");
          });
          row.appendChild(del);
          listEl.appendChild(row);
        });
      }

      function add(fl) {
        Array.prototype.forEach.call(fl, function (f) {
          var dup = files.some(function (x) { return x.name === f.name && x.size === f.size; });
          if (!dup) files.push(f);
        });
        render();
      }

      zone.addEventListener("click", function () { input.click(); });
      zone.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); input.click(); }
      });
      input.addEventListener("change", function () { add(input.files); });

      ["dragenter", "dragover"].forEach(function (t) {
        zone.addEventListener(t, function (ev) { ev.preventDefault(); zone.classList.add("is-over"); });
      });
      ["dragleave", "drop"].forEach(function (t) {
        zone.addEventListener(t, function (ev) { ev.preventDefault(); zone.classList.remove("is-over"); });
      });
      zone.addEventListener("drop", function (ev) {
        if (ev.dataTransfer && ev.dataTransfer.files) add(ev.dataTransfer.files);
      });
    });
  }

  /* ---------------------------------------------------------------- 9
     VALIDASI FORMULIR + UMPAN BALIK KIRIM
     Validasi saat blur (bukan tiap ketukan). Kalau gagal, ringkasan
     kesalahan di atas formulir menerima fokus dan menautkan ke tiap isian.
  ------------------------------------------------------------------ */
  function initForms() {
    $$("form[data-validate]").forEach(function (form) {
      var summary = $("[data-error-summary]", form);
      var okBox = $("[data-success]", form);
      var gagalBox = $("[data-gagal]", form);

      function fieldOf(el) { return el.closest(".field"); }

      function messageFor(el) {
        if (el.validity.valueMissing) return "Bagian ini wajib diisi.";
        if (el.validity.typeMismatch && el.type === "email") return "Format surel belum benar, contoh: nama@sekolah.id";
        if (el.validity.typeMismatch && el.type === "url") return "Tautan harus diawali https://";
        if (el.validity.tooShort) return "Minimal " + el.minLength + " karakter.";
        if (el.validity.patternMismatch) return el.dataset.patternMsg || "Format belum sesuai.";
        return "Isian belum valid.";
      }

      function check(el) {
        var f = fieldOf(el);
        if (!f) return true;
        var errEl = $(".err span", f);
        var ok = el.checkValidity();
        f.classList.toggle("has-error", !ok);
        el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (!ok && errEl) errEl.textContent = messageFor(el);
        return ok;
      }

      $$("input, select, textarea", form).forEach(function (el) {
        el.addEventListener("blur", function () { check(el); });
        el.addEventListener("input", function () {
          var f = fieldOf(el);
          if (f && f.classList.contains("has-error")) check(el);
        });
      });

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();

        var fields = $$("input, select, textarea", form).filter(function (el) { return el.willValidate; });
        var bad = fields.filter(function (el) { return !check(el); });

        if (bad.length) {
          if (summary) {
            var ul = $("ul", summary);
            ul.innerHTML = "";
            bad.forEach(function (el) {
              var label = form.querySelector("label[for='" + el.id + "']");
              var li = document.createElement("li");
              var a = document.createElement("a");
              a.href = "#" + el.id;
              a.textContent = (label ? label.textContent.replace("*", "").trim() : el.name) + ": " + messageFor(el);
              a.addEventListener("click", function (e2) { e2.preventDefault(); el.focus(); });
              li.appendChild(a);
              ul.appendChild(li);
            });
            summary.hidden = false;
            summary.setAttribute("tabindex", "-1");
            summary.focus();
            summary.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
          } else {
            bad[0].focus();
          }
          return;
        }

        if (summary) summary.hidden = true;

        var btn = $("[type='submit']", form);
        var label = btn ? $(".btn__label", btn) : null;
        var teksAwal = label ? label.textContent : "";
        if (btn) {
          btn.classList.add("is-loading");
          btn.disabled = true;
          btn.setAttribute("aria-busy", "true");
          if (label) label.textContent = "Mengirim…";
          var sp = document.createElement("span");
          sp.className = "spinner";
          sp.setAttribute("aria-hidden", "true");
          btn.insertBefore(sp, btn.firstChild);
        }

        function selesai() {
          if (!btn) return;
          btn.classList.remove("is-loading");
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          if (label) label.textContent = teksAwal;
          var sp = $(".spinner", btn);
          if (sp) sp.remove();
        }

        function berhasil() {
          selesai();
          if (gagalBox) gagalBox.hidden = true;
          if (okBox) {
            okBox.hidden = false;
            okBox.setAttribute("tabindex", "-1");
            okBox.focus();
            okBox.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
          }
          form.reset();
          $$(".field", form).forEach(function (f) { f.classList.remove("has-error"); });
          $$("[data-filelist]", form).forEach(function (n) { n.innerHTML = ""; });
        }

        function gagal(pesan) {
          selesai();
          if (!gagalBox) { alert(pesan); return; }
          var teks = $("[data-gagal-pesan]", gagalBox);
          if (teks) teks.textContent = pesan;
          gagalBox.hidden = false;
          gagalBox.setAttribute("tabindex", "-1");
          gagalBox.focus();
          gagalBox.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
        }

        // Kumpulkan isian menjadi objek biasa
        var data = {};
        $$("input, select, textarea", form).forEach(function (el) {
          if (el.type === "file" || !el.name) return;
          data[el.name] = el.value;
        });
        data.halaman = document.body.dataset.page || location.pathname;

        var berkas = $$("[data-filelist] .file-row .name", form)
          .map(function (n) { return n.textContent; });
        if (berkas.length) data.berkas = berkas.join(", ");

        if (!window.GCApi || !window.GCApi.siap()) {
          // Sambungan Google belum disetel; jangan berpura-pura terkirim.
          setTimeout(function () {
            gagal("Sambungan ke Google Spreadsheet belum disetel. " +
                  "Sementara ini, kirimkan data lewat WhatsApp panitia 0822-4580-5920.");
          }, 500);
          return;
        }

        window.GCApi.kirim({ aksi: form.dataset.kirim || "daftar", data: data })
          .then(berhasil)
          .catch(function (err) {
            gagal("Pengiriman gagal: " + (err && err.message ? err.message : "jaringan bermasalah") +
                  ". Coba lagi, atau kirim lewat WhatsApp panitia 0822-4580-5920.");
          });
      });
    });
  }

  /* ---------------------------------------------------------------- 10
     SALIN TEKS (tautan Google Drive)
  ------------------------------------------------------------------ */
  function initCopy() {
    $$("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.dataset.copy;
        var label = $(".btn__label", btn) || btn;
        var before = label.textContent;

        var done = function (ok) {
          label.textContent = ok ? "Tersalin!" : "Gagal menyalin";
          setTimeout(function () { label.textContent = before; }, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          var ok = false;
          try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
          ta.remove();
          done(ok);
        }
      });
    });
  }

  /* ---------------------------------------------------------------- 11
     PENYARING DAFTAR (pengumuman)
  ------------------------------------------------------------------ */
  function initFilter() {
    $$("[data-filter-group]").forEach(function (group) {
      var buttons = $$("[data-filter]", group);
      var targetSel = group.dataset.filterGroup;
      var items = $$(targetSel + " [data-kategori]");
      var kosong = $(targetSel + " ~ [data-empty]") || $("[data-empty]");

      buttons.forEach(function (b) {
        b.addEventListener("click", function () {
          buttons.forEach(function (x) { x.classList.toggle("is-active", x === b); });
          var key = b.dataset.filter;
          var tampil = 0;
          items.forEach(function (it) {
            var on = key === "semua" || it.dataset.kategori === key;
            it.hidden = !on;
            if (on) tampil++;
          });
          if (kosong) kosong.hidden = tampil !== 0;
        });
      });
    });
  }

  /* ---------------------------------------------------------------- jalankan */
  // konten.js membangun ulang tab galeri dari Spreadsheet; panel yang baru
  // belum punya penangan papan tik, jadi tab-nya dipasang ulang di sini.
  document.addEventListener("gc:tab-diperbarui", function () {
    initTabs();
    initReveal();
  });

  function boot() {
    initWelcome();
    initHeader();
    initReveal();
    initParallax();
    initCountdown();
    initTabs();
    initLightbox();
    initDropzone();
    initForms();
    initCopy();
    initFilter();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
