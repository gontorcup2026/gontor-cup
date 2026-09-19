/* DIHASILKAN tools/pages_e.py - jangan disunting dengan tangan. */
window.GC_BAGAN = {
  "kampus": [
    {
      "kode": "G1",
      "nama": "Gontor 1",
      "alamat": "Ponorogo"
    },
    {
      "kode": "G2",
      "nama": "Gontor 2",
      "alamat": "Madusari, Ponorogo"
    },
    {
      "kode": "G3",
      "nama": "Gontor 3",
      "alamat": "Darul Ma'rifat, Kediri"
    },
    {
      "kode": "G4",
      "nama": "Gontor 4",
      "alamat": "Darul Muttaqin, Banyuwangi"
    },
    {
      "kode": "G5",
      "nama": "Gontor 5",
      "alamat": "Darul Qiyam, Magelang"
    }
  ],
  "cabang": [
    {
      "slug": "sepakbola",
      "nama": "Sepakbola",
      "venue": "Lapangan Hijau Gontor 3",
      "bye": "G1",
      "slot": [
        "G3",
        "G4",
        "G1",
        "G2",
        "G5"
      ],
      "catatan": "Satu-satunya cabang yang memulai pertandingan pada hari Kamis.",
      "laga": [
        {
          "kode": "m1",
          "label": "Pertandingan I",
          "ronde": "penyisihan",
          "kiri": [
            "tim",
            "G3"
          ],
          "kanan": [
            "tim",
            "G4"
          ],
          "jam": "16:00 - 17:15",
          "hari": "Kamis"
        },
        {
          "kode": "m2",
          "label": "Pertandingan II",
          "ronde": "semifinal",
          "kiri": [
            "tim",
            "G2"
          ],
          "kanan": [
            "tim",
            "G5"
          ],
          "jam": "07:00 - 08:00",
          "hari": "Jum'at"
        },
        {
          "kode": "m3",
          "label": "Pertandingan III",
          "ronde": "semifinal",
          "kiri": [
            "menang",
            "m1"
          ],
          "kanan": [
            "tim",
            "G1"
          ],
          "jam": "08:15 - 09:15",
          "hari": "Jum'at"
        },
        {
          "kode": "m4",
          "label": "Final",
          "ronde": "final",
          "kiri": [
            "menang",
            "m3"
          ],
          "kanan": [
            "menang",
            "m2"
          ],
          "jam": "15:45 - 17:15",
          "hari": "Jum'at"
        }
      ]
    },
    {
      "slug": "futsal",
      "nama": "Futsal",
      "venue": "Lapangan Futsal Indoor",
      "bye": "G2",
      "slot": [
        "G5",
        "G1",
        "G2",
        "G3",
        "G4"
      ],
      "catatan": "",
      "laga": [
        {
          "kode": "m1",
          "label": "Pertandingan I",
          "ronde": "penyisihan",
          "kiri": [
            "tim",
            "G5"
          ],
          "kanan": [
            "tim",
            "G1"
          ],
          "jam": "07:00 - 07:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m2",
          "label": "Pertandingan II",
          "ronde": "semifinal",
          "kiri": [
            "tim",
            "G3"
          ],
          "kanan": [
            "tim",
            "G4"
          ],
          "jam": "08:00 - 08:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m3",
          "label": "Pertandingan III",
          "ronde": "semifinal",
          "kiri": [
            "menang",
            "m1"
          ],
          "kanan": [
            "tim",
            "G2"
          ],
          "jam": "09:00 - 09:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m4",
          "label": "Final",
          "ronde": "final",
          "kiri": [
            "menang",
            "m3"
          ],
          "kanan": [
            "menang",
            "m2"
          ],
          "jam": "15:45 - 17:15",
          "hari": "Jum'at"
        }
      ]
    },
    {
      "slug": "sepak-takraw",
      "nama": "Sepak Takraw",
      "venue": "Lapangan Depan Gedung Sudan",
      "bye": "G2",
      "slot": [
        "G3",
        "G5",
        "G2",
        "G1",
        "G4"
      ],
      "catatan": "",
      "laga": [
        {
          "kode": "m1",
          "label": "Pertandingan I",
          "ronde": "penyisihan",
          "kiri": [
            "tim",
            "G3"
          ],
          "kanan": [
            "tim",
            "G5"
          ],
          "jam": "07:00 - 07:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m2",
          "label": "Pertandingan II",
          "ronde": "semifinal",
          "kiri": [
            "tim",
            "G1"
          ],
          "kanan": [
            "tim",
            "G4"
          ],
          "jam": "08:00 - 08:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m3",
          "label": "Pertandingan III",
          "ronde": "semifinal",
          "kiri": [
            "menang",
            "m1"
          ],
          "kanan": [
            "tim",
            "G2"
          ],
          "jam": "09:00 - 09:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m4",
          "label": "Final",
          "ronde": "final",
          "kiri": [
            "menang",
            "m3"
          ],
          "kanan": [
            "menang",
            "m2"
          ],
          "jam": "15:45 - 17:15",
          "hari": "Jum'at"
        }
      ]
    },
    {
      "slug": "voli",
      "nama": "Voli",
      "venue": "Lapangan Depan Gedung Syiria",
      "bye": "G4",
      "slot": [
        "G1",
        "G2",
        "G4",
        "G3",
        "G5"
      ],
      "catatan": "",
      "laga": [
        {
          "kode": "m1",
          "label": "Pertandingan I",
          "ronde": "penyisihan",
          "kiri": [
            "tim",
            "G1"
          ],
          "kanan": [
            "tim",
            "G2"
          ],
          "jam": "07:00 - 07:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m2",
          "label": "Pertandingan II",
          "ronde": "semifinal",
          "kiri": [
            "tim",
            "G3"
          ],
          "kanan": [
            "tim",
            "G5"
          ],
          "jam": "08:00 - 08:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m3",
          "label": "Pertandingan III",
          "ronde": "semifinal",
          "kiri": [
            "menang",
            "m1"
          ],
          "kanan": [
            "tim",
            "G4"
          ],
          "jam": "09:00 - 09:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m4",
          "label": "Final",
          "ronde": "final",
          "kiri": [
            "menang",
            "m3"
          ],
          "kanan": [
            "menang",
            "m2"
          ],
          "jam": "15:45 - 17:15",
          "hari": "Jum'at"
        }
      ]
    },
    {
      "slug": "bola-basket",
      "nama": "Bola Basket",
      "venue": "Lapangan Depan Gedung Sudan",
      "bye": "G2",
      "slot": [
        "G5",
        "G4",
        "G2",
        "G3",
        "G1"
      ],
      "catatan": "",
      "laga": [
        {
          "kode": "m1",
          "label": "Pertandingan I",
          "ronde": "penyisihan",
          "kiri": [
            "tim",
            "G5"
          ],
          "kanan": [
            "tim",
            "G4"
          ],
          "jam": "07:00 - 07:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m2",
          "label": "Pertandingan II",
          "ronde": "semifinal",
          "kiri": [
            "tim",
            "G3"
          ],
          "kanan": [
            "tim",
            "G1"
          ],
          "jam": "08:00 - 08:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m3",
          "label": "Pertandingan III",
          "ronde": "semifinal",
          "kiri": [
            "menang",
            "m1"
          ],
          "kanan": [
            "tim",
            "G2"
          ],
          "jam": "09:00 - 09:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m4",
          "label": "Final",
          "ronde": "final",
          "kiri": [
            "menang",
            "m3"
          ],
          "kanan": [
            "menang",
            "m2"
          ],
          "jam": "15:45 - 17:15",
          "hari": "Jum'at"
        }
      ]
    },
    {
      "slug": "tenis-meja",
      "nama": "Tenis Meja",
      "venue": "Gedung Sport Hall",
      "bye": "G2",
      "slot": [
        "G1",
        "G3",
        "G2",
        "G4",
        "G5"
      ],
      "catatan": "Bagan yang sama dipakai nomor Single dan nomor Double.",
      "laga": [
        {
          "kode": "m1",
          "label": "Pertandingan I",
          "ronde": "penyisihan",
          "kiri": [
            "tim",
            "G1"
          ],
          "kanan": [
            "tim",
            "G3"
          ],
          "jam": "07:00 - 07:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m2",
          "label": "Pertandingan II",
          "ronde": "semifinal",
          "kiri": [
            "tim",
            "G4"
          ],
          "kanan": [
            "tim",
            "G5"
          ],
          "jam": "08:00 - 08:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m3",
          "label": "Pertandingan III",
          "ronde": "semifinal",
          "kiri": [
            "menang",
            "m1"
          ],
          "kanan": [
            "tim",
            "G2"
          ],
          "jam": "09:00 - 09:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m4",
          "label": "Final",
          "ronde": "final",
          "kiri": [
            "menang",
            "m3"
          ],
          "kanan": [
            "menang",
            "m2"
          ],
          "jam": "15:45 - 17:15",
          "hari": "Jum'at"
        }
      ]
    },
    {
      "slug": "bulutangkis",
      "nama": "Bulutangkis",
      "venue": "Gedung Sport Hall",
      "bye": "G3",
      "slot": [
        "G5",
        "G2",
        "G3",
        "G1",
        "G4"
      ],
      "catatan": "Bagan yang sama dipakai nomor Single dan nomor Double.",
      "laga": [
        {
          "kode": "m1",
          "label": "Pertandingan I",
          "ronde": "penyisihan",
          "kiri": [
            "tim",
            "G5"
          ],
          "kanan": [
            "tim",
            "G2"
          ],
          "jam": "07:00 - 07:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m2",
          "label": "Pertandingan II",
          "ronde": "semifinal",
          "kiri": [
            "tim",
            "G1"
          ],
          "kanan": [
            "tim",
            "G4"
          ],
          "jam": "08:00 - 08:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m3",
          "label": "Pertandingan III",
          "ronde": "semifinal",
          "kiri": [
            "menang",
            "m1"
          ],
          "kanan": [
            "tim",
            "G3"
          ],
          "jam": "09:00 - 09:40",
          "hari": "Jum'at"
        },
        {
          "kode": "m4",
          "label": "Final",
          "ronde": "final",
          "kiri": [
            "menang",
            "m3"
          ],
          "kanan": [
            "menang",
            "m2"
          ],
          "jam": "15:45 - 17:15",
          "hari": "Jum'at"
        }
      ]
    },
    {
      "slug": "panahan",
      "nama": "Panahan",
      "venue": "Lapangan BAAK",
      "bye": "G1",
      "slot": [
        "G5",
        "G2",
        "G1",
        "G3",
        "G4"
      ],
      "catatan": "Empat babak berturut-turut sepuluh menit, seluruhnya pagi hari.",
      "laga": [
        {
          "kode": "m1",
          "label": "Pertandingan I",
          "ronde": "penyisihan",
          "kiri": [
            "tim",
            "G5"
          ],
          "kanan": [
            "tim",
            "G2"
          ],
          "jam": "07:00 - 07:10",
          "hari": "Jum'at"
        },
        {
          "kode": "m2",
          "label": "Pertandingan II",
          "ronde": "semifinal",
          "kiri": [
            "tim",
            "G3"
          ],
          "kanan": [
            "tim",
            "G4"
          ],
          "jam": "07:10 - 07:20",
          "hari": "Jum'at"
        },
        {
          "kode": "m3",
          "label": "Pertandingan III",
          "ronde": "semifinal",
          "kiri": [
            "menang",
            "m1"
          ],
          "kanan": [
            "tim",
            "G1"
          ],
          "jam": "07:20 - 07:30",
          "hari": "Jum'at"
        },
        {
          "kode": "m4",
          "label": "Final",
          "ronde": "final",
          "kiri": [
            "menang",
            "m3"
          ],
          "kanan": [
            "menang",
            "m2"
          ],
          "jam": "07:30 - 07:40",
          "hari": "Jum'at"
        }
      ]
    }
  ]
};
