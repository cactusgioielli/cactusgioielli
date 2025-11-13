function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    document.getElementById(tab + '-btn').classList.add('active');
    // Reset search on tab change
    if (document.getElementById('search-input')) {
        document.getElementById('search-input').value = '';
        resetGallerySearch();
    }
}
let galleryImages = [];
let currentIndex = 0;
function updateModalCounter() {
    const counter = document.getElementById('modal-counter');
    if (galleryImages.length > 0 && typeof currentIndex === 'number') {
        counter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
        counter.style.display = '';
    } else {
        counter.style.display = 'none';
    }
}
function openModal(src) {
    // Trova la gallery di appartenenza (Cactacee, Succulente, Composizioni)
    let imgEl = null;
    document.querySelectorAll('.gallery img').forEach(img => {
        if (img.src === src || img.getAttribute('src') === src) imgEl = img;
    });
    let parentGallery = null;
    if (imgEl) {
        parentGallery = imgEl.closest('.gallery');
    }
    if (parentGallery) {
        galleryImages = Array.from(parentGallery.querySelectorAll('img'));
    } else {
        galleryImages = Array.from(document.querySelectorAll('.gallery img'));
    }
    function normalize(url) {
        try { return new URL(url, window.location.href).href; } catch { return url; }
    }
    const normalizedSrc = normalize(src);
    currentIndex = galleryImages.findIndex(img => normalize(img.src) === normalizedSrc);
    if (currentIndex === -1) {
        const srcFile = src.split('/').pop();
        currentIndex = galleryImages.findIndex(img => img.src.split('/').pop() === srcFile);
    }
    if (currentIndex === -1) return;
    showModalImage();
    document.getElementById('image-modal').classList.add('active');
    document.addEventListener('keydown', handleModalKey);
    // Aggiungi stato alla history per abilitare il tasto indietro
    history.pushState({ lightbox: true }, '', '#lightbox');
    updateModalCounter();
}
function showModalImage() {
    const modalImg = document.getElementById('modal-img');
    if (galleryImages[currentIndex]) {
        modalImg.src = galleryImages[currentIndex].src;
        modalImg.alt = galleryImages[currentIndex].alt || '';
    }
    updateModalCounter();
}
function closeModal() {
    document.getElementById('image-modal').classList.remove('active');
    document.removeEventListener('keydown', handleModalKey);
    // Se siamo nello stato lightbox, torna indietro nella history
    if (window.location.hash === '#lightbox') {
        setTimeout(() => history.back(), 0);
    }
    // Nascondi il contatore
    document.getElementById('modal-counter').style.display = 'none';
}
function prevImage(e) {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    showModalImage();
}
function nextImage(e) {
    if (e) e.stopPropagation();
    currentIndex = (currentIndex + 1) % galleryImages.length;
    showModalImage();
}
function handleModalKey(e) {
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') closeModal();
}
window.onload = () => {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
    showTab('home'); // Mostra la scheda Home all'avvio
};
// Gestisci il tasto indietro del browser per chiudere il lightbox
window.addEventListener('popstate', function (event) {
    const modal = document.getElementById('image-modal');
    if (modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.removeEventListener('keydown', handleModalKey);
    }
});
// Gestione click fuori dal popup per chiudere e tornare indietro
window.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    const modalContent = document.getElementById('modal-content-wrapper');
    if (modal) {
        modal.addEventListener('mousedown', function (e) {
            // Se il click è fuori dal popup centrale (foto e frecce)
            if (!modalContent.contains(e.target)) {
                closeModal();
            }
        });
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
            setTimeout(() => {
                // Scrolla e apri la foto
                foundImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                openModal(foundImg.src);
            }, 200);
            return;
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


window.addEventListener('DOMContentLoaded', () => {
    const slideshow = document.querySelector('.slideshow');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');

    if (!slideshow || slides.length === 0) return;

    let index = 0;

    function slidesPerView() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function updateSlidePosition() {
        const visible = slidesPerView();
        const movePercent = index * (100 / visible);
        slideshow.style.transform = `translateX(-${movePercent}%)`;
    }

    nextBtn.addEventListener('click', () => {
        const visible = slidesPerView();
        if (index < slides.length - visible) index++;
        updateSlidePosition();
    });

    prevBtn.addEventListener('click', () => {
        if (index > 0) index--;
        updateSlidePosition();
    });

    // Scorrimento automatico
    setInterval(() => {
        const visible = slidesPerView();
        index = (index + 1) % (slides.length - visible + 1);
        updateSlidePosition();
    }, 4000);

    window.addEventListener('resize', updateSlidePosition);
});
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
function scrollToPosition(position = 850, duration = 800) {
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
