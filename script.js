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
// 2. Portfolio Filter Logic
// -------------------------
function filterPortfolio(category) {
    const buttons = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');
    
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if(btn.getAttribute('onclick').includes(`'${category}'`)) {
            btn.classList.add('active');
        }
    });

    items.forEach(item => {
        if (item.classList.contains(category)) {
            item.style.display = 'block';
            // Slight delay to allow display:block to apply before opacity transition
            setTimeout(() => item.classList.add('visible-item'), 10);
        } else {
            item.classList.remove('visible-item');
            item.style.display = 'none';
        }
    });
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
            if (img) img.src = `https://vumbnail.com/${vimeoId}_large.jpg`;
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