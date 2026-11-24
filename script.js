// -------------------------
// Theme Toggle Logic
// -------------------------
const themeButtons = [
    document.getElementById('themeToggle'),
    document.getElementById('themeToggleMobile')
];

function updateThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    themeButtons.forEach(btn => {
        if (!btn) return;
        const icon = btn.querySelector('i');
        const text = btn.querySelector('.theme-text');

        if (theme === 'dark') {
            if (icon) icon.className = 'fas fa-sun';
            if (text) text.textContent = 'Light Mode';
        } else {
            if (icon) icon.className = 'fas fa-moon';
            if (text) text.textContent = 'Dark Mode';
        }
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    updateThemeUI(initialTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    updateThemeUI(newTheme);
}

// Attach click events
themeButtons.forEach(btn => {
    if (btn) btn.addEventListener('click', toggleTheme);
});

// Run theme detection immediately on script execution
initTheme();

// -------------------------
// 1. Sidebar & Mobile Logic
// -------------------------
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function closeMobileMenu() {
    if (window.innerWidth < 992) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

// Active Link Highlight on Scroll
const sections = document.querySelectorAll("section");
const navLi = document.querySelectorAll("#sidebar .nav-link");

window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute("id");
        }
    });

    navLi.forEach((li) => {
        li.classList.remove("active");
        if (li.getAttribute("href").includes(current)) {
            li.classList.add("active");
        }
    });
});

// -------------------------
// 2. Portfolio Filter & Animation Pagination Logic
// -------------------------
const VIDEOS_PER_PAGE = 6;
let currentAnimationPage = 1;

function filterPortfolio(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    const paginationEl = document.getElementById('animation-pagination');
    
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });

    // Hide all items first
    items.forEach(item => {
        item.classList.remove('visible-item');
        item.style.display = 'none';
    });

    if (category === 'animation') {
        currentAnimationPage = 1;
        renderAnimationPage(currentAnimationPage);
    } else {
        // Hide pagination for other categories
        if (paginationEl) paginationEl.style.display = 'none';

        items.forEach(item => {
            if (item.classList.contains(category)) {
                item.style.display = 'block';
                setTimeout(() => item.classList.add('visible-item'), 10);
            }
        });
    }
}

function renderAnimationPage(page) {
    const animationItems = Array.from(document.querySelectorAll('.portfolio-item.animation'));
    const totalPages = Math.ceil(animationItems.length / VIDEOS_PER_PAGE);
    const paginationEl = document.getElementById('animation-pagination');

    // Clamp page number within valid range
    currentAnimationPage = Math.max(1, Math.min(page, totalPages));

    const startIndex = (currentAnimationPage - 1) * VIDEOS_PER_PAGE;
    const endIndex = startIndex + VIDEOS_PER_PAGE;

    // Show only the 6 videos for the current page
    animationItems.forEach((item, index) => {
        if (index >= startIndex && index < endIndex) {
            item.style.display = 'block';
            setTimeout(() => item.classList.add('visible-item'), 10);
        } else {
            item.classList.remove('visible-item');
            item.style.display = 'none';
        }
    });

    // Show pagination controls only if there is more than 1 page
    if (paginationEl) {
        if (totalPages > 1) {
            paginationEl.style.display = 'flex';
            updatePaginationUI(totalPages);
        } else {
            paginationEl.style.display = 'none';
        }
    }
}

function updatePaginationUI(totalPages) {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pageNumbersEl = document.getElementById('pageNumbers');
    const pageIndicatorEl = document.getElementById('pageIndicator');

    // Update Prev / Next button states
    prevBtn.disabled = currentAnimationPage === 1;
    nextBtn.disabled = currentAnimationPage === totalPages;

    // Update text indicator (e.g., "Page 1 of 2")
    pageIndicatorEl.textContent = `Page ${currentAnimationPage} of ${totalPages}`;

    // Render clickable page number buttons
    pageNumbersEl.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentAnimationPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => goToAnimationPage(i);
        pageNumbersEl.appendChild(btn);
    }
}

function changeAnimationPage(delta) {
    goToAnimationPage(currentAnimationPage + delta);
}

function goToAnimationPage(page) {
    renderAnimationPage(page);
    // Smoothly scroll back to the top of the portfolio section
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection && typeof lenis !== 'undefined') {
        lenis.scrollTo(portfolioSection);
    }
}

