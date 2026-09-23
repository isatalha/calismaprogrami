const aktifKullanici = localStorage.getItem("aktifKullanici") || "Ateş";
const isAdmin = aktifKullanici === "Ateş";

const karsilamaEl = document.getElementById("kullaniciKarsilama");
if (karsilamaEl) {
    karsilamaEl.innerText = `Giriş Yapan: ${aktifKullanici}`;
}

const gunler = [
    { id: "pazartesi", isim: "Pazartesi" },
    { id: "sali", isim: "Salı" },
    { id: "carsamba", isim: "Çarşamba" },
    { id: "persembe", isim: "Perşembe" },
    { id: "cuma", isim: "Cuma" },
    { id: "cumartesi", isim: "Cumartesi" },
    { id: "pazar", isim: "Pazar" }
];


function gridOlustur() {
    const haftaGrid = document.getElementById("haftaGrid");
    if (!haftaGrid) return;

    haftaGrid.innerHTML = "";

    gunler.forEach(gun => {
        const gunKutusu = document.createElement("div");
        gunKutusu.className = "gun-kutusu";
        
        gunKutusu.innerHTML = `
            <h3>${gun.isim}</h3>
            ${isAdmin ? `
                <div class="gorev-ekle-form">
                    <input type="text" id="input-${gun.id}" placeholder="Görev yaz...">
                    <button onclick="gorevEkle('${gun.id}')">Ekle</button>
                </div>
            ` : ""}
            <ul class="gorev-listesi" id="liste-${gun.id}"></ul>
        `;
        haftaGrid.appendChild(gunKutusu);
    });
}


gridOlustur();


const firebaseConfig = {
    apiKey: "AIzaSyDcEwjA0nKgN8soNjN2jytLdKX83xLzeas",
    authDomain: "nerd-sistem.firebaseapp.com",
    projectId: "nerd-sistem",
    storageBucket: "nerd-sistem.firebasestorage.app",
    messagingSenderId: "753232702809",
    appId: "1:753232702809:web:9d28c8785c88c797fb7048",
    measurementId: "G-547LGYQW08"
};


