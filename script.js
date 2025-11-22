document.addEventListener("DOMContentLoaded", () => { //CARICAMENTO
    const progressBar = document.getElementById("loadingProgress");
    const percentValue = document.getElementById("percentValue");
    const preloader = document.getElementById("preloader");

    // Trova tutte le risorse principali
    const imgs = Array.from(document.images);
    const total = imgs.length;
    let loaded = 0;

    // Se non ci sono immagini, chiudi subito
    if (total === 0) {
        progressBar.style.width = "100%";
        percentValue.textContent = "100%";
        setTimeout(() => preloader.classList.add("hide"), 300);
        return;
    }

    imgs.forEach(img => {
        const imageClone = new Image();
        imageClone.onload = imageClone.onerror = () => {
            loaded++;
            let percent = Math.floor((loaded / total) * 100);

            // Aggiorna barra + percentuale
            progressBar.style.width = percent + "%";
            percentValue.textContent = percent + "%";

            // Quando tutto è caricato → chiudi preloader
            if (loaded === total) {
                setTimeout(() => {
                    preloader.classList.add("hide");
                }, 300);
            }
        };
        imageClone.src = img.src;
    });
});


/*
    ===============================
    MODAL MODERNIZZATA (SAFE MODE)
    ===============================
*/

let galleryImages = [];
let currentIndex = 0;

// --- Aggiorna contatore ---
function updateModalCounter() {
    const counter = document.getElementById('modal-counter');
    if (!counter) return;

    if (galleryImages.length > 0) {
        counter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
        counter.style.display = '';
    } else {
        counter.style.display = 'none';
    }
}

// --- Apri modal ---
function openModal(src) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    if (!modal || !modalImg) return;

    // trova immagine cliccata
    let imgEl = null;
    document.querySelectorAll('.gallery img').forEach(img => {
        if (img.src === src || img.getAttribute('src') === src) imgEl = img;
    });

    // trova gallery corretta
    let parentGallery = imgEl ? imgEl.closest('.gallery') : null;

    galleryImages = parentGallery
        ? Array.from(parentGallery.querySelectorAll('img'))
        : Array.from(document.querySelectorAll('.gallery img'));

    // normalizza URL
    function normalize(url) {
        try { return new URL(url, window.location.href).href; }
        catch { return url; }
    }

    const normalizedSrc = normalize(src);
    currentIndex = galleryImages.findIndex(img => normalize(img.src) === normalizedSrc);

    // fallback ricerca file
    if (currentIndex === -1) {
        const srcFile = src.split('/').pop();
        currentIndex = galleryImages.findIndex(img => img.src.split('/').pop() === srcFile);
    }

    if (currentIndex === -1) return;

    showModalImage();

    modal.classList.add('active');
    document.addEventListener('keydown', handleModalKey);

    history.pushState({ lightbox: true }, '', '#lightbox');
    updateModalCounter();
}

// --- Mostra immagine ---
function showModalImage() {
    const modalImg = document.getElementById('modal-img');
    if (!modalImg) return;

    modalImg.classList.remove('slide-left', 'slide-right');

    modalImg.src = galleryImages[currentIndex].src;
    modalImg.alt = galleryImages[currentIndex].alt || '';

    updateModalCounter();
}

// --- Chiudi modal ---
function closeModal() {
    const modal = document.getElementById('image-modal');
    const counter = document.getElementById('modal-counter');

    if (modal) modal.classList.remove('active');
    if (counter) counter.style.display = 'none';

    document.removeEventListener('keydown', handleModalKey);

    if (window.location.hash === '#lightbox') {
        setTimeout(() => history.back(), 0);
    }
}

// --- Slide next/prev ---
function changeModalImage(direction) {
    const modalImg = document.getElementById('modal-img');
    if (!modalImg) return;

    // animazione uscita
    modalImg.classList.remove('slide-left', 'slide-right');
    modalImg.classList.add(direction === 'next' ? 'slide-left' : 'slide-right');

    setTimeout(() => {
        if (direction === 'next') {
            currentIndex = (currentIndex + 1) % galleryImages.length;
        } else {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        }

        modalImg.classList.remove('slide-left', 'slide-right');
        showModalImage();
    }, 280);
}

