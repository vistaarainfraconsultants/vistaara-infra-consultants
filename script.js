/* =========================================================
   VISTAARA INFRA CONSULTANTS
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   MOBILE MENU
========================================================= */

const menuToggle = document.querySelector('.menu-toggle');

const nav = document.querySelector('.nav');


if (menuToggle && nav) {

    menuToggle.addEventListener('click', () => {

        nav.classList.toggle('open');


        const isOpen =
            nav.classList.contains('open');


        menuToggle.setAttribute(
            'aria-expanded',
            isOpen
        );

    });

}


/* Close mobile menu after clicking navigation link */

document.querySelectorAll('.nav a').forEach(link => {

    link.addEventListener('click', () => {

        if (nav) {

            nav.classList.remove('open');

        }


        if (menuToggle) {

            menuToggle.setAttribute(
                'aria-expanded',
                'false'
            );

        }

    });

});



/* =========================================================
   FOOTER YEAR
========================================================= */

const yearElement =
    document.getElementById('year');


if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}



/* =========================================================
   ABOUT IMAGE SLIDESHOW
========================================================= */

const slides =
    document.querySelectorAll('.slide');


const previousButton =
    document.querySelector('.slide-prev');


const nextButton =
    document.querySelector('.slide-next');


const dots =
    document.querySelectorAll('.slide-dots button');


let currentSlide = 0;


let slideshowTimer = null;



/* =========================================================
   SHOW SLIDE
========================================================= */

function showSlide(index) {

    if (!slides.length) {

        return;

    }


    /* Keep index inside available range */

    if (index >= slides.length) {

        currentSlide = 0;

    }

    else if (index < 0) {

        currentSlide =
            slides.length - 1;

    }

    else {

        currentSlide = index;

    }


    /* Remove active from all slides */

    slides.forEach((slide) => {

        slide.classList.remove('active');

    });


    /* Activate selected slide */

    slides[currentSlide]
        .classList.add('active');


    /* Update dots */

    dots.forEach((dot, index) => {

        dot.classList.toggle(
            'active',
            index === currentSlide
        );

    });

}



/* =========================================================
   NEXT SLIDE
========================================================= */

function nextSlide() {

    showSlide(
        currentSlide + 1
    );

}



/* =========================================================
   PREVIOUS SLIDE
========================================================= */

function previousSlide() {

    showSlide(
        currentSlide - 1
    );

}



/* =========================================================
   START SLIDESHOW
========================================================= */

function startSlideshow() {

    if (slideshowTimer) {
        return;
    }

    slideshowTimer = setInterval(() => {

        nextSlide();

    }, 1500);

}



/* =========================================================
   RESTART SLIDESHOW
========================================================= */

function restartSlideshow() {

    clearInterval(
        slideshowTimer
    );


    startSlideshow();

}



/* =========================================================
   PREVIOUS BUTTON
========================================================= */

if (previousButton) {

    previousButton.addEventListener(
        'click',
        () => {

            previousSlide();

            restartSlideshow();

        }
    );

}



/* =========================================================
   NEXT BUTTON
========================================================= */

if (nextButton) {

    nextButton.addEventListener(
        'click',
        () => {

            nextSlide();

            restartSlideshow();

        }
    );

}



/* =========================================================
   DOT BUTTONS
========================================================= */

dots.forEach((dot, index) => {

    dot.addEventListener(
        'click',
        () => {

            showSlide(index);

            restartSlideshow();

        }
    );

});



/* =========================================================
   INITIALIZE SLIDESHOW
========================================================= */

if (slides.length) {

    showSlide(0);

    const slideshowObserver = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {

                    // Start sliding only when the slideshow
                    // is visible on the screen
                    if (!slideshowTimer) {
                        startSlideshow();
                    }

                } else {

                    // Stop sliding when the section is no longer visible
                    clearInterval(slideshowTimer);
                    slideshowTimer = null;

                }

            });

        },
        {
            threshold: 0.35
        }
    );

    const slideshowContainer =
        document.querySelector('.about-slideshow');

    if (slideshowContainer) {
        slideshowObserver.observe(slideshowContainer);
    }

}



/* =========================================================
   CAREER POSITION DETAILS
========================================================= */

const jobCards =
    document.querySelectorAll('.job-card');


jobCards.forEach(card => {


    const toggle =
        card.querySelector(
            '.job-details-toggle'
        );


    const details =
        card.querySelector(
            '.job-details'
        );


    if (!toggle || !details) {

        return;

    }


    toggle.addEventListener(
        'click',
        () => {

            const isOpen =
                card.classList.contains(
                    'details-open'
                );


            /* Close this position */

            if (isOpen) {

                card.classList.remove(
                    'details-open'
                );


                toggle.setAttribute(
                    'aria-expanded',
                    'false'
                );

            }


            /* Open this position */

            else {

                card.classList.add(
                    'details-open'
                );


                toggle.setAttribute(
                    'aria-expanded',
                    'true'
                );

            }

        }
    );

});



