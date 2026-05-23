/* iMagic Beauty — main.js */

(function () {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── Dynamic Year ──────────────────────────────

    const currentYear = new Date().getFullYear();
    document.getElementById('bookingYear').textContent    = currentYear;
    document.getElementById('copyrightYear').textContent  = currentYear;

    // ─── Undraggable Images ────────────────────────

    document.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));

    // ─── Mobile Menu ───────────────────────────────

    const hamburger       = document.getElementById('hamburger');
    const mobileMenu      = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');

    function openMobileMenu() {
        mobileMenu.classList.add('open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);

    document.querySelectorAll('.mobile-nav-links a, .mobile-cta').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ─── Scroll Reveal ─────────────────────────────

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ─── Gallery Lightbox ──────────────────────────

    const lightbox      = document.getElementById('lightbox');
    const lightboxImg   = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    function openLightbox(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setTimeout(() => { lightboxImg.src = ''; }, 350);
    }

    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img) openLightbox(img.src, img.alt);
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightbox.classList.contains('open')) closeLightbox();
            if (mobileMenu.classList.contains('open')) closeMobileMenu();
        }
    });

    // ─── Cursor Glow ───────────────────────────────

    const cursorGlow = document.getElementById('cursorGlow');

    if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top  = e.clientY + 'px';
            cursorGlow.style.opacity = '1';
        });
        document.addEventListener('mouseleave', () => {
            cursorGlow.style.opacity = '0';
        });
    }

    // ─── Counter Animation ─────────────────────────

    const artistStats = document.querySelector('.artist-stats');

    if (artistStats) {
        let countersRun = false;

        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !countersRun) {
                countersRun = true;
                counterObserver.disconnect();

                artistStats.querySelectorAll('.stat-number').forEach(el => {
                    const raw   = el.textContent.trim();
                    const match = raw.match(/^(\d+)/);
                    if (!match) return;

                    const target = parseInt(match[1], 10);
                    const suffix = raw.slice(match[1].length);
                    const duration = 1600;
                    const start = performance.now();

                    function tick(now) {
                        const elapsed  = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased    = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.round(eased * target) + suffix;
                        if (progress < 1) requestAnimationFrame(tick);
                    }

                    requestAnimationFrame(tick);
                });
            }
        }, { threshold: 0.5 });

        counterObserver.observe(artistStats);
    }

    // ─── RAF Scroll Loop ───────────────────────────

    if (reducedMotion) return;

    const navbar      = document.getElementById('navbar');
    const scrollBar   = document.getElementById('scrollProgress');
    const heroVisual  = document.getElementById('heroVisual');
    const showcases   = document.querySelectorAll('.showcase-image img');
    const photoRail   = document.getElementById('photoRail');
    const railWrapper = photoRail ? photoRail.closest('.photo-rail-wrapper') : null;

    let ticking = false;

    function onRAF() {
        const scrollY   = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        // Scroll progress bar
        if (scrollBar) {
            scrollBar.style.width = (scrollY / maxScroll * 100) + '%';
        }

        // Navbar scrolled state
        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 60);
        }

        // Hero parallax
        if (heroVisual && scrollY < window.innerHeight * 1.5) {
            heroVisual.style.transform = `translateY(${scrollY * 0.12}px)`;
        }

        // Showcase image parallax
        showcases.forEach(img => {
            const rect     = img.closest('.showcase-image').getBoundingClientRect();
            const vh       = window.innerHeight;
            const progress = 1 - (rect.top + rect.height) / (vh + rect.height);
            const shift    = (progress - 0.5) * 70;
            img.style.transform = `scale(1.12) translateY(${shift}px)`;
        });

        // Horizontal photo rail driven by wrapper scroll position
        if (photoRail && railWrapper) {
            const rect       = railWrapper.getBoundingClientRect();
            const vh         = window.innerHeight;
            const maxTravel  = photoRail.scrollWidth - railWrapper.clientWidth;
            // progress: 0 when wrapper bottom enters viewport, 1 when wrapper top exits
            const progress   = 1 - (rect.bottom) / (vh + rect.height);
            const clamped    = Math.max(0, Math.min(1, progress));
            photoRail.style.transform = `translateX(${-maxTravel * clamped}px)`;
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onRAF);
            ticking = true;
        }
    }, { passive: true });

    // Run once on load to set initial state
    onRAF();

})();