// compatibilità con HTML esistente
function prevImage(e) {
    if (e) e.stopPropagation();
    changeModalImage('prev');
}

function nextImage(e) {
    if (e) e.stopPropagation();
    changeModalImage('next');
}

// --- Keyboard ---
function handleModalKey(e) {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') closeModal();
}

// --- Click fuori per chiudere ---
window.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    const modalContent = document.getElementById('modal-content-wrapper');

    if (modal && modalContent) {
        modal.addEventListener('mousedown', function (e) {
            if (!modalContent.contains(e.target)) {
                closeModal();
            }
        });
    }

    // --- Swipe Mobile ---
    const modalImg = document.getElementById('modal-img');
    if (modalImg) {
        let startX = 0;

        modalImg.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        });

        modalImg.addEventListener('touchend', e => {
            const endX = e.changedTouches[0].clientX;
            if (startX - endX > 50) nextImage();
            if (endX - startX > 50) prevImage();
        });
    }
});

// --- Tasto indietro chiude modal ---
window.addEventListener('popstate', function () {
    const modal = document.getElementById('image-modal');
    if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.removeEventListener('keydown', handleModalKey);
    }
});




function showGalleryCategory(cat, btn) {
    document.querySelectorAll('.gallery-category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector('.gallery-grasse').style.display = (cat === 'grasse') ? '' : 'none';
    document.querySelector('.gallery-succulente').style.display = (cat === 'succulente') ? '' : 'none';
    document.querySelector('.gallery-composizione').style.display = (cat === 'composizione') ? '' : 'none';
}
function searchGallery() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    // Navigazione automatica tra le sezioni principali
    if (query.includes('cactacee') || query.includes('cactacea') || query.includes('cactus')) {
        showTab('gallery');
        showGalleryCategory('grasse', document.querySelector('.gallery-category-btn'));
        setTimeout(() => filterGalleryImages(query), 10);
        return;
    }
    if (query.includes('succulente') || query.includes('succulenta')) {
        showTab('gallery');
        showGalleryCategory('succulente', document.querySelectorAll('.gallery-category-btn')[1]);
        setTimeout(() => filterGalleryImages(query), 10);
        return;
    }
    if (query.includes('composizioni') || query.includes('composizione')) {
        showTab('composizioni');
        setTimeout(() => filterGalleryImages(query), 10);
        return;
    }
    // Ricerca diretta per alt esatto (case-insensitive)
    const allImgs = Array.from(document.querySelectorAll('.gallery img'));
    const foundImg = allImgs.find(img => (img.alt || '').trim().toLowerCase() === query);
    if (foundImg) {
        // Trova la gallery e la tab di appartenenza
        const parentGallery = foundImg.closest('.gallery');
        if (parentGallery) {
            // Se è in gallery-grasse o gallery-succulente
            if (parentGallery.classList.contains('gallery-grasse')) {
                showTab('gallery');
                showGalleryCategory('grasse', document.querySelector('.gallery-category-btn'));
            } else if (parentGallery.classList.contains('gallery-succulente')) {
                showTab('gallery');
                showGalleryCategory('succulente', document.querySelectorAll('.gallery-category-btn')[1]);
            } else if (parentGallery.parentElement && parentGallery.parentElement.id === 'composizioni') {
                showTab('composizioni');
            }
        }
    }
    // Default: filtra nella sezione attuale e mostra messaggio se nessun risultato
    filterGalleryImages(query, true);
}
function filterGalleryImages(query, showError) {
    let found = false;
    document.querySelectorAll('.gallery:visible, .gallery[style*="display: block"], .gallery:not([style*="display: none"])').forEach(gallery => {
        Array.from(gallery.querySelectorAll('img')).forEach(img => {
            const alt = (img.alt || '').toLowerCase();
            if (query === '' || alt.includes(query)) {
                img.style.display = '';
                found = true;
            } else {
                img.style.display = 'none';
            }
        });
    });
    // Messaggio di errore se nessun risultato
    let msg = document.getElementById('search-error-msg');
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'search-error-msg';
        msg.style.cssText = 'color:#b91c1c;background:#fee2e2;border-radius:0.7em;padding:0.7em 1.2em;margin:1.2em auto 0 auto;text-align:center;max-width:340px;font-size:1.08rem;box-shadow:0 2px 8px rgba(185,28,28,0.07);display:none;';
        const galleryTab = document.getElementById('gallery');
        if (galleryTab) galleryTab.insertBefore(msg, galleryTab.firstChild);
        const compTab = document.getElementById('composizioni');
        if (compTab) compTab.insertBefore(msg.cloneNode(true), compTab.firstChild);
    }
    // Mostra/nascondi messaggio
    document.querySelectorAll('#search-error-msg').forEach(el => {
        el.style.display = (!found && query && showError) ? '' : 'none';
        if (!found && query && showError) {
            el.textContent = 'Nessun risultato trovato per "' + query + '".';
        }
    });
}
function resetGallerySearch() {
    document.querySelectorAll('.gallery img').forEach(img => {
        img.style.display = '';
    });
    document.querySelectorAll('#search-error-msg').forEach(el => {
        el.style.display = 'none';
    });
}

