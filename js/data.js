/* Per-project colour worlds and the copy for the detail screen. Titles, stacks and links are read
   from the cards in the page, so they are written once. */
(function(){
'use strict';
var BC=window.BC;
BC.P=[
 {bg:'#0A5C45',bg2:'#12936B',acc:'#B6F36A',on:'#0A1F05',panel:'#06261D'},
 {bg:'#B8401C',bg2:'#F0643C',acc:'#FFE08A',on:'#2A0E05',panel:'#33110A'},
 {bg:'#3A1F96',bg2:'#7A4BE0',acc:'#FFD166',on:'#1B0F3F',panel:'#1B0F4A'},
 {bg:'#075A69',bg2:'#12A5B8',acc:'#FFE66D',on:'#052027',panel:'#04262D'},
 {bg:'#8C1750',bg2:'#E0408A',acc:'#FFE08A',on:'#2E0719',panel:'#2E0A1D'},
 {bg:'#7A0F1B',bg2:'#D7263D',acc:'#FFD23F',on:'#2B0508',panel:'#2B080D'}
];
BC.D={
tr:[
 {hint:'Tıkla: dalga gönder',
  long:'exactinfer, açık Qwen3 ağırlıklarını çalıştıran bir çıkarım motoru. Amaç en hızlı motor olmak değil; bilgisayarı kontrol eden yerel bir modelin 6 GB\'lık bir ekran kartında kesin, denetlenebilir ve güvenli olup olamayacağını göstermek.',
  flow:[['Prompt','metin girer'],['Tokenizer','HF ile birebir'],['İleri geçiş','CUDA çekirdekleri'],['Kısıtlı çözücü','şemaya uygun çağrı'],['Bekçi','Rust: izin, onay, ret']],
  pts:['Tokenizer 30.042 metinde Hugging Face tokenizers ile birebir aynı sonucu veriyor.','RTX 2060 üzerinde ölçüldü: 0.6B modelde üretim Ollama\'dan yaklaşık %30 hızlı, 4B modelde yaklaşık %5 geride.','Prompt işleme bilerek daha yavaş; kesinliğin bedeli bu.','62 senaryoluk asistan testinde 61 doğru araç seçimi.']},
 {hint:'Tıkla: paket gönder',
  long:'Hook Mini, uygulamaların gönderdiği olayları abone uç noktalarına ileten küçük bir webhook servisi. Svix\'in bir öğleden sonrada okunabilecek kadar küçültülmüş hali.',
  flow:[['Uygulama','POST /v1/events'],['API','idempotency anahtarı'],['Kuyruk','PostgreSQL tablosu'],['Worker','imzala, gönder, yeniden dene'],['Uç nokta','abone']],
  pts:['İmza sırrı, teslimat düşürmeden döndürülebiliyor.','Kaos, çekişme ve fuzz testleri var; OpenAPI belgesi gerçek sunucuya karşı test ediliyor.','Web konsolu aynı binary içinde: teslimatları canlı izle, her denemeyi incele, yeniden oynat.','14 aşamada tamamlandı.']},
 {hint:'Tıkla: saat seç',
  long:'Booking Mini, Calendly\'den ilham alan bir randevu planlama uygulaması. Şu an geliştirme aşamasında.',
  flow:[['Müsaitlik','kullanıcı belirler'],['Boş saatler','ziyaretçi görür'],['Randevu','saat seçilir']],
  pts:['Depo henüz herkese açık değil.']},
 {hint:'Tıkla: kesinti oluştur',
  long:'Uptime Mini\'de izlenecek adresleri girersin; arka plandaki worker bunları kendi zamanlamasıyla kontrol eder ve sonuçlar herkese açık bir durum sayfasında, sayfa yenilemeden görünür.',
  flow:[['Monitörler','API'],['Kuyruk','SKIP LOCKED'],['Worker','kontroller'],['Durum makinesi','NextState'],['Durum sayfası','LISTEN/NOTIFY']],
  pts:['Redis yok: iş kuyruğu ve süreçler arası olay iletimi yalnızca PostgreSQL ile.','Durum kararı saf bir fonksiyonda; "art arda 5 hata, 1 başarı" gibi senaryolar gerçek zaman beklemeden test ediliyor.','Bildirimler olay yazma yolunun dışında; worker kapalıyken açılan kesinti de sonradan raporlanıyor.']},
 {hint:'Tıkla: kartı taşı',
  long:'Canny Mini; kullanıcıların özellik isteği paylaşıp oy verdiği, ekibin bu istekleri kanban panosunda yönettiği çok kiracılı bir geri bildirim platformu.',
  flow:[['Widget','Vite + React, iframe'],['Web','Next.js'],['API','NestJS'],['PostgreSQL','tek oy kısıtı'],['Kuyruk','Redis + BullMQ']],
  pts:['Kiracı yalıtımına tek yerde karar veriliyor; servisler tekrar kontrol etmiyor.','Bir kullanıcının tek oy vermesi veritabanındaki benzersizlik kısıtıyla da garanti altında.','Widget yükleyicisi React içermiyor, yaklaşık 1,2 KB.','Giriş sistemi elle yazıldı: access JWT ve dönen refresh token.']},
 {hint:'Tıkla: şut at',
  long:'2026 FRC sezonunun oyunu REBUILT\'te robotlar köpük topları toplayıp hedefe atıyordu. EMONER Robotics (FRC 7840) robotunda topu yerden alan intake ve atış mekanizmasının kodunu yazdım.',
  flow:[['Intake','topu yerden alır'],['Taşıma','atıcıya iletir'],['Atış','hedefe gönderir']],
  pts:['Java ve WPILib ile yazıldı.','Takım Haliç Regional\'ı kazandı ve Innovation in Control Award aldı.','Gotham Regional\'da Alliance 7 kaptanı oldu, Houston\'daki FIRST Championship\'te Galileo bölümünde yarıştı.']}
],
en:[
 {hint:'Click: send a wave',
  long:'exactinfer is an inference engine that runs the open Qwen3 weights. The goal is not to be the fastest engine. It asks whether a local model that controls a computer can be exact, auditable and safe on a 6 GB graphics card.',
  flow:[['Prompt','text comes in'],['Tokenizer','identical to HF'],['Forward pass','CUDA kernels'],['Constrained decoder','schema-valid calls'],['Guard','Rust: allow, confirm, deny']],
  pts:['The tokenizer gives the same result as Hugging Face tokenizers on 30,042 strings.','Measured on an RTX 2060: generation is about 30% faster than Ollama on the 0.6B model and about 5% behind on the 4B model.','Prompt processing is slower on purpose; that is the price of exactness.','61 correct tool choices on a 62-scenario assistant test.']},
 {hint:'Click: send packets',
  long:'Hook Mini is a small webhook service that delivers the events applications send to subscriber endpoints. Think Svix, scaled down to something you can read in an afternoon.',
  flow:[['Application','POST /v1/events'],['API','idempotency key'],['Queue','a PostgreSQL table'],['Worker','sign, send, retry'],['Endpoint','subscriber']],
  pts:['Signing secrets rotate without dropped deliveries.','Chaos, contention and fuzz tests, and an OpenAPI document checked against the real server.','A web console in the same binary: watch deliveries live, inspect every attempt, replay.','Completed in 14 phases.']},
 {hint:'Click: pick a slot',
  long:'Booking Mini is a scheduling app inspired by Calendly. It is still in development.',
  flow:[['Availability','set by the user'],['Open slots','seen by visitors'],['Booking','a slot is picked']],
  pts:['The repository is not public yet.']},
 {hint:'Click: cause an outage',
  long:'In Uptime Mini you enter the addresses to watch, a background worker checks them on their own schedule, and the results appear on a public status page without a reload.',
  flow:[['Monitors','API'],['Queue','SKIP LOCKED'],['Worker','checks'],['State machine','NextState'],['Status page','LISTEN/NOTIFY']],
  pts:['No Redis: the job queue and cross-process events run on PostgreSQL alone.','The state decision is a pure function, so cases like "5 failures in a row, then 1 success" are tested without waiting for real time.','Notifications sit outside the incident write path; an outage that opens while the worker is down is still reported later.']},
 {hint:'Click: move the card',
  long:'Canny Mini is a multi-tenant feedback platform where users post feature requests and vote, and the team manages them on a kanban board.',
  flow:[['Widget','Vite + React, iframe'],['Web','Next.js'],['API','NestJS'],['PostgreSQL','one-vote constraint'],['Queue','Redis + BullMQ']],
  pts:['Tenant isolation is decided in one place; services do not check it again.','One vote per user is also guaranteed by a uniqueness constraint in the database.','The widget loader contains no React and is about 1.2 KB.','The sign-in system is hand-written: access JWT and rotating refresh token.']},
 {hint:'Click: shoot',
  long:'In REBUILT, the 2026 FRC game, robots collected foam balls and shot them at a target. I wrote the code for the floor intake and the shooter on the EMONER Robotics (FRC 7840) robot.',
  flow:[['Intake','picks balls off the floor'],['Feed','carries them to the shooter'],['Shooter','sends them to the target']],
  pts:['Written in Java with WPILib.','The team won the Haliç Regional and the Innovation in Control Award.','Captained Alliance 7 at the Gotham Regional and competed in the Galileo Division at the FIRST Championship in Houston.']}
]};
})();
