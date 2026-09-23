/* =========================================================
   MOBILE MENU
   ========================================================= */

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {

    menuToggle.addEventListener('click', () => {

        nav.classList.toggle('open');

    });

}


/* Close mobile menu after clicking a navigation link */

document.querySelectorAll('.nav a').forEach(link => {

    link.addEventListener('click', () => {

        if (nav) {
            nav.classList.remove('open');
        }

    });

});


/* =========================================================
   FOOTER YEAR
   ========================================================= */

const yearElement = document.getElementById('year');

if (yearElement) {

    yearElement.textContent = new Date().getFullYear();

}


/* =========================================================
   ABOUT IMAGE SLIDESHOW
   ========================================================= */

const slides = document.querySelectorAll('.slide');

const previousButton = document.querySelector('.slide-prev');

const nextButton = document.querySelector('.slide-next');

const dots = document.querySelectorAll('.slide-dots button');


let currentSlide = 0;


/* ---------------------------------------------------------
   SHOW SLIDE
   --------------------------------------------------------- */

function showSlide(index) {

    if (!slides.length) {
        return;
    }


    /* Keep index inside available range */

    if (index >= slides.length) {

        currentSlide = 0;

    } else if (index < 0) {

        currentSlide = slides.length - 1;

    } else {

        currentSlide = index;

    }


    /* Remove active class from every slide */

    slides.forEach((slide) => {

        slide.classList.remove('active');

    });


    /* Add active class to current slide */

    slides[currentSlide].classList.add('active');


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

    showSlide(currentSlide + 1);

}


/* =========================================================
   PREVIOUS SLIDE
   ========================================================= */

function previousSlide() {

    showSlide(currentSlide - 1);

}


/* =========================================================
   PREVIOUS BUTTON
   ========================================================= */

if (previousButton) {

    previousButton.addEventListener(
        'click',
        previousSlide
    );

}


/* =========================================================
   NEXT BUTTON
   ========================================================= */

if (nextButton) {

    nextButton.addEventListener(
        'click',
        nextSlide
    );

}


/* =========================================================
   DOT BUTTONS
   ========================================================= */

dots.forEach((dot, index) => {

    dot.addEventListener('click', () => {

        showSlide(index);

        restartSlideshow();

    });

});


/* =========================================================
   AUTOMATIC SLIDESHOW
   Changes every 1 second
   ========================================================= */

let slideshowTimer;


function startSlideshow() {

    slideshowTimer = setInterval(() => {

        nextSlide();

    }, 2500);

}


/* =========================================================
   RESTART AUTOMATIC SLIDESHOW
   Used after Previous / Next / Dot click
   ========================================================= */

function restartSlideshow() {

    clearInterval(slideshowTimer);

    startSlideshow();

}


/* Restart timer when manually using Previous */

if (previousButton) {

    previousButton.addEventListener(
        'click',
        restartSlideshow
    );

}


/* Restart timer when manually using Next */

if (nextButton) {

    nextButton.addEventListener(
        'click',
        restartSlideshow
    );

}


/* =========================================================
   INITIALIZE SLIDESHOW
   ========================================================= */

if (slides.length) {

    showSlide(0);

    startSlideshow();

}