// -------------------------
// 3. Auto-Fetch Video Thumbnails & Init
// -------------------------
window.addEventListener('DOMContentLoaded', function() {
    const videoBoxes = document.querySelectorAll('.portfolio-box[onclick*="vimeo.com"]');
    
    videoBoxes.forEach(box => {
        const clickAttr = box.getAttribute('onclick');
        const idMatch = clickAttr.match(/vimeo\.com\/(\d+)/);
        
        if (idMatch && idMatch[1]) {
            const vimeoId = idMatch[1];
            const img = box.querySelector('img');
            
            // Fetch high-quality thumbnail directly from Vimeo's official API
            fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    if (img && data.thumbnail_url) {
                        // Upgrade thumbnail resolution from default 640 to larger preview if available
                        img.src = data.thumbnail_url.replace(/_\d+x\d+/, '_1280x720');
                    }
                })
                .catch(err => {
                    console.warn(`Could not load thumbnail for Vimeo ID: ${vimeoId}`, err);
                    // Fallback to Vumbnail if API fails
                    if (img) img.src = `https://vumbnail.com/${vimeoId}_large.jpg`;
                });
        }
    });

    // Initialize Portfolio
    filterPortfolio('animation');
    
    // Initialize Animations
    scrollReveal();
});

// -------------------------
// 4. Handles the "Create, Play, and Pause" logic
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    const boxes = document.querySelectorAll('.portfolio-box[data-preview]');

    boxes.forEach(box => {
        const videoUrl = box.getAttribute('data-preview');
        let video = null;

        box.addEventListener('mouseenter', () => {
            if (!video) {
                video = document.createElement('video');
                video.src = videoUrl;
                video.muted = true;
                video.loop = true;
                video.playsInline = true;
                video.classList.add('hover-video');
                box.appendChild(video);
            }
            
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => { console.log("Autoplay prevented"); });
            }
        });

        box.addEventListener('mouseleave', () => {
            if (video) video.pause();
        });
    });
});

// -------------------------
// 5. Lightbox (Images) Logic
// -------------------------
function openLightbox(element) {
    const lightboxInner = document.getElementById('lightboxInner');
    lightboxInner.innerHTML = ''; 

    const activeFilterBtn = document.querySelector('.filter-btn.active');
    // Safety check if no filter is active
    const activeFilter = activeFilterBtn 
        ? activeFilterBtn.getAttribute('onclick').match(/'(.*?)'/)[1] 
        : 'animation';

    const items = document.querySelectorAll(`.portfolio-item.${activeFilter}`);

    items.forEach((item, index) => {
        const box = item.querySelector('.portfolio-box');
        const fullImgUrl = box.getAttribute('data-full') || box.querySelector('img').src;
        const isActive = (box === element) ? 'active' : '';

        lightboxInner.innerHTML += `
            <div class="carousel-item ${isActive}">
                <img src="${fullImgUrl}" class="d-block" alt="Portfolio Image">
            </div>
        `;
    });

    const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
    lightboxModal.show();
}

// -------------------------
// 6. Video Modal Logic
// -------------------------
const videoModalEl = document.getElementById('videoModal');
const videoFrame = document.getElementById('videoFrame');

function openVimeo(standardUrl) {
    let embedSrc = "";
    if (standardUrl.includes("vimeo.com")) {
        const match = standardUrl.match(/vimeo.*\/(\d+)/i);
        if (match && match[1]) {
            embedSrc = `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
        }
    } 
    
    if (embedSrc) {
        videoFrame.src = embedSrc;
        const videoModal = new bootstrap.Modal(videoModalEl);
        videoModal.show();
    }
}

if(videoModalEl) {
    videoModalEl.addEventListener('hidden.bs.modal', function () {
        videoFrame.src = ""; 
    });
}

// -------------------------
// 7. Scroll Reveal Animation
// -------------------------
const scrollReveal = () => {
    const observerOptions = {
        threshold: 0.1 // Triggers when 10% is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
};

// -------------------------
// 8. Lenis Smooth Scroll
// -------------------------
const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// -------------------------
// 9. Back To Top
// -------------------------
const backToTopBtn = document.getElementById("backToTop");
const skillsSection = document.getElementById("skills");

window.addEventListener("scroll", () => {
    if (!skillsSection || !backToTopBtn) return;

    const skillsPosition = skillsSection.offsetTop;
    if (window.scrollY >= (skillsPosition - window.innerHeight / 2)) {
        backToTopBtn.classList.add("show");
    } else {
        backToTopBtn.classList.remove("show");
    }
});

function scrollToTop() {
    lenis.scrollTo(0);
}

// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.onload = function() {
    window.scrollTo(0, 0);
};