// SLIDE
document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector(".slideshow-container.mostra-5");
    if (!container) return;

    const track = container.querySelector(".slideshow");
    const slides = Array.from(track.querySelectorAll(".slide"));

    // DUPLICA SLIDE per loop infinito
    slides.forEach(s => {
        const clone = s.cloneNode(true);
        track.appendChild(clone);
    });

    const allSlides = Array.from(track.querySelectorAll(".slide"));
    let index = 0;

    function updateSlide(noTrans = false) {
        const slideWidth = allSlides[0].offsetWidth;

        if (noTrans) {
            track.style.transition = "none";
        } else {
            track.style.transition = "transform 0.5s ease";
        }

        track.style.transform = `translateX(-${index * slideWidth}px)`;
    }

    // AUTOPLAY ogni 3 secondi
    setInterval(() => {
        index++;
        updateSlide();

        // quando arrivi a metà (fine prima copia), reset invisibile
        if (index >= allSlides.length / 2) {
            setTimeout(() => {
                index = 0;
                updateSlide(true);
            }, 500);
        }
    }, 3000);

    updateSlide(true);
});
// FINE SLIDE

// Mostra o nasconde il banner
const banner = document.getElementById('cookie-banner');
const acceptBtn = document.getElementById('accept-cookies');
const closeBtn = document.getElementById('close-banner');

if (localStorage.getItem('cookiesAccepted')) {
    banner.style.display = 'none';
}

acceptBtn.addEventListener('click', () => {
    banner.style.opacity = '0';
    setTimeout(() => (banner.style.display = 'none'), 0);
    localStorage.setItem('cookiesAccepted', 'true');
});

const resetBtn = document.getElementById('reset-cookies');
resetBtn.addEventListener('click', () => {
    localStorage.removeItem('cookiesAccepted');
    overlay.style.display = 'flex'; // mostra subito l'overlay
});
closeBtn.addEventListener('click', () => {
    banner.style.display = 'none';
});
// Funzione per scrollare a una posizione specifica (non in cima)
function scrollToPosition(position = 800, duration = 800) {
    const start = window.scrollY;
    const distance = position - start;
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // easing dolce

        window.scrollTo(0, start + distance * ease);

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

// Funzione per scrollare fino in cima
function scrollToTop(duration = 2000) {
    const start = window.scrollY;
    const startTime = performance.now();

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easing con effetto "smooth" più dolce
        const ease = 1 - Math.pow(1 - progress, 3);

        window.scrollTo(0, start * (1 - ease));

        if (progress < 1) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

// Selettore lingua che mantiene la pagina corrente
document.addEventListener("DOMContentLoaded", function () {
    const select = document.querySelector(".footer-language-dropdown select");
    if (!select) return;

    // Determina la lingua in base al nome file corrente
    const path = window.location.pathname; // es: /index-en.html
    if (path.includes("index-en.html")) {
        select.value = "index-en.html";
    } else {
        select.value = "index.html";
    }

    // Quando l'utente cambia lingua
    select.addEventListener("change", function () {
        location.href = this.value;
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // per evitare ri-animazioni continue
            }
        });
    }, { threshold: 0.2 });

    reveals.forEach(el => observer.observe(el));
});
src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js" >
    // Inizializza EmailJS con il tuo "Public Key"
    (function () {
        emailjs.init({
            publicKey: "INSERISCI_LA_TUA_PUBLIC_KEY"
        });
    })();
