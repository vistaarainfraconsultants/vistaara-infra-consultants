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

    if (!slides.length) {

        return;

    }


    clearInterval(
        slideshowTimer
    );


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

    startSlideshow();

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
   GALLERY
========================================================= */

/*
   IMPORTANT:

   Put gallery images inside:

   images/

   Use names such as:

   Gallery 01.jpg
   Gallery 02.jpg
   Gallery 03.jpeg
   Gallery 04.png
   Gallery 05.webp

   The script checks Gallery 01 to Gallery 50.

   Missing files are automatically ignored.
*/


const galleryGrid =
    document.getElementById(
        'gallery-grid'
    );


const galleryEmpty =
    document.getElementById(
        'gallery-empty'
    );



if (galleryGrid) {


    const galleryExtensions = [
        'jpg',
        'jpeg',
        'png',
        'webp'
    ];


    const galleryMaximum =
        50;


    let galleryFound = 0;



    /*
       Create image element
       after checking whether
       the file actually exists.
    */

    function checkGalleryImage(
        number,
        extension
    ) {

        const imagePath =
            `images/Gallery ${String(number).padStart(2, '0')}.${extension}`;


        const image =
            new Image();


        image.onload = function () {

            /* Prevent duplicate image numbers */

            if (
                document.querySelector(
                    `[data-gallery-number="${number}"]`
                )
            ) {

                return;

            }


            const galleryItem =
                document.createElement(
                    'div'
                );


            galleryItem.className =
                'gallery-item';


            galleryItem.setAttribute(
                'data-gallery-number',
                number
            );


            const galleryImage =
                document.createElement(
                    'img'
                );


            galleryImage.src =
                imagePath;


            galleryImage.alt =
                `Vistaara Infra Consultants Gallery ${number}`;


            galleryImage.loading =
                'lazy';


            galleryItem.appendChild(
                galleryImage
            );


            galleryGrid.appendChild(
                galleryItem
            );


            galleryFound++;


            if (galleryEmpty) {

                galleryEmpty.style.display =
                    'none';

            }

        };


        /*
           If the file doesn't exist,
           nothing is added.
        */

        image.onerror = function () {

            /* Do nothing */

        };


        image.src =
            imagePath;

    }



    /*
       Check Gallery 01 to Gallery 50
    */

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

}



/* =========================================================
   END OF SCRIPT
========================================================= */