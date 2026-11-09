// --- Light / Dark Mode Toggle Logic (Safe Initialization) ---
function initThemeToggle() {
        const themeToggleBtn = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');

    if (themeToggleBtn && themeIcon) {
        // Prevent adding multiple listeners if re-initialized
        themeToggleBtn.replaceWith(themeToggleBtn.cloneNode(true));
        const newToggleBtn = document.getElementById('themeToggle');
        const newThemeIcon = document.getElementById('themeIcon');

        newToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            if (document.body.classList.contains('dark-mode')) {
                newThemeIcon.classList.remove('fa-moon');
                newThemeIcon.classList.add('fa-sun');
            } else {
                newThemeIcon.classList.remove('fa-sun');
                newThemeIcon.classList.add('fa-moon');
            }
        });
    }
}

        // --- Automatic Slider Logic ---
        const slider = document.getElementById('imageSlider');
if (slider) {
        let currentSlide = 0;
        const totalSlides = 3;

        setInterval(() => {
            currentSlide = (currentSlide + 1) % totalSlides;
            slider.style.transform = `translateX(-${currentSlide * 33.333}%)`;
        }, 3000);
}

        // --- Counter Animation on Scroll Logic ---
        const counters = document.querySelectorAll('.stat-number');
        let animated = false;

        function startCounters() {
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const suffix = counter.getAttribute('data-suffix') || '';
                const prefix = counter.getAttribute('data-prefix') || '';
                const speed = 200;

                let count = 0;
                const inc = target / speed;

                const updateCount = () => {
                    count += inc;
                    if (count < target) {
                        counter.innerText = prefix + Math.ceil(count) + suffix;
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = prefix + target + suffix;
                    }
                };

                updateCount();
            });
        }

        function checkScroll() {
            const section = document.getElementById('counterSection');
    if (!section) return;
    
            const sectionPos = section.getBoundingClientRect().top;
            const screenPos = window.innerHeight;

            if (sectionPos < screenPos && sectionPos > -section.offsetHeight) {
                if (!animated) {
                    startCounters();
                    animated = true;
                }
            } else {
                animated = false;
            }
        }

        window.addEventListener('scroll', checkScroll);

// --- Component Injection & Initialization ---
        document.addEventListener("DOMContentLoaded", () => {
    // Inject Header
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-container").innerHTML = data;
            // Initialize theme toggle AFTER the header has been injected into the DOM
            initThemeToggle();
        });

    // Inject Footer
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-container").innerHTML = data;
        });
});