document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault();

    emailjs.sendForm('TUO_SERVICE_ID', 'TUO_TEMPLATE_ID', this)
        .then(() => {
            alert('✅ Messaggio inviato con successo!');
        }, (error) => {
            alert('❌ Errore durante l’invio: ' + JSON.stringify(error));
        });
});
// GESTIONE MENU HAMBURGER PER DISPOSITIVI MOBILI
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector('.hamburger');
    const tabs = document.querySelector('.tabs');

    hamburger.addEventListener('click', () => {
        tabs.classList.toggle('active'); // alterna la visibilità
    });
});
// FUNZIONE PER SCROLLARE IN MODO SMOOTH ALLA SEZIONE SUCCESSIVA
// FUNZIONE PER SCROLLARE IN MODO SMOOTH ALLA SEZIONE SUCCESSIVA CON OFFSET
function smoothScrollToNext(offset = 0) {
    const start = window.scrollY;
    const target = start + window.innerHeight - offset; // sottrai l'offset per l'hamburger
    const duration = 1000; // durata animazione (ms)
    const startTime = performance.now();

    function easeInOutQuad(t) {
        return t < 0.5
            ? 2 * t * t
            : -1 + (4 - 2 * t) * t;
    }

    function animateScroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeInOutQuad(progress);
        const scrollY = start + (target - start) * ease;
        window.scrollTo(0, scrollY);

        if (elapsed < duration) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".tab-button").forEach(tab => {
        tab.addEventListener("click", function () {
            const targetId = this.id.replace("-btn", "");

            // Chiama showTab
            showTab(targetId);

            // Scroll dopo un piccolo delay (50ms)
            setTimeout(() => {
                smoothScrollToNext(70); // 70px di offset per l'hamburger
            }, 50);
        });
    });
});

// --- Testi in inglese e italiano ---
const texts = {
    it: {
        title: "Home",
        home: "Home",
        about: "Chi siamo",
        gallery: "Galleria",
        contact: "Contatti",
        address: "Indirizzo",
        welcome: "Benvenuto!",
        intro: "Questo è il sito della nostra azienda."
    },
    en: {
        title: "Home",
        home: "Home",
        about: "About us",
        gallery: "Gallery",
        contact: "Contact",
        address: "Address",
        welcome: "Welcome!",
        intro: "This is our company website."
    }
};

// --- Selezione lingua tramite localStorage o URL ---
const urlParams = new URLSearchParams(window.location.search);
let lang = urlParams.get("lang") || localStorage.getItem("lang") || "it";

// --- Funzione per applicare la lingua ---
function setLanguage(l) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (texts[l][key]) el.textContent = texts[l][key];
    });
    localStorage.setItem("lang", l);
}

// --- Event listener per dropdown lingua (se ce l'hai) ---
const langSelect = document.getElementById("language-select");
if (langSelect) {
    langSelect.value = lang;
    langSelect.addEventListener("change", () => {
        setLanguage(langSelect.value);
    });
}


// --- Applica lingua al caricamento della pagina ---
setLanguage(lang);

// ANIMAZIONE NUMERI
const counters = document.querySelectorAll('.stat-number');

const animateCounters = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        let count = 0;
        const speed = target / 80;

        const update = () => {
            count += speed;
            counter.textContent = Math.floor(count);

            if (count < target) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target;
            }
        };

        update();
    });
};

// Avvia animazione quando la sezione entra in viewport
const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
        animateCounters();
        observer.disconnect();
    }
});

observer.observe(document.querySelector('.stats-hero'));

/*
    _.-=-._       
  o~`  '  `~o     
 /    .-=-.  \    
|    /  _  \  |   
|   |  ( )  | |   By. Alessandro Gioielli :)
 \   \     /  /    
  `~-'`---'`-~'     
     |  |  |        
     |  |  |        
   __|  |  |__      
  (___/   \___)
*/