/* =========================================================
   GALLERY - 2 ROW × 4 COLUMN CAROUSEL
========================================================= */

const galleryGrid =
    document.getElementById('gallery-grid');

const galleryEmpty =
    document.getElementById('gallery-empty');

const galleryPrevious =
    document.querySelector('.gallery-prev');

const galleryNext =
    document.querySelector('.gallery-next');


if (galleryGrid) {

    const galleryExtensions = [
        'jpg',
        'jpeg',
        'png',
        'webp'
    ];

    const galleryMaximum = 50;

    let galleryImages = [];

    let galleryStart = 0;

    let galleryTimer = null;


    /* =====================================================
       CHECK GALLERY IMAGE
    ===================================================== */

    function checkGalleryImage(number, extension) {

        const imagePath =
            `images/Gallery ${String(number).padStart(2, '0')}.${extension}`;

        const image = new Image();


        image.onload = function () {

            /* Prevent duplicate image numbers */

            if (
                galleryImages.some(
                    item => item.number === number
                )
            ) {
                return;
            }


            galleryImages.push({

                number: number,

                path: imagePath

            });


            /* Keep images in numerical order */

            galleryImages.sort(
                (a, b) => a.number - b.number
            );


            /* Hide empty message */

            if (galleryEmpty) {

                galleryEmpty.style.display = 'none';

            }


            buildGallery();

        };


        image.onerror = function () {

            /* Image does not exist - ignore */

        };


        image.src = imagePath;

    }



    /* =====================================================
       BUILD GALLERY
    ===================================================== */

    function buildGallery() {

        galleryGrid.innerHTML = '';


        if (galleryImages.length === 0) {

            return;

        }


        /*
           Create exactly 8 images.

           Example:

           Start = 0

           01 02 03 04
           05 06 07 08

           Start = 1

           02 03 04 05
           06 07 08 09

           Start = 2

           03 04 05 06
           07 08 09 10
        */


        for (let i = 0; i < 8; i++) {

            /*
               Circular gallery.

               If we reach the last image,
               continue again from Gallery 01.
            */

            const imageIndex =
                (galleryStart + i) %
                galleryImages.length;


            const item =
                galleryImages[imageIndex];


            createGalleryItem(item);

        }

    }



    /* =====================================================
       CREATE IMAGE
    ===================================================== */

    function createGalleryItem(item) {

        const galleryItem =
            document.createElement('div');


        galleryItem.className =
            'gallery-item';


        const galleryImage =
            document.createElement('img');


        galleryImage.src =
            item.path;


        galleryImage.alt =
            `Vistaara Infra Consultants Gallery ${item.number}`;


        galleryImage.loading =
            'lazy';


        galleryItem.appendChild(
            galleryImage
        );


        galleryGrid.appendChild(
            galleryItem
        );

    }



    /* =====================================================
       NEXT GALLERY
    ===================================================== */

    function nextGallery() {

        if (galleryImages.length === 0) {

            return;

        }


        /*
           Move forward by ONE image
        */

        galleryStart =
            (galleryStart + 1)
            %
            galleryImages.length;


        buildGallery();

    }



    /* =====================================================
       PREVIOUS GALLERY
    ===================================================== */

    function previousGallery() {

        if (galleryImages.length === 0) {

            return;

        }


        /*
           Move backward by ONE image
        */

        galleryStart =
            (
                galleryStart -
                1 +
                galleryImages.length
            )
            %
            galleryImages.length;


        buildGallery();

    }



    /* =====================================================
       AUTOMATIC ROTATION
    ===================================================== */

    function startGalleryRotation() {

        clearInterval(
            galleryTimer
        );


        if (galleryImages.length <= 8) {

            return;

        }


        galleryTimer =
            setInterval(
                () => {

                    nextGallery();

                },
                4000
            );

    }



    /* =====================================================
       NEXT BUTTON
    ===================================================== */

    if (galleryNext) {

        galleryNext.addEventListener(
            'click',
            () => {

                nextGallery();

                startGalleryRotation();

            }
        );

    }



    /* =====================================================
       PREVIOUS BUTTON
    ===================================================== */

    if (galleryPrevious) {

        galleryPrevious.addEventListener(
            'click',
            () => {

                previousGallery();

                startGalleryRotation();

            }
        );

    }



    /* =====================================================
       LOAD GALLERY 01 → 50
    ===================================================== */

    for (
        let number = 1;
        number <= galleryMaximum;
        number++
    ) {

        galleryExtensions.forEach(
            extension => {

                checkGalleryImage(
                    number,
                    extension
                );

            }
        );

    }



    /* =====================================================
       START AUTOMATIC ROTATION
    ===================================================== */

    /*
       Give the images a moment to load,
       then start automatic rotation.
    */

    setTimeout(
        () => {

            startGalleryRotation();

        },
        1000
    );

}


/* =========================================================
   END OF GALLERY
========================================================= */

