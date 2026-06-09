// ===================================================================
// KONFIGURASI UTAMA JADWAL SHALAT (KABUPATEN BEKASI - ITSB DELTAMAS)
// ===================================================================
const ID_KOTA = "1222"; 
let JADWAL_SHALAT = {}; 

let sudahBunyiAzan = false;
let sudahBunyiIqomah = false;

// DETEKSI OTOMATIS HALAMAN YANG SEDANG DIBUKA
document.addEventListener("DOMContentLoaded", function () {
    // Cek apakah ada form admin di halaman ini
    const formAdmin = document.querySelector('form');

    if (formAdmin) {
        // JIKA YANG DIBUKA ADALAH HALAMAN ADMIN.HTML
        console.log("Inisialisasi Panel Admin...");
        inisialisasiPanelAdmin(formAdmin);
    } else {
        // JIKA YANG DIBUKA ADALAH HALAMAN INDEX.HTML (TV UTAMA)
        console.log("Inisialisasi Jam Azan TV Utama...");
        inisialisasiAplikasiTVUtama();
    }
});

// ===================================================================
// LOGIKA KHUSUS PANEL ADMIN (UNTUK ADMIN.HTML)
// ===================================================================
function inisialisasiPanelAdmin(form) {
    const inputNamaMasjid = document.getElementById('namaMasjid');
    const inputRunningText = document.getElementById('runningText');
    const inputJedaIqomah = document.getElementById('jedaIqomah');
    const inputNamaEvent = document.getElementById('namaEvent');
    const inputTanggalEvent = document.getElementById('tanggalEvent');
    
    // Tambahkan 2 variabel baru ini
    const inputInfoKajian = document.getElementById('infoKajian');
    const inputInfoKhotib = document.getElementById('infoKhotib');

    // Muat data lama dari LocalStorage ke form admin
    if (inputNamaMasjid) inputNamaMasjid.value = localStorage.getItem('namaMasjid') || '';
    if (inputRunningText) inputRunningText.value = localStorage.getItem('runningText') || '';
    if (inputJedaIqomah) inputJedaIqomah.value = localStorage.getItem('jedaIqomah') || '10';
    if (inputNamaEvent) inputNamaEvent.value = localStorage.getItem('namaEvent') || '';
    if (inputTanggalEvent) inputTanggalEvent.value = localStorage.getItem('tanggalEvent') || '';
    // Ambil data kajian & khotib lama
    if (inputInfoKajian) inputInfoKajian.value = localStorage.getItem('infoKajian') || '';
    if (inputInfoKhotib) inputInfoKhotib.value = localStorage.getItem('infoKhotib') || '';

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        if (inputNamaMasjid) localStorage.setItem('namaMasjid', inputNamaMasjid.value);
        if (inputRunningText) localStorage.setItem('runningText', inputRunningText.value);
        if (inputJedaIqomah) localStorage.setItem('jedaIqomah', inputJedaIqomah.value);
        if (inputNamaEvent) localStorage.setItem('namaEvent', inputNamaEvent.value);
        if (inputTanggalEvent) localStorage.setItem('tanggalEvent', inputTanggalEvent.value);
        // Simpan data kajian & khotib baru
        if (inputInfoKajian) localStorage.setItem('infoKajian', inputInfoKajian.value);
        if (inputInfoKhotib) localStorage.setItem('infoKhotib', inputInfoKhotib.value);

        alert('Perubahan data admin berhasil disimpan!');
    });
}

// ===================================================================
// LOGIKA KHUSUS TV UTAMA (UNTUK INDEX.HTML)
// ===================================================================
async function inisialisasiAplikasiTVUtama() {
    const berhasilAmbilData = await muatJadwalShalatDariAPI();
    if (berhasilAmbilData) {
        setInterval(mesinWaktuUtama, 1000);
        mesinWaktuUtama();
    } else {
        document.body.innerHTML = "<h2 style='color:white; text-align:center; margin-top:20%;'>Gagal memuat Jadwal Shalat. Periksa koneksi internet Anda.</h2>";
    }
}

