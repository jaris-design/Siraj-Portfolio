const cursor = document.getElementById('custom-cursor');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// 1. Capture mouse position as fast as the browser sends it
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// 2. Update the cursor position using requestAnimationFrame
// This syncs the movement with your screen's refresh rate
function updateCursor() {
    // To make it feel "stuck" to the mouse (Zero Lag):
    cursorX = mouseX;
    cursorY = mouseY;

    // Apply the position
    // We use rotate(-15deg) here to keep the pointer angle
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) rotate(-15deg)`;

    requestAnimationFrame(updateCursor);
}

// Start the loop
updateCursor();

// 3. Keep your hover logic (unchanged)
const hoverElements = document.querySelectorAll('a, button, .portfolio-box, .filter-btn, .skill-box');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
});

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
            item.classList.add('visible-item'); 
        } else {
            item.style.display = 'none';
            item.classList.remove('visible-item');
        }
    });
}

// -------------------------
// 3. Auto-Fetch Video Thumbnails
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

    filterPortfolio('animation');
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
            // 1. Create video element if it doesn't exist
            if (!video) {
                video = document.createElement('video');
                video.src = videoUrl;
                video.muted = true;
                video.loop = true;
                video.playsInline = true; // Required for mobile
                video.classList.add('hover-video');
                box.appendChild(video);
            }
            
            // 2. Play the video
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Autoplay prevented");
                });
            }
        });

        box.addEventListener('mouseleave', () => {
            if (video) {
                video.pause();
                // Optional: video.currentTime = 0; // Reset to beginning
            }
        });
    });
});

// -------------------------
// 4. Lightbox (Images) Logic
// -------------------------
function openLightbox(element) {
    const lightboxInner = document.getElementById('lightboxInner');
    lightboxInner.innerHTML = ''; // Clear existing slides

    // 1. Get all visible portfolio items of the current filter
    const activeFilter = document.querySelector('.filter-btn.active').getAttribute('onclick').match(/'(.*?)'/)[1];
    const items = document.querySelectorAll(`.portfolio-item.${activeFilter}`);

    let activeIndex = 0;

    items.forEach((item, index) => {
        const box = item.querySelector('.portfolio-box');
        
        // PRIORITY: Use data-full if it exists, otherwise use the thumbnail src
        const fullImgUrl = box.getAttribute('data-full') || box.querySelector('img').src;
        
        const isActive = (box === element) ? 'active' : '';
        if (box === element) activeIndex = index;

        // Add slide to carousel
        lightboxInner.innerHTML += `
            <div class="carousel-item ${isActive}">
                <img src="${fullImgUrl}" class="d-block" alt="Portfolio Image">
            </div>
        `;
    });

    // 2. Show the Modal
    const lightboxModal = new bootstrap.Modal(document.getElementById('lightboxModal'));
    lightboxModal.show();
}

// -------------------------
// 5. Video Modal Logic
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

videoModalEl.addEventListener('hidden.bs.modal', function () {
    videoFrame.src = ""; 
});

// Animation Observer
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2 // Trigger when 20% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Run animation only once
        }
    });
}, observerOptions);

// Select all elements to animate
document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
});

// -------------------------
// 6. Lenis Logic
// -------------------------

// Initialize Lenis
const lenis = new Lenis();

// Use requestAnimationFrame to update Lenis on every frame
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Optional: Log scroll position (for testing)
lenis.on('scroll', (e) => {
  // console.log(e);
});

// 1. FORCE SCROLL TO TOP ON REFRESH
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}

window.onload = function() {
    window.scrollTo(0, 0);
};

// 2. BACK TO TOP BUTTON LOGIC
const backToTopBtn = document.getElementById("backToTop");
const skillsSection = document.getElementById("skills");

window.addEventListener("scroll", () => {
    if (!skillsSection) return;

    // Get the distance of the Skills section from the top of the page
    const skillsPosition = skillsSection.offsetTop;
    // Get the current scroll position
    const currentScroll = window.scrollY + (window.innerHeight / 2); // Trigger when skills is halfway up

    // Logic: If we have scrolled past the start of the skills section
    if (window.scrollY >= (skillsPosition - window.innerHeight / 2)) {
        backToTopBtn.classList.add("show");
    } else {
        backToTopBtn.classList.remove("show");
    }
});

function scrollToTop() {
    // If you are using Lenis (smooth scroll), use this:
    /* if (typeof lenis !== 'undefined') {
        lenis.scrollTo(0);
    } else { */
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    /* } */
}