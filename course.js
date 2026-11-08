// --- Light / Dark Mode Toggle Logic ---
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

if (themeToggleBtn && themeIcon) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    });
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


// --- IIT Bombay Certificate Path Scroll Animation ---
const certificatePath = document.getElementById('certificatePath');

if (certificatePath) {
    const certificateSteps =
        certificatePath.querySelectorAll('.certificate-step');

    const certificateProgress =
        document.getElementById('certificateProgressBar');

    let certificateAnimated = false;

    // Reset the steps before animation
    const resetCertificatePath = () => {
        certificateSteps.forEach((step, index) => {
            step.classList.toggle('active', index === 0);
        });

        if (certificateProgress) {
            certificateProgress.style.width = '0%';
        }
    };

    // Animate steps: 1 → 2 → 3 → 4
    const animateCertificatePath = () => {
        if (certificateAnimated) return;

        certificateAnimated = true;

        resetCertificatePath();

        certificateSteps.forEach((step, index) => {
            setTimeout(() => {
                step.classList.add('active');

                // Update progress line
                if (certificateProgress) {
                    const progress =
                        ((index + 1) / certificateSteps.length) * 100;

                    certificateProgress.style.width = `${progress}%`;
                }
            }, index * 700);
        });
    };

    // Start animation when section enters the viewport
    const certificateObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCertificatePath();
                }
            });
        },
        {
            threshold: 0.35
        }
    );

    certificateObserver.observe(certificatePath);
}