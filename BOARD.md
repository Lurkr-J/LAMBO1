# Geliştirme Panosu

| ID | Görev | Kabul Kriterleri | Öncelik | Durum |
| --- | --- | --- | --- | --- |
| T1 | Sprite Studio motorunu Windows’ta çalıştır | `python .sprite-studio/sprite_tool.py .sprite-studio/specs/orange_spark.json` exit 0 ve `assets/effects/orange_spark_01.png` oluşur | 1 | done |
| T2 | LAMBO demo sprite seti üret | `python .sprite-studio/generate_lambo.py` araba, tekerlek, robot, 8 kare koşu şeridi yazar | 1 | done |
| T3 | Rig render Windows fsync hatasını düzelt | `python .sprite-studio/sprite_rig.py .sprite-studio/rigs/lambo_robot_stride.json` exit 0 | 1 | done |
| T4 | Oyunu iki art paketi ve öğretici seviye ile bağla | `npm run dev` açılır; `/?art=pixel` pixel paketi yükler; HUD form gösterir | 1 | done |
| T5 | Mustafa’ya öğretici hat ve sprite skill | `MUSTAFA-REHBERI.md` ve `.cursor/skills/lambo-sprites/SKILL.md` var | 1 | done |
| T6 | Robot zıplama sprite’ı | Ayrı jump sheet veya 2+ kare; havadayken koşu karesi kullanılmaz | 2 | todo |
| T7 | Concept `robot_walk.png` kontrastı | Neon çizgiler oyunda siluet olarak okunur | 2 | todo |
| T8 | Hareketli platform veya boşluk tuzakları | En az bir platform X’te salınır ve çarpışma çalışır | 3 | todo |
