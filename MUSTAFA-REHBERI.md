# Mustafa — Sprite Studio ve LAMBO geliştirme rehberi

Bu dosya sana (Mustafa) yazıldı. Yapay zekâ ajanı ile bu oyunu geliştirirken adım adım ne yapacağını anlatıyor. Okuduktan sonra aynı adımları kendi ajanına yaptırabilirsin.

## 1. Sprite editörü neden “çalışmıyor” gibi duruyordu?

Sana atılan şey bir Photoshop penceresi değil. Repodaki `.sprite-studio/` klasörü, [Sprite Studio](https://github.com/JohnKinyanjui/sprite-maker) adlı aracın **motoru**. Yani:

- Python ile PNG çizen bir araç (`sprite_tool.py`)
- Bir master PNG’den bacak/kol döndürüp animasyon karesi üreten araç (`sprite_rig.py`)
- Kareleri yan yana dizip oyunun okuduğu şerit haline getiren araç (`pack_sheet.py`)

Ayrı bir masaüstü uygulama da var (Windows kurulum dosyası: [Sprite.Studio_0.3.2_x64-setup.exe](https://github.com/JohnKinyanjui/sprite-maker/releases/download/v0.3.2/Sprite.Studio_0.3.2_x64-setup.exe)). Onu kurmak zorunda değilsin. Ajan sohbetinden JSON yazıp Python çalıştırmak bu proje için yeterli ve daha hızlı.

Eski `image_processing_scripts/` klasörü senin Antigravity bilgisayarındaki tam yollara bakıyor (`C:\Users\mstfj\...`) ve dosyaları olmayan `public/` klasörüne yazıyor. O yüzden oradaki scriptler senin makinede kırılıyor. Yeni yol bunları kullanmamak.

## 2. Tek seferlik kontrol

Proje klasörünün kökünde (LAMBO1) terminal aç:

```bash
python --version
npm install
python .sprite-studio/sprite_tool.py .sprite-studio/specs/orange_spark.json
```

Beklenen sonuç: `assets/effects/orange_spark_01.png` … `_04.png` oluşur. Bu komut burada çalıştı; motor sağlam.

Tüm demo setini yeniden üretmek için:

```bash
python .sprite-studio/generate_lambo.py
```

Bu komut araba, tekerlek, robot idle, 8 kare koşu ve koşu şeridini üretir.

## 3. Yapay zekâya nasıl sprite sipariş edeceksin

Ajana **resim çiz** deme. Şunu de:

> `.cursor/skills/lambo-sprites/SKILL.md` dosyasındaki pipeline ile Limbo tarzı şeffaf PNG robot koşu animasyonu üret. 48x64, 8 kare, siyah siluet + neon turuncu (#ff5500). Spec’i `.sprite-studio/specs/` altına yaz, `sprite_tool.py` ile render et, `pack_sheet.py` ile yatay şerit yap. `assets/car.png` dosyalarının üzerine yazma.

İyi siparişin parçaları:

1. **Ne** (robot idle, araba, tekerlek, koşu, zıplama)
2. **Boyut** (örnek: 48x64)
3. **Kare sayısı** (koşu için 8 — oyun şu an 8 bekliyor)
4. **Stil** (şeffaf zemin, siyah gövde, turuncu çizgi)
5. **Nereye yazılacağı** (`assets/characters/`, concept pack’e dokunma)

Kötü sipariş: “güzel bir sprite yap”. Ajan o zaman rastgele bir JPG üretir, zemini siyah kalır, oyun karakterin etrafında kara kutu gösterir.

## 4. JSON neye benziyor

En küçük çalışan örnek: `.sprite-studio/specs/orange_spark.json`

Daha büyük örnekler `generate_lambo.py` çalışınca şuraya yazılır:

- `.sprite-studio/specs/lambo_car.json`
- `.sprite-studio/specs/lambo_robot.json`
- `.sprite-studio/specs/lambo_robot_run.json`
- `.sprite-studio/specs/lambo_wheel.json`

Komut türleri: `pixel`, `rect`, `line`, `ellipse`, `polygon`. Renkler paletten gelir (`body`, `neon`, …). Zemin her zaman `"background": "transparent"` olsun.

## 5. Animasyonu kemikten üretmek (rig)

Aynı robotun bacaklarını kopyalayıp yeniden çizmek yerine bir kere idle çiz, sonra kemik döndür:

```bash
python .sprite-studio/sprite_rig.py --check .sprite-studio/rigs/lambo_robot_stride.json
python .sprite-studio/sprite_rig.py .sprite-studio/rigs/lambo_robot_stride.json
```

`--check` sadece doğrular. İkinci komut 8 PNG yazar: `assets/characters/lambo_robot_stride_01.png` …

Windows’ta eski motor `fsync` yüzünden `Bad file descriptor` deyip düşüyordu. Bu, `sprite_rig.py` içinde düzeltildi. Tekrar görürsen `.sprite-studio/rig-render.lock` dosyasını silip komutu yeniden çalıştır.

Yatay şerit:

```bash
python .sprite-studio/pack_sheet.py assets/characters/lambo_robot_stride_sheet.png assets/characters/lambo_robot_stride_01.png assets/characters/lambo_robot_stride_02.png assets/characters/lambo_robot_stride_03.png assets/characters/lambo_robot_stride_04.png assets/characters/lambo_robot_stride_05.png assets/characters/lambo_robot_stride_06.png assets/characters/lambo_robot_stride_07.png assets/characters/lambo_robot_stride_08.png
```

## 6. Ürettiğin sprite oyuna nasıl girer

`main.js` iki paket tanıyor:

| Adres | Ne gösterir |
| --- | --- |
| `http://localhost:5173/` | Senin concept art’ın (`assets/car.png` …) |
| `http://localhost:5173/?art=pixel` | Sprite Studio pixel paketi |

Yeni bir koşu şeridi yaptıysan ya `PIXEL_ART.walk` yolunu yeni dosyaya çevir ya da dosyayı `assets/characters/lambo_robot_run_sheet.png` üzerine kaydet. Kare sayısı 8 değilse `PIXEL_ART.frames` sayısını da değiştir.

Oyunu aç:

```bash
npm run dev
```

Tarayıcıda çıkan localhost adresine git. HUD’daki **pixel (Sprite Studio)** linkine basarak iki paketi karşılaştır.

## 7. Oyunda şu an ne var, sen ne ekleyeceksin

Çalışanlar:

- Hovercar / robot dönüşü (`T`)
- Arabada 2x hız, zıplama yok
- Robotta zıplama ve 8 kare koşu
- Boşluğa düşünce spawn’a dönüş
- HUD: form, ipucu, transform bekleme çubuğu
- A/D + ok tuşları + W/Space zıplama
- Seviyede **boşluk**: araba düşer, robot zıplar. Mekaniği öğretmek için eklendi

Eksik / senin sıradaki işlerin (ajana tek tek ver):

1. Zıplama için ayrı 2–3 kare (şimdi koşu şeridinden bir kare kullanılıyor)
2. Dönüşüm için ara poz (araba katlanırken robotun ilk karesi)
3. Düşman veya hareketli platform
4. Concept art yürüyüş şeridini temizle; `robot_walk.png` hâlâ çok soluk
5. Pixel arabayı Countach siluetine yaklaştır (şu an kaba bir placeholder)

Her işi şöyle ver: “sadece X dosyasını değiştir, concept PNG’lere dokunma, bitince `npm run dev` ile neyi denemem gerektiğini yaz”.

## 8. Yapay zekâya proje açtırırken söyleyeceğin cümle

İlk mesajın bu olsun:

> LAMBO1 bir Three.js Limbo platformer. Sprite’lar `.sprite-studio` Python motoruyla üretilir, oyun `assets/` okur. `MUSTAFA-REHBERI.md` ve `.cursor/skills/lambo-sprites/SKILL.md` dosyalarını oku. Şimdi şunu yap: …

Sonra tek bir görev yaz. “oyunu bitir” yazma. Ajan dağılır, sen de ne değiştiğini kaybedersin.