async function muatJadwalShalatDariAPI() {
    const hariIni = new Date();
    const tahun = hariIni.getFullYear();
    const bulan = String(hariIni.getMonth() + 1).padStart(2, '0');
    const tanggal = String(hariIni.getDate()).padStart(2, '0');

    const urlAPI = `https://api.myquran.com/v2/sholat/jadwal/${ID_KOTA}/${tahun}/${bulan}/${tanggal}`;

    try {
        const respon = await fetch(urlAPI);
        const hasilData = await respon.json();

        if (hasilData.status && hasilData.data && hasilData.data.jadwal) {
            const jadwal = hasilData.data.jadwal;
            JADWAL_SHALAT = {
                imsak: jadwal.imsak,
                shubuh: jadwal.subuh,
                syuruq: jadwal.terbit,
                dhuhur: jadwal.dzuhur,
                ashar: jadwal.ashar,
                maghrib: jadwal.maghrib,
                isya: jadwal.isya
            };

            for (const [waktu, jam] of Object.entries(JADWAL_SHALAT)) {
                const elemenCard = document.getElementById(waktu);
                if (elemenCard) {
                    const elemenTime = elemenCard.querySelector('.time');
                    if (elemenTime) elemenTime.innerText = jam;
                }
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error("Gagal mengambil data dari API:", error);
        return false;
    }
}

function mesinWaktuUtama() {
    const sekarang = new Date();
    
    // Sinkronisasi Nama Masjid
    const namaMasjidSaves = localStorage.getItem('namaMasjid');
    const elemenNamaMasjid = document.querySelector('.center-title h2');
    if (namaMasjidSaves && elemenNamaMasjid) elemenNamaMasjid.innerText = namaMasjidSaves;
    
    // Sinkronisasi Running Text
    const runningTextSaves = localStorage.getItem('runningText');
    const elemenRunning = document.getElementById('running-text');
    if (runningTextSaves && elemenRunning && elemenRunning.innerText !== runningTextSaves) {
        elemenRunning.innerText = runningTextSaves;
    }

    const jedaSaves = localStorage.getItem('jedaIqomah');
    const JEDA_IQOMAH_MENIT = jedaSaves ? parseInt(jedaSaves) : 10;

    // Sinkronisasi Jam Header TV Utama
    const jam = String(sekarang.getHours()).padStart(2, '0');
    const menit = String(sekarang.getMinutes()).padStart(2, '0');
    const elemenClock = document.getElementById('big-clock');
    if (elemenClock) elemenClock.innerText = `${jam}:${menit}`;
    
    const opsiTanggal = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const elemenMasehi = document.querySelector('.masehi-date');
    if (elemenMasehi) elemenMasehi.innerText = sekarang.toLocaleDateString('id-ID', opsiTanggal);

    // ========================================================
    // SINKRONISASI & HITUNG OTOMATIS EVENT DARI PANEL ADMIN
    // ========================================================
    const namaEventSaves = localStorage.getItem('namaEvent');
    const tanggalEventSaves = localStorage.getItem('tanggalEvent');
    const elemenBoxEvent = document.getElementById('box-event');
    const elemenTeksEvent = document.getElementById('teks-konten-event');

    if (namaEventSaves && tanggalEventSaves && elemenTeksEvent && elemenBoxEvent) {
        const targetTanggal = new Date(tanggalEventSaves);
        targetTanggal.setHours(0,0,0,0);
        const tanggalHariIni = new Date(sekarang);
        tanggalHariIni.setHours(0,0,0,0);

        const selisihMiliDetik = targetTanggal - tanggalHariIni;
        const selisihHari = Math.ceil(selisihMiliDetik / (1000 * 60 * 60 * 24));

        if (selisihHari > 0) {
            elemenBoxEvent.style.display = 'block';
            elemenTeksEvent.innerText = `${namaEventSaves} -${selisihHari} Hari`;
        } else if (selisihHari === 0) {
            elemenBoxEvent.style.display = 'block';
            elemenTeksEvent.innerText = `Hari Ini: ${namaEventSaves}`;
        } else {
            elemenBoxEvent.style.display = 'none';
        }
    } else if (elemenBoxEvent) {
        elemenBoxEvent.style.display = 'none';
    }

    // ========================================================
    // SINKRONISASI JADWAL KAJIAN & KHOTIB DARI PANEL ADMIN
    // ========================================================
    const infoKajianSaves = localStorage.getItem('infoKajian');
    const infoKhotibSaves = localStorage.getItem('infoKhotib');
    
    const elemenTeksKajian = document.getElementById('teks-info-kajian');
    const elemenTeksKhotib = document.getElementById('teks-info-khotib');

    if (elemenTeksKajian) {
        elemenTeksKajian.innerText = infoKajianSaves || "Belum ada jadwal kajian terbaru.";
    }
    if (elemenTeksKhotib) {
        elemenTeksKhotib.innerText = infoKhotibSaves || "Belum ada informasi khotib.";
    }
    // ========================================================

    prosesLogikaWaktuShalat(sekarang, JEDA_IQOMAH_MENIT);
}

function prosesLogikaWaktuShalat(waktuSekarang, jedaIqomahMenit) {
    if (Object.keys(JADWAL_SHALAT).length === 0) return;

    let targetWaktuShalat = null;
    let namaTargetShalat = "";
    const listWaktuObjek = [];
    
    for (const [namaShalat, stringJam] of Object.entries(JADWAL_SHALAT)) {
        const [targetJam, targetMenit] = stringJam.split(':');
        const objekWaktu = new Date(waktuSekarang);
        objekWaktu.setHours(parseInt(targetJam), parseInt(targetMenit), 0, 0);
        listWaktuObjek.push({ nama: namaShalat, waktu: objekWaktu });
    }
    
    for (const target of listWaktuObjek) {
        if (waktuSekarang < target.waktu) {
            targetWaktuShalat = target.waktu;
            namaTargetShalat = target.nama;
            break;
        }
    }
    
    if (!targetWaktuShalat) {
        const [targetJam, targetMenit] = JADWAL_SHALAT.imsak.split(':');
        targetWaktuShalat = new Date(waktuSekarang);
        targetWaktuShalat.setDate(targetWaktuShalat.getDate() + 1);
        targetWaktuShalat.setHours(parseInt(targetJam), parseInt(targetMenit), 0, 0);
        namaTargetShalat = "imsak";
    }

    const selisihMiliDetik = targetWaktuShalat - waktuSekarang;
    const durasiIqomahDetik = jedaIqomahMenit * 60;

    let selisihDetikTotal = Math.floor(selisihMiliDetik / 1000); 
    let simulasiIqomahAktif = false;

    let shalatSaatIni = null;
    let sisaWaktuIqomahDetik = 0;

    for (let i = 0; i < listWaktuObjek.length; i++) {
        const selisihDetikMasuk = Math.floor((waktuSekarang - listWaktuObjek[i].waktu) / 1000);
        if ((selisihDetikMasuk >= 0 && selisihDetikMasuk < durasiIqomahDetik) || (simulasiIqomahAktif && i === 3)) { 
            shalatSaatIni = listWaktuObjek[i] || listWaktuObjek[3]; 
            sisaWaktuIqomahDetik = simulasiIqomahAktif ? (durasiIqomahDetik - 120) : (durasiIqomahDetik - selisihDetikMasuk);
            break;
        }
    }

    document.querySelectorAll('.prayer-card').forEach(card => {
        card.classList.remove('active');
        const elemenSubTimer = card.querySelector('.sub-timer');
        if (elemenSubTimer) elemenSubTimer.remove();
    });

    const elemenLayarFullscreen = document.getElementById('layar-countdown-fullscreen');
    
    let elemenDisplayWrapper = document.querySelector('.display-wrapper') || 
                               document.querySelector('.container') || 
                               document.querySelector('.wrapper') ||
                               document.querySelector('main');

    // KONDISI 1: JEDA IQOMAH AKTIF (KEMBALI KE TV UTAMA)
    if (shalatSaatIni) {
        sudahBunyiAzan = false;

        if (elemenLayarFullscreen) {
            elemenLayarFullscreen.style.setProperty('display', 'none', 'important');
        }
        
        if (elemenDisplayWrapper) {
            elemenDisplayWrapper.style.setProperty('display', 'flex', 'important');
        } else {
            document.body.style.setProperty('display', 'block', 'important');
        }

        if (sisaWaktuIqomahDetik <= 1 && !sudahBunyiIqomah) {
            const audioIqomah = document.getElementById('audio-iqomah');
            if (audioIqomah) audioIqomah.play().catch(e => console.log(e));
            sudahBunyiIqomah = true;
        }

        const cardAktif = document.getElementById(shalatSaatIni.nama);
        if (cardAktif) {
            cardAktif.classList.add('active');
            const mIqomah = String(Math.floor(sisaWaktuIqomahDetik / 60)).padStart(2, '0');
            const sIqomah = String(sisaWaktuIqomahDetik % 60).padStart(2, '0');
            beriSubTimer(cardAktif, sisaWaktuIqomahDetik <= 1 ? `Waktu Shalat` : `Iqomah: -${mIqomah}:${sIqomah}`);
        }
    } 
    // KONDISI 2: HITUNG MUNDUR JELANG AZAN (LAYAR FULLSCREEN)
    else {
        sudahBunyiIqomah = false;

        const cardTarget = document.getElementById(namaTargetShalat);
        if (cardTarget) {
            cardTarget.classList.add('active');
            
            const jamSisa = String(Math.floor(selisihDetikTotal / 3600)).padStart(2, '0');
            const menitSisa = String(Math.floor((selisihDetikTotal % 3600) / 60)).padStart(2, '0');
            const detikSisa = String(selisihDetikTotal % 60).padStart(2, '0');
            
            beriSubTimer(cardTarget, `-${jamSisa}:${menitSisa}:${detikSisa}`);

            if (selisihDetikTotal <= 1 && selisihDetikTotal >= -2 && !sudahBunyiAzan) {
                const audioAzan = document.getElementById('audio-azan');
                if (audioAzan) audioAzan.play().catch(e => console.log(e));
                sudahBunyiAzan = true;
            }

            if (selisihDetikTotal > 0 && selisihDetikTotal <= 600) {
                if (elemenDisplayWrapper) {
                    elemenDisplayWrapper.style.setProperty('display', 'none', 'important');
                }
                if (elemenLayarFullscreen) {
                    elemenLayarFullscreen.style.setProperty('display', 'flex', 'important');
                }

                const waktuSkrg = new Date();
                const jamSkrg = String(waktuSkrg.getHours()).padStart(2, '0');
                const mntSkrg = String(waktuSkrg.getMinutes()).padStart(2, '0');
                const dtkSkrg = String(waktuSkrg.getSeconds()).padStart(2, '0');

                if (elemenLayarFullscreen) {
                    elemenLayarFullscreen.innerHTML = `
                        <div class="frame-countdown">
                            <div class="timer-raksasa">-${menitSisa}:${detikSisa}</div>
                            <div class="jam-sekarang-badge">🕒 ${jamSkrg}:${mntSkrg}:${dtkSkrg}</div>
                            <div class="pembatas-jalur">✦</div>
                            <div class="status-judul">Menjelang ${namaTargetShalat.charAt(0).toUpperCase() + namaTargetShalat.slice(1)} - ${JADWAL_SHALAT[namaTargetShalat]}</div>
                            <p class="teks-hadits">
                                "Shalat berjamaah itu lebih utama daripada shalat sendiri sebanyak 27 derajat."<br><strong>(HR. Bukhari & Muslim)</strong>
                            </p>
                        </div>
                    `;
                }
            } else {
                if (elemenDisplayWrapper) {
                    elemenDisplayWrapper.style.setProperty('display', 'flex', 'important');
                }
                if (elemenLayarFullscreen) {
                    elemenLayarFullscreen.style.setProperty('display', 'none', 'important');
                }
            }
        }
    }
}

function beriSubTimer(elemenCard, teksWaktu) {
    let elemenSubTimer = elemenCard.querySelector('.sub-timer');
    if (!elemenSubTimer) {
        elemenSubTimer = document.createElement('span');
        elemenSubTimer.className = 'sub-timer';
        elemenCard.appendChild(elemenSubTimer);
    }
    elemenSubTimer.innerText = teksWaktu;
}