let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    
    // Veritabanını Dinle (Görevler)
    db.ref("gorevler").on("value", (snapshot) => {
        const tumGorevler = snapshot.val() || {};
        
        gunler.forEach(gun => {
            const listeEl = document.getElementById(`liste-${gun.id}`);
            if (!listeEl) return;

            listeEl.innerHTML = "";
            const gunGorevleri = tumGorevler[gun.id] || {};

            Object.keys(gunGorevleri).forEach(id => {
                const gorev = gunGorevleri[id];
                const li = document.createElement("li");

                li.innerHTML = `
                    <div class="gorev-sol">
                        <input type="checkbox" ${gorev.tamamlandi ? "checked" : ""} onchange="durumDegistir('${gun.id}', '${id}', this.checked)">
                        <span>${gorev.metin}</span>
                    </div>
                    ${isAdmin ? `<button class="sil-btn" onclick="gorevSil('${gun.id}', '${id}')">Sil</button>` : ""}
                `;
                listeEl.appendChild(li);
            });
        });
    });

    // Veritabanını Dinle (Notlar - 20 Karakter ve Pop-up Özelliğiyle)
    db.ref("notlar").on("value", (snapshot) => {
        const tumNotlar = snapshot.val() || {};
        const notlarListesi = document.getElementById("notlarListesi");
        if (!notlarListesi) return;

        notlarListesi.innerHTML = "";

        Object.keys(tumNotlar).reverse().forEach(id => {
            const notVerisi = tumNotlar[id];
            const tamMetin = notVerisi.metin;
            
            const kisaMetin = tamMetin.length > 20 ? tamMetin.substring(0, 20) + "..." : tamMetin;
            
            const escapedTam = tamMetin.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            const escapedYazar = notVerisi.yazar.replace(/"/g, '&quot;');
            const escapedTarih = notVerisi.tarih.replace(/"/g, '&quot;');

            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";

            li.innerHTML = `
                <div class="gorev-sol" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                    <span style="font-size: 14px; color: #f1f5f9; cursor: pointer; user-select: none;" 
                          onclick="notModalAc('${escapedTam}', '${escapedYazar}', '${escapedTarih}')" 
                          title="Tamamını okumak için tıkla">
                        ${kisaMetin}
                    </span>
                    <span style="font-size: 11px; color: #8899ac; font-style: italic;">
                        Ekleyen: <strong>${notVerisi.yazar}</strong> — ${notVerisi.tarih}
                    </span>
                </div>
                <button class="sil-btn" onclick="notSil('${id}')">Sil</button>
            `;
            notlarListesi.appendChild(li);
        });
    });

} catch (error) {
    console.log("Firebase henüz yapılandırılmadı, arayüz yerel çalışıyor.");
}


function gorevEkle(gunId) {
    if (!isAdmin) return;
    const input = document.getElementById(`input-${gunId}`);
    if (!input) return;
    const metin = input.value.trim();

    if (metin !== "") {
        if (db) {
            db.ref(`gorevler/${gunId}`).push({
                metin: metin,
                tamamlandi: false
            });
        }
        input.value = "";
    }
}


function durumDegistir(gunId, gorevId, yeniDurum) {
    if (db) {
        db.ref(`gorevler/${gunId}/${gorevId}`).update({
            tamamlandi: yeniDurum
        });
    }
}


function gorevSil(gunId, gorevId) {
    if (!isAdmin) return;
    if (db) {
        db.ref(`gorevler/${gunId}/${gorevId}`).remove();
    }
}

// Not Ekleme Fonksiyonu
function notEkle() {
    const input = document.getElementById("notInput");
    if (!input) return;
    const metin = input.value.trim();

    if (metin !== "") {
        if (db) {
            const simdi = new Date();
            const tarihStr = simdi.toLocaleDateString("tr-TR") + " - " + simdi.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' });

            db.ref("notlar").push({
                metin: metin,
                yazar: aktifKullanici,
                tarih: tarihStr
            });
        }
        input.value = "";
    }
}

// Not Silme Fonksiyonu
function notSil(notId) {
    if (db) {
        db.ref(`notlar/${notId}`).remove();
    }
}

// Not Pop-up Açma Fonksiyonu
function notModalAc(metin, yazar, tarih) {
    const modal = document.getElementById("notModal");
    const metinEl = document.getElementById("modalMetin");
    const bilgiEl = document.getElementById("modalBilgi");

    if (modal && metinEl && bilgiEl) {
        metinEl.innerText = metin;
        bilgiEl.innerHTML = `Ekleyen: <strong>${yazar}</strong> — ${tarih}`;
        modal.style.display = "flex";
    }
}

// Not Pop-up Kapatma Fonksiyonu
function notModalKapat() {
    const modal = document.getElementById("notModal");
    if (modal) {
        modal.style.display = "none";
    }
}

// Dışarı Tıklandığında Kapatma
function disarTiklandiKapat(event) {
    const modal = document.getElementById("notModal");
    if (event.target === modal) {
        notModalKapat();
    }
}

function cikisYap() {
    localStorage.removeItem("aktifKullanici");
    window.location.href = "index.html";
}

// Sekmeler Arası Geçiş Fonksiyonu
function sayfaDegistir(sayfaAdi, tiklananButon) {
    document.getElementById("sayfa-panel").style.display = "none";
    document.getElementById("sayfa-denemeler").style.display = "none";
    document.getElementById("sayfa-notlar").style.display = "none";

    document.getElementById(`sayfa-${sayfaAdi}`).style.display = "flex";

    const butonlar = document.querySelectorAll(".sekme-btn");
    butonlar.forEach(btn => btn.classList.remove("aktif"));
    
    if (tiklananButon) {
        tiklananButon.classList.add("aktif");
        
        const baslikEl = document.getElementById("sayfaBaslik");
        if (baslikEl) {
            baslikEl.innerText = tiklananButon.innerText;
        }
    }
}

// Deneme türü değiştiğinde TYT/YDT form alanlarını ayarla
function denemeTuruDegisti() {
    const tur = document.getElementById("denemeTuruSelect").value;
    const tytAlanlar = document.getElementById("tytAlanlar");
    const ydtAlanlar = document.getElementById("ydtAlanlar");

    if (tur === "tyt") {
        tytAlanlar.style.display = "flex";
        ydtAlanlar.style.display = "none";
    } else {
        tytAlanlar.style.display = "none";
        ydtAlanlar.style.display = "flex";
    }
}

// Deneme Kaydetme ve Net Hesaplama
function denemeEkle() {
    const isimInput = document.getElementById("denemeAdiInput");
    const tur = document.getElementById("denemeTuruSelect").value;
    const denemeAdi = isimInput.value.trim();

    if (denemeAdi === "") {
        alert("Lütfen bir deneme ismi girin.");
        return;
    }

    let denemeVerisi = {
        isim: denemeAdi,
        turu: tur.toUpperCase(),
        tarih: new Date().toLocaleDateString("tr-TR")
    };

    if (tur === "tyt") {
        const trD = parseFloat(document.getElementById("tytTurkceD").value) || 0;
        const trY = parseFloat(document.getElementById("tytTurkceY").value) || 0;
        const sosD = parseFloat(document.getElementById("tytSosyalD").value) || 0;
        const sosY = parseFloat(document.getElementById("tytSosyalY").value) || 0;
        const matD = parseFloat(document.getElementById("tytMatD").value) || 0;
        const matY = parseFloat(document.getElementById("tytMatY").value) || 0;
        const fenD = parseFloat(document.getElementById("tytFenD").value) || 0;
        const fenY = parseFloat(document.getElementById("tytFenY").value) || 0;

        // Negatif değer kontrolü
        if (trD < 0 || trY < 0 || sosD < 0 || sosY < 0 || matD < 0 || matY < 0 || fenD < 0 || fenY < 0) {
            alert("Doğru ve yanlış sayıları 0'dan küçük olamaz.");
            return;
        }

        // Soru sayısı sınır kontrolleri
        if (trD + trY > 40) {
            alert(`Türkçe için doğru ve yanlış sayısı toplamı (${trD + trY}), soru sayısı olan 40'ı geçemez!`);
            return;
        }
        if (sosD + sosY > 20) {
            alert(`Sosyal Bilimler için doğru ve yanlış sayısı toplamı (${sosD + sosY}), soru sayısı olan 20'yi geçemez!`);
            return;
        }
        if (matD + matY > 40) {
            alert(`Temel Matematik için doğru ve yanlış sayısı toplamı (${matD + matY}), soru sayısı olan 40'ı geçemez!`);
            return;
        }
        if (fenD + fenY > 20) {
            alert(`Fen Bilimleri için doğru ve yanlış sayısı toplamı (${fenD + fenY}), soru sayısı olan 20'yi geçemez!`);
            return;
        }

        // Net hesaplamaları (4 yanlış 1 doğruyu götürür formatında)
        const trNet = trD - (trY / 4);
        const sosNet = sosD - (sosY / 4);
        const matNet = matD - (matY / 4);
        const fenNet = fenD - (fenY / 4);
        const toplamNet = trNet + sosNet + matNet + fenNet;

        denemeVerisi.detaylar = { trD, trY, trNet, sosD, sosY, sosNet, matD, matY, matNet, fenD, fenY, fenNet };
        denemeVerisi.toplamNet = toplamNet.toFixed(2);

    } else {
        const dilD = parseFloat(document.getElementById("ydtDilD").value) || 0;
        const dilY = parseFloat(document.getElementById("ydtDilY").value) || 0;

        // Negatif değer kontrolü
        if (dilD < 0 || dilY < 0) {
            alert("Doğru ve yanlış sayıları 0'dan küçük olamaz.");
            return;
        }

        // Soru sayısı sınır kontrolü
        if (dilD + dilY > 80) {
            alert(`Yabancı Dil için doğru ve yanlış sayısı toplamı (${dilD + dilY}), soru sayısı olan 80'i geçemez!`);
            return;
        }

        const dilNet = dilD - (dilY / 4);

        denemeVerisi.detaylar = { dilD, dilY, dilNet };
        denemeVerisi.toplamNet = dilNet.toFixed(2);
    }

    if (db) {
        db.ref("denemeler").push(denemeVerisi);
        isimInput.value = "";
        // Inputları temizle
        document.querySelectorAll("#sayfa-denemeler input[type='number']").forEach(inp => inp.value = "");
    }
}

// Firebase'den Denemeleri Dinleme ve Listeleme (Panel.js içerisindeki Firebase dinleyicilerine eklenecek)
if (db) {
    db.ref("denemeler").on("value", (snapshot) => {
        const tumDenemeler = snapshot.val() || {};
        const listeEl = document.getElementById("denemelerListesi");
        if (!listeEl) return;

        listeEl.innerHTML = "";

        Object.keys(tumDenemeler).reverse().forEach(id => {
            const d = tumDenemeler[id];
            const li = document.createElement("li");
            li.style.flexDirection = "column";
            li.style.alignItems = "stretch";
            li.style.gap = "8px";
            li.style.wordBreak = "break-word";
            li.style.overflowWrap = "anywhere";

            let detayHtml = "";
            if (d.turu === "TYT") {
                detayHtml = `
                    <div style="font-size: 12px; color: #94a3b8; display: flex; gap: 15px; flex-wrap: wrap; word-break: break-word; overflow-wrap: anywhere;">
                        <span>Türkçe: ${d.detaylar.trD}D / ${d.detaylar.trY}Y (${d.detaylar.trNet.toFixed(2)} Net)</span>
                        <span>Sosyal: ${d.detaylar.sosD}D / ${d.detaylar.sosY}Y (${d.detaylar.sosNet.toFixed(2)} Net)</span>
                        <span>Matematik: ${d.detaylar.matD}D / ${d.detaylar.matY}Y (${d.detaylar.matNet.toFixed(2)} Net)</span>
                        <span>Fen: ${d.detaylar.fenD}D / ${d.detaylar.fenY}Y (${d.detaylar.fenNet.toFixed(2)} Net)</span>
                    </div>
                `;
            } else {
                detayHtml = `
                    <div style="font-size: 12px; color: #94a3b8; word-break: break-word; overflow-wrap: anywhere;">
                        <span>Yabancı Dil: ${d.detaylar.dilD}D / ${d.detaylar.dilY}Y</span>
                    </div>
                `;
            }

            li.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 160px; word-break: break-word; overflow-wrap: anywhere;">
                        <strong style="color: #f1f5f9; font-size: 14px; word-break: break-word; overflow-wrap: anywhere;">${d.isim} (${d.turu})</strong>
                        <span style="font-size: 11px; color: #8899ac; margin-left: 10px; display: inline-block;">${d.tarih}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px; flex-shrink: 0;">
                        <span style="color: #8899ac; font-weight: bold; font-size: 14px; white-space: nowrap;">Toplam Net: ${d.toplamNet}</span>
                        <button class="sil-btn" onclick="denemeSil('${id}')">Sil</button>
                    </div>
                </div>
                ${detayHtml}
            `;
            listeEl.appendChild(li);
        });
    });
}

function denemeSil(id) {
    if (db) {
        db.ref(`denemeler/${id}`).remove();
    }
}
