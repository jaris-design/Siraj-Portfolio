document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------
    // 1. Full-Page Crossfade & Depth Scale Navigation Controller
    // -------------------------------------------------------------
    const sections = Array.from(document.querySelectorAll('.snap-section'));
    const navLinks = document.querySelectorAll('.nav-link');
    let currentIndex = 0;
    let isTransitioning = false;
    const TRANSITION_DURATION = 700; // ms

    function goToPage(index) {
        if (index < 0 || index >= sections.length) return;
        if (index === currentIndex && sections[currentIndex].classList.contains('active-page')) return;
        
        isTransitioning = true;

        // Transition active state between pages
        sections[currentIndex].classList.remove('active-page');
        currentIndex = index;
        sections[currentIndex].classList.add('active-page');

        // Update Navbar link highlighting
        const activeId = sections[currentIndex].getAttribute('id');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-target') === activeId);
        });

        setTimeout(() => {
            isTransitioning = false;
        }, TRANSITION_DURATION);
    }

    // Initialize first page as active
    sections.forEach((sec, idx) => {
        if (idx === 0) sec.classList.add('active-page');
        else sec.classList.remove('active-page');
    });

    // Trackpad & Mouse Wheel listener
    window.addEventListener('wheel', (e) => {
        // If scrolling inside the Portfolio gallery, allow internal scroll until boundary
        const portfolioScroll = document.querySelector('.portfolio-scroll-window');
        if (portfolioScroll && portfolioScroll.contains(e.target)) {
            const atTop = portfolioScroll.scrollTop === 0;
            const atBottom = Math.abs(portfolioScroll.scrollHeight - portfolioScroll.clientHeight - portfolioScroll.scrollTop) <= 2;
            
            if (!atTop && e.deltaY < 0) return;
            if (!atBottom && e.deltaY > 0) return;
        }

        if (isTransitioning) return;

        if (e.deltaY > 25) {
            goToPage(currentIndex + 1);
        } else if (e.deltaY < -25) {
            goToPage(currentIndex - 1);
        }
    }, { passive: true });

    // Touch events for mobile swiping
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (isTransitioning) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) > 45) {
            if (diff > 0) goToPage(currentIndex + 1);
            else goToPage(currentIndex - 1);
        }
    }, { passive: true });

    // Keyboard Arrow navigation
    window.addEventListener('keydown', (e) => {
        if (isTransitioning) return;
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            goToPage(currentIndex + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            goToPage(currentIndex - 1);
        }
    });

    // Listen to ALL internal hash links (Navbar + "CONTACT ME" button + logo)
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            
            const targetId = href.substring(1);
            const targetIdx = sections.findIndex(sec => sec.getAttribute('id') === targetId);
            
            if (targetIdx !== -1) {
                e.preventDefault();
                goToPage(targetIdx);
                document.getElementById('navMenu')?.classList.remove('open');
            }
        });
    });

    // -------------------------------------------------------------
    // 2. Minimalist Theme Switcher (Dark / Light)
    // -------------------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const root = document.documentElement;

    themeToggle?.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme') || 'dark';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', nextTheme);
        themeToggle.textContent = nextTheme === 'dark' ? 'Light' : 'Dark';
    });

    // -------------------------------------------------------------
    // 3. Mobile Navigation Menu Toggle
    // -------------------------------------------------------------
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    mobileToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });

    // -------------------------------------------------------------
    // 4. Portfolio Category Filtering
    // -------------------------------------------------------------
    const filterPills = document.querySelectorAll('.filter-pill');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const filterValue = pill.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (filterValue === itemCategory) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });

            // Reset internal scroll window to top upon filter switch
            document.querySelector('.portfolio-scroll-window')?.scrollTo({ top: 0 });
        });
    });

    // Trigger initial filter on Animation
    const defaultPill = document.querySelector('.filter-pill[data-filter="animation"]');
    defaultPill?.click();
});

// -------------------------------------------------------------
// 5. Native Video Modal Logic (Vimeo)
// -------------------------------------------------------------
const videoModal = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');

function openVimeo(vimeoUrl) {
    const idMatch = vimeoUrl.match(/vimeo.*\/(\d+)/i);
    if (idMatch && idMatch[1]) {
        videoFrame.src = `https://player.vimeo.com/video/${idMatch[1]}?autoplay=1`;
        videoModal.classList.add('open');
    }
}

function closeVimeo() {
    videoFrame.src = "";
    videoModal.classList.remove('open');
}

// -------------------------------------------------------------
// 6. Native Lightbox Modal Logic
// -------------------------------------------------------------
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
let currentActiveImages = [];
let currentImageIndex = 0;

function openLightbox(cardElement) {
    const activeCategory = document.querySelector('.filter-pill.active')?.getAttribute('data-filter') || 'illustration';
    const visibleCards = Array.from(document.querySelectorAll(`.portfolio-item[data-category="${activeCategory}"] .portfolio-box`));
    
    currentActiveImages = visibleCards.map(card => card.getAttribute('data-full'));
    const clickedUrl = cardElement.getAttribute('data-full');
    currentImageIndex = currentActiveImages.indexOf(clickedUrl);

    if (currentImageIndex === -1) currentImageIndex = 0;

    lightboxImg.src = currentActiveImages[currentImageIndex];
    lightboxModal.classList.add('open');
}

function closeLightbox() {
    lightboxModal.classList.remove('open');
    lightboxImg.src = '';
}

function nextImage() {
    if (currentActiveImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % currentActiveImages.length;
    lightboxImg.src = currentActiveImages[currentImageIndex];
}

function prevImage() {
    if (currentActiveImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + currentActiveImages.length) % currentActiveImages.length;
    lightboxImg.src = currentActiveImages[currentImageIndex];
}

// Global modal keyboard shortcuts
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVimeo();
        closeLightbox();
    }
    if (lightboxModal.classList.contains('open')) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    }
});