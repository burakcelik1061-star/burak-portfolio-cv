# Burak Çelik — Portfolyo

Kişisel portfolyo ve CV sitem. Çerçeve yok, derleme adımı yok: elle yazılmış HTML, CSS ve JavaScript, 3D için [three.js](https://threejs.org/).

*English below.*

## Neler var

- **Altı renk dünyası.** Her bölümün kendi rengi ve kendi 3D sahnesi var. Zemin, fareye tepki veren akışkan bir shader; bölüm sınırlarının her biri farklı bir kenar şekliyle çiziliyor.
- **Giriş.** İsim, yazı tipinden örneklenen gerçek küplerden kuruluyor. Her küp yerine bir yayla bağlı; fare küpleri iter, bırakınca geri toplanırlar.
- **Hakkımda.** Fare üstüne gelince basılan, süzülen klavye tuşları.
- **Projeler.** Kaydırdıkça adım adım ilerleyen bir sahne. Her projenin tıklanabilir bir 3D dioraması, kendi rengi ve bir detay ekranı var.
- **Yetenekler.** Üç halkada dönen, sürüklenebilen bir yörünge sistemi.
- **Kilometre taşları.** İçinden uçulan bir tünel; maddeler derinlikten gelip kameranın yanından geçiyor.
- **İletişim.** Fareyi takip eden bir kağıt uçak.
- Türkçe / İngilizce geçişi, küçük bir terminal (`help` yaz), "hareketi azalt" desteği, klavye ile gezinme.

## Çalıştırma

Statik bir site. Klasörü herhangi bir statik sunucuyla aç:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

`index.html` dosyasını doğrudan çift tıklayarak açmak fontların yüklenmesini engelleyebilir; bir sunucu kullan.

## Yapı

```
index.html        sayfa ve içerik (Türkçe metin burada)
css/              base (renk dünyaları), sections, effects, chrome, fonts
js/               core, i18n, scroll, projects, depthline, terminal, loader ...
gl/               stage (renderer + zemin shader'ı) ve bölüm başına bir sahne
fonts/            Bricolage Grotesque ve Spline Sans Mono (SIL OFL)
```

Her bölümün sahnesi `gl/scene-*.js` içinde ve kendini `BC.gl.add(index, {scene, cam, update})` ile kaydediyor. İngilizce metinler `js/i18n.js` ve `js/data.js` içinde.

## Yayınlama

GitHub Pages: *Settings → Pages → Deploy from a branch → main / root*. Başka bir ayar gerekmez.

## Lisanslar

Fontlar SIL Open Font License 1.1 ile lisanslı (`fonts/` içindeki metinler). three.js MIT lisanslı ve CDN üzerinden yükleniyor.

---

## English

My personal portfolio and CV site. No framework and no build step: hand-written HTML, CSS and JavaScript, with [three.js](https://threejs.org/) for the 3D.

- Six colour worlds, one per section, each with its own 3D scene over a fluid shader ground.
- A name built from spring-loaded cubes that the pointer pushes apart.
- A pinned project stepper with a clickable 3D diorama, a colour and a detail screen per project.
- An orbit system for skills, a tunnel for milestones, a paper plane for contact.
- Turkish / English switch, a small terminal (type `help`), reduced-motion support, keyboard navigation.

Run it with any static server (`python3 -m http.server 8000`). Deploy with GitHub Pages from `main` / root.

## İletişim

burakcelik1061@gmail.com · [github.com/burakcelik1061-star](https://github.com/burakcelik1061-star)
