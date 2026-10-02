/* =========================================================
   VISTAARA INFRA CONSULTANTS
   DYNAMIC WEBSITE SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    const VISTAARA_REPOSITORY = {
        owner: "vistaarainfraconsultants",
        repo: "vistaara-infra-consultants",
        branch: "main",
        folder: "images"
    };

    const IMAGE_EXTENSIONS = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif",
        "avif"
    ];

    const VIDEO_EXTENSIONS = [
        "mp4",
        "webm",
        "ogg",
        "m4v",
        "mov"
    ];


/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle =
    document.querySelector(".menu-toggle");

const navMenu =
    document.querySelector(".nav");

if (menuToggle && navMenu) {

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    menuToggle.addEventListener(
        "click",
        () => {

            const isOpen =
                navMenu.classList.toggle(
                    "active"
                );

            menuToggle.classList.toggle(
                "active",
                isOpen
            );

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );


    /* Close menu when a navigation link is clicked */

    navMenu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    navMenu.classList.remove(
                        "active"
                    );

                    menuToggle.classList.remove(
                        "active"
                    );

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });

}




    /* =====================================================
       FOOTER YEAR
    ===================================================== */

    const yearElement =
        document.getElementById("current-year");

    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       GET ALL MEDIA FROM GITHUB
    ===================================================== */

    async function getRepositoryMedia() {

        const apiURL =
            `https://api.github.com/repos/` +
            `${VISTAARA_REPOSITORY.owner}/` +
            `${VISTAARA_REPOSITORY.repo}/contents/` +
            `${VISTAARA_REPOSITORY.folder}?ref=` +
            `${VISTAARA_REPOSITORY.branch}`;

        try {

            const response =
                await fetch(apiURL, {
                    headers: {
                        "Accept":
                            "application/vnd.github+json"
                    }
                });


            if (!response.ok) {

                throw new Error(
                    `GitHub API error: ${response.status}`
                );

            }


            const files =
                await response.json();


            if (!Array.isArray(files)) {

                return [];

            }


            return files.filter(file =>
                file &&
                file.type === "file" &&
                file.name
            );


        } catch (error) {

            console.error(
                "Unable to load media from GitHub:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       HELPER FUNCTIONS
    ===================================================== */

    function getFileExtension(filename) {

        const parts =
            filename.split(".");

        if (parts.length < 2) {

            return "";

        }

        return parts
            .pop()
            .toLowerCase();

    }


    function isImage(filename) {

        return IMAGE_EXTENSIONS.includes(
            getFileExtension(filename)
        );

    }


    function isVideo(filename) {

        return VIDEO_EXTENSIONS.includes(
            getFileExtension(filename)
        );

    }


    function getFileNameWithoutExtension(filename) {

        return filename.replace(
            /\.[^/.]+$/,
            ""
        );

    }


    function normaliseText(text) {

        return text
            .toLowerCase()
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

    }


    /* =====================================================
       ABOUT US
       DYNAMIC PHOTO SLIDESHOW

       Automatically detects:
       - Project Discussion
       - Team Photo
    ===================================================== */

    async function initialiseAboutPhotos(files) {

        const slideshow =
            document.getElementById(
                "about-photo-slideshow"
            );


        const emptyMessage =
            document.getElementById(
                "about-photo-empty"
            );


        const dotsContainer =
            document.getElementById(
                "about-photo-dots"
            );


        if (!slideshow) {

            return;

        }


        const aboutPhotos =
            files
                .filter(file => {

                    if (!isImage(file.name)) {

                        return false;

                    }


                    const name =
                        normaliseText(file.name);


                    return (
                        name.includes(
                            "project discussion"
                        ) ||
                        name.includes(
                            "team photo"
                        )
                    );

                })
                .sort((a, b) =>
                    a.name.localeCompare(
                        b.name,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    )
                );


        slideshow
            .querySelectorAll(
                ".slide.dynamic-slide"
            )
            .forEach(slide =>
                slide.remove()
            );


        if (dotsContainer) {

            dotsContainer.innerHTML = "";

        }


        if (aboutPhotos.length === 0) {

            if (emptyMessage) {

                emptyMessage.style.display =
                    "block";

            }

            return;

        }


        if (emptyMessage) {

            emptyMessage.style.display =
                "none";

        }


        const previousButton =
            slideshow.querySelector(
                ".slide-prev"
            );


        const nextButton =
            slideshow.querySelector(
                ".slide-next"
            );


        aboutPhotos.forEach(
            (file, index) => {

                const slide =
                    document.createElement(
                        "div"
                    );


                slide.className =
                    "slide dynamic-slide";


                if (index === 0) {

                    slide.classList.add(
                        "active"
                    );

                }


                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    file.download_url;


                image.alt =
                    getFileNameWithoutExtension(
                        file.name
                    );


                image.loading =
                    index === 0
                        ? "eager"
                        : "lazy";


                slide.appendChild(image);


                if (nextButton) {

                    slideshow.insertBefore(
                        slide,
                        nextButton
                    );

                } else {

                    slideshow.appendChild(
                        slide
                    );

                }


                if (dotsContainer) {

                    const dot =
                        document.createElement(
                            "button"
                        );


                    dot.type = "button";


                    dot.className =
                        "about-dot";


                    if (index === 0) {

                        dot.classList.add(
                            "active"
                        );

                    }


                    dot.setAttribute(
                        "aria-label",
                        `Show About photo ${index + 1}`
                    );


                    dot.addEventListener(
                        "click",
                        () => {

                            showAboutPhoto(
                                index
                            );

                            /*
                             * If the section is currently
                             * visible, restart its timer.
                             */

                            if (
                                aboutPhotosVisible
                            ) {

                                restartAboutTimer();

                            }

                        }
                    );


                    dotsContainer.appendChild(
                        dot
                    );

                }

            }
        );


        let currentIndex = 0;

        let autoTimer = null;

        let aboutPhotosVisible = false;


        /* =================================================
           GET SLIDES
        ================================================= */

        function getSlides() {

            return Array.from(
                slideshow.querySelectorAll(
                    ".dynamic-slide"
                )
            );

        }


        /* =================================================
           UPDATE DOTS
        ================================================= */

        function updateDots(index) {

            if (!dotsContainer) {

                return;

            }


            dotsContainer
                .querySelectorAll(
                    ".about-dot"
                )
                .forEach(
                    (dot, dotIndex) => {

                        dot.classList.toggle(
                            "active",
                            dotIndex === index
                        );

                    }
                );

        }


        /* =================================================
           SHOW PHOTO
        ================================================= */

        function showAboutPhoto(index) {

            const slides =
                getSlides();


            if (!slides.length) {

                return;

            }


            currentIndex =
                (
                    index +
                    slides.length
                ) %
                slides.length;


            slides.forEach(
                (slide, slideIndex) => {

                    slide.classList.toggle(
                        "active",
                        slideIndex ===
                            currentIndex
                    );

                }
            );


            updateDots(
                currentIndex
            );

        }


        /* =================================================
           PHOTO TIMER
           
           Timer ONLY runs while the section
           is visible on screen.
        ================================================= */

        function startAboutTimer() {

            if (
                aboutPhotos.length <= 1
            ) {

                return;

            }


            if (!aboutPhotosVisible) {

                return;

            }


            clearInterval(
                autoTimer
            );


            autoTimer =
                setInterval(
                    () => {

                        if (
                            !aboutPhotosVisible
                        ) {

                            return;

                        }


                        showAboutPhoto(
                            currentIndex + 1
                        );

                    },
                    4000
                );

        }


        function stopAboutTimer() {

            clearInterval(
                autoTimer
            );

            autoTimer = null;

        }


        function restartAboutTimer() {

            stopAboutTimer();

            startAboutTimer();

        }


        /* =================================================
           PREVIOUS BUTTON
        ================================================= */

        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {

                    showAboutPhoto(
                        currentIndex - 1
                    );


                    if (
                        aboutPhotosVisible
                    ) {

                        restartAboutTimer();

                    }

                }
            );

        }


        /* =================================================
           NEXT BUTTON
        ================================================= */

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    showAboutPhoto(
                        currentIndex + 1
                    );


                    if (
                        aboutPhotosVisible
                    ) {

                        restartAboutTimer();

                    }

                }
            );

        }


        /* =================================================
           INTERSECTION OBSERVER

           Photo slideshow starts only when
           viewer reaches this section.
        ================================================= */

        const photoObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            aboutPhotosVisible =
                                true;


                            startAboutTimer();


                        } else {

                            aboutPhotosVisible =
                                false;


                            stopAboutTimer();

                        }

                    });

                },
                {
                    threshold: 0.25
                }
            );


        photoObserver.observe(
            slideshow
        );

    }


    /* =====================================================
       ABOUT US
       DYNAMIC VIDEO SLIDER

       Automatically detects filenames containing:
       "Video"
    ===================================================== */

    async function initialiseAboutVideos(files) {

        const videoSlider =
            document.getElementById(
                "about-video-slider"
            );


        const videoPlayer =
            document.getElementById(
                "about-video-player"
            );


        const emptyMessage =
            document.getElementById(
                "about-video-empty"
            );


        const previousButton =
            document.querySelector(
                ".video-prev"
            );


        const nextButton =
            document.querySelector(
                ".video-next"
            );


        const caption =
            document.getElementById(
                "about-video-caption"
            );


        if (
            !videoSlider ||
            !videoPlayer
        ) {

            return;

        }


        const videos =
            files
                .filter(file => {

                    if (!isVideo(file.name)) {

                        return false;

                    }


                    return normaliseText(
                        file.name
                    ).includes(
                        "video"
                    );

                })
                .sort((a, b) =>
                    a.name.localeCompare(
                        b.name,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    )
                );


        if (videos.length === 0) {

            if (emptyMessage) {

                emptyMessage.style.display =
                    "block";

            }


            videoSlider.style.display =
                "none";


            return;

        }


        if (emptyMessage) {

            emptyMessage.style.display =
                "none";

        }


        videoSlider.style.display =
            "block";


        let currentIndex = 0;

        let videoTimer = null;

        let videoSectionVisible = false;


        /* =================================================
           VIDEO SLIDE TIME

           Change this value if required.

           8000 = 8 seconds
        ================================================= */

        const VIDEO_SLIDE_INTERVAL =
            8000;


        /* =================================================
           SHOW VIDEO
        ================================================= */

        function showVideo(
            index,
            shouldPlay = false
        ) {

            currentIndex =
                (
                    index +
                    videos.length
                ) %
                videos.length;


            const video =
                videos[currentIndex];


            videoPlayer.pause();


            videoPlayer.removeAttribute(
                "src"
            );


            videoPlayer.src =
                video.download_url;


            videoPlayer.load();


            videoPlayer.classList.add(
                "video-ready"
            );


            if (caption) {

                caption.textContent =
                    getFileNameWithoutExtension(
                        video.name
                    );

            }


            /*
             * Play ONLY when the video section
             * is actually visible.
             */

            if (
                shouldPlay &&
                videoSectionVisible
            ) {

                const playPromise =
                    videoPlayer.play();


                if (
                    playPromise &&
                    typeof playPromise.catch ===
                        "function"
                ) {

                    playPromise.catch(() => {

                        /*
                         * Browser may block
                         * autoplay when sound
                         * is enabled.
                         */

                    });

                }

            }

        }


        /* =================================================
           START VIDEO SLIDING
        ================================================= */

        function startVideoSlider() {

            if (
                videos.length <= 1
            ) {

                /*
                 * Still play the video if
                 * the section is visible.
                 */

                if (
                    videoSectionVisible
                ) {

                    const playPromise =
                        videoPlayer.play();


                    if (
                        playPromise &&
                        typeof playPromise.catch ===
                            "function"
                    ) {

                        playPromise.catch(
                            () => {}
                        );

                    }

                }

                return;

            }


            if (
                !videoSectionVisible
            ) {

                return;

            }


            clearInterval(
                videoTimer
            );


            videoTimer =
                setInterval(
                    () => {

                        if (
                            !videoSectionVisible
                        ) {

                            return;

                        }


                        showVideo(
                            currentIndex + 1,
                            true
                        );

                    },
                    VIDEO_SLIDE_INTERVAL
                );


            /*
             * Start playing current video.
             */

            const playPromise =
                videoPlayer.play();


            if (
                playPromise &&
                typeof playPromise.catch ===
                    "function"
            ) {

                playPromise.catch(
                    () => {}
                );

            }

        }


        /* =================================================
           STOP VIDEO SLIDING
        ================================================= */

        function stopVideoSlider() {

            clearInterval(
                videoTimer
            );

            videoTimer = null;


            /*
             * Pause video when section
             * is no longer visible.
             */

            videoPlayer.pause();

        }


        /* =================================================
           PREVIOUS BUTTON
        ================================================= */

        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {

                    showVideo(
                        currentIndex - 1,
                        videoSectionVisible
                    );


                    if (
                        videoSectionVisible
                    ) {

                        startVideoSlider();

                    }

                }
            );

        }


        /* =================================================
           NEXT BUTTON
        ================================================= */

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    showVideo(
                        currentIndex + 1,
                        videoSectionVisible
                    );


                    if (
                        videoSectionVisible
                    ) {

                        startVideoSlider();

                    }

                }
            );

        }


        /* =================================================
           WHEN VIDEO FINISHES

           Immediately move to the next video
           if the viewer is still looking at
           the video section.
        ================================================= */

        videoPlayer.addEventListener(
            "ended",
            () => {

                if (
                    videoSectionVisible &&
                    videos.length > 1
                ) {

                    showVideo(
                        currentIndex + 1,
                        true
                    );

                }

            }
        );


        /* =================================================
           INTERSECTION OBSERVER

           Video starts only when the viewer
           reaches the video section.
        ================================================= */

        const videoObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            videoSectionVisible =
                                true;


                            startVideoSlider();


                        } else {

                            videoSectionVisible =
                                false;


                            stopVideoSlider();

                        }

                    });

                },
                {
                    threshold: 0.25
                }
            );


        videoObserver.observe(
            videoSlider
        );


        /* =================================================
           INITIAL VIDEO

           Load video but DO NOT autoplay yet.
           It will start when visible.
        ================================================= */

        showVideo(
            0,
            false
        );

    }


    /* =====================================================
       ADDITIONAL PROJECTS
    ===================================================== */

    const additionalProjects = [

        {
            code: "Highway Project",
            name:
                "NH-75 Mulbagal – Andhra Pradesh / Karnataka Border"
        },

        {
            code: "Bridge Project",
            name:
                "NH-766 Bridge Reconstruction with Realignment"
        },

        {
            code: "Bypass Project",
            name:
                "Tumakuru Bypass – NH-48 Phase 1"
        },

        {
            code: "Bypass Project",
            name:
                "Chintamani Bypass"
        },

        {
            code: "Urban Infrastructure",
            name:
                "Bengaluru ORR – KR Puram to Silk Board"
        }

    ];


    function initialiseAdditionalProjects() {

        const list =
            document.getElementById(
                "more-projects-list"
            );


        const toggle =
            document.querySelector(
                ".more-projects-toggle"
            );


        const arrow =
            document.querySelector(
                ".more-projects-arrow"
            );


        if (!list || !toggle) {

            return;

        }


        list.innerHTML = "";


        additionalProjects.forEach(
            project => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "more-project-item";


                const code =
                    document.createElement(
                        "span"
                    );


                code.className =
                    "more-project-code";


                code.textContent =
                    project.code;


                const name =
                    document.createElement(
                        "span"
                    );


                name.className =
                    "more-project-name";


                name.textContent =
                    project.name;


                item.appendChild(code);

                item.appendChild(name);

                list.appendChild(item);

            }
        );


        toggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    list.classList.toggle(
                        "active"
                    );


                toggle.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                if (arrow) {

                    arrow.classList.toggle(
                        "active",
                        isOpen
                    );

                }

            }
        );

    }


    /* =====================================================
       EMPLOYEE CAROUSEL
    ===================================================== */

    function parseEmployeeFile(file) {

        const filename =
            getFileNameWithoutExtension(
                file.name
            );


        const match =
            filename.match(
                /^Employee[_\s-]*(\d+)[_\-\s]+(.+)$/i
            );


        if (!match) {

            return null;

        }


        const number =
            parseInt(
                match[1],
                10
            );


        const remainder =
            match[2].trim();


        const parts =
            remainder
                .split("_")
                .map(part => part.trim())
                .filter(Boolean);


        if (!parts.length) {

            return null;

        }


        const name =
            parts.shift();


        const designation =
            parts.join(" ") ||
            "Team Member";


        return {
            number,
            name,
            designation,
            file
        };

    }


    async function initialiseEmployeeCarousel(files) {

        const carousel =
            document.getElementById(
                "employee-carousel"
            );


        const emptyMessage =
            document.getElementById(
                "employee-empty"
            );


        const previousButton =
            document.querySelector(
                ".employee-prev"
            );


        const nextButton =
            document.querySelector(
                ".employee-next"
            );


        if (!carousel) {

            return;

        }


        const employees =
            files
                .filter(file =>
                    isImage(file.name)
                )
                .map(parseEmployeeFile)
                .filter(Boolean)
                .sort(
                    (a, b) =>
                        a.number - b.number
                );


        if (!employees.length) {

            if (emptyMessage) {

                emptyMessage.style.display =
                    "block";

            }

            return;

        }


        if (emptyMessage) {

            emptyMessage.style.display =
                "none";

        }


        let currentStart = 0;


        function getVisibleCount() {

            const width =
                window.innerWidth;


            if (width <= 600) {

                return 1;

            }


            if (width <= 950) {

                return 2;

            }


            return 4;

        }


        function renderEmployees() {

            carousel.innerHTML = "";


            const visibleCount =
                Math.min(
                    getVisibleCount(),
                    employees.length
                );


            for (
                let i = 0;
                i < visibleCount;
                i++
            ) {

                const employee =
                    employees[
                        (
                            currentStart +
                            i
                        ) %
                        employees.length
                    ];


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "employee-card";


                const imageWrapper =
                    document.createElement(
                        "div"
                    );


                imageWrapper.className =
                    "employee-photo";


                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    employee.file.download_url;


                image.alt =
                    `${employee.name} - ${employee.designation}`;


                image.loading =
                    "lazy";


                imageWrapper.appendChild(
                    image
                );


                const info =
                    document.createElement(
                        "div"
                    );


                info.className =
                    "employee-info";


                const number =
                    document.createElement(
                        "span"
                    );


                number.className =
                    "employee-number";


                number.textContent =
                    String(
                        employee.number
                    ).padStart(
                        2,
                        "0"
                    );


                const name =
                    document.createElement(
                        "h4"
                    );


                name.textContent =
                    employee.name;


                const designation =
                    document.createElement(
                        "p"
                    );


                designation.textContent =
                    employee.designation;


                info.appendChild(number);

                info.appendChild(name);

                info.appendChild(
                    designation
                );


                card.appendChild(
                    imageWrapper
                );


                card.appendChild(info);


                carousel.appendChild(card);

            }

        }


        function moveEmployee(direction) {

            if (
                employees.length <= 1
            ) {

                return;

            }


            currentStart =
                (
                    currentStart +
                    direction +
                    employees.length
                ) %
                employees.length;


            renderEmployees();

        }


        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {

                    moveEmployee(-1);

                }
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    moveEmployee(1);

                }
            );

        }


        let resizeTimer = null;


        window.addEventListener(
            "resize",
            () => {

                clearTimeout(
                    resizeTimer
                );


                resizeTimer =
                    setTimeout(
                        () => {

                            renderEmployees();

                        },
                        150
                    );

            }
        );


        renderEmployees();


        /*
         * Automatic circular movement.
         */

        if (
            employees.length > 4
        ) {

            setInterval(
                () => {

                    moveEmployee(1);

                },
                5000
            );

        }

    }



/* =====================================================
   CAREERS / JOB CARD TOGGLE
===================================================== */

document
    .querySelectorAll(".job-details-toggle")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const card =
                    button.closest(
                        ".job-card"
                    );


                if (!card) {

                    return;

                }


                const status =
                    card.querySelector(
                        ".job-status"
                    );


                const details =
                    card.querySelector(
                        ".job-details"
                    );


                if (!status || !details) {

                    return;

                }


                /* =================================================
                   CLOSED POSITION

                   If the position is CLOSED,
                   clicking + does nothing.
                ================================================= */

                if (
                    status.classList.contains(
                        "closed"
                    )
                ) {

                    return;

                }


                /* =================================================
                   OPEN POSITION

                   Toggle details-open class on the job card.
                ================================================= */

                const isOpen =
                    card.classList.toggle(
                        "details-open"
                    );


                button.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                /* =================================================
                   CHANGE + / − SYMBOL
                ================================================= */

                const arrow =
                    button.querySelector(
                        ".job-arrow"
                    );


                if (arrow) {

                    arrow.textContent =
                        isOpen
                            ? "−"
                            : "+";

                }

            }
        );

    });


    /* =====================================================
       GALLERY
       
       Automatically detects:
       Gallery 01.jpg
       Gallery 02.png
       Gallery 03.webp
       etc.
    ===================================================== */

    async function initialiseGallery(files) {

        const galleryGrid =
            document.getElementById(
                "gallery-grid"
            );

        const galleryEmpty = 
            document.getElementById( 
                "gallery-empty" 
        );

        const previousButton =
            document.querySelector(
                ".gallery-prev"
            );


        const nextButton =
            document.querySelector(
                ".gallery-next"
            );


        if (!galleryGrid) {

            return;

        }


        const galleryFiles =
            files
                .filter(file => {

                    if (!isImage(file.name)) {

                        return false;

                    }


                    return normaliseText(
                        file.name
                    ).startsWith(
                        "gallery"
                    );

                })
                .sort(
                    (a, b) =>
                        a.name.localeCompare(
                            b.name,
                            undefined,
                            {
                                numeric: true,
                                sensitivity: "base"
                            }
                        )
                );



    /* =================================================
       NO GALLERY IMAGES
    ================================================= */

    if (!galleryFiles.length) {

        galleryGrid.innerHTML =
            "";


        if (galleryEmpty) {

            galleryEmpty.style.display =
                "block";

        }


        return;

    }


    /* =================================================
       GALLERY IMAGES FOUND

       Hide the "Gallery images will appear here"
       message.
    ================================================= */

    if (galleryEmpty) {

        galleryEmpty.style.display =
            "none";

    }


        let currentStart = 0;

        const visibleCount = 6;


        function renderGallery() {

            galleryGrid.innerHTML =
                "";


            const count =
                Math.min(
                    visibleCount,
                    galleryFiles.length
                );


            for (
                let i = 0;
                i < count;
                i++
            ) {

                const file =
                    galleryFiles[
                        (
                            currentStart +
                            i
                        ) %
                        galleryFiles.length
                    ];


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "gallery-item";


                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    file.download_url;


                image.alt =
                    getFileNameWithoutExtension(
                        file.name
                    );


                image.loading =
                    i < 2
                        ? "eager"
                        : "lazy";


                item.appendChild(
                    image
                );


                galleryGrid.appendChild(
                    item
                );

            }

        }


        function moveGallery(direction) {

            if (
                galleryFiles.length <=
                visibleCount
            ) {

                return;

            }


            currentStart =
                (
                    currentStart +
                    direction +
                    galleryFiles.length
                ) %
                galleryFiles.length;


            renderGallery();

        }


        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {

                    moveGallery(-1);

                }
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    moveGallery(1);

                }
            );

        }


        renderGallery();


        if (
            galleryFiles.length >
            visibleCount
        ) {

            setInterval(
                () => {

                    moveGallery(1);

                },
                4000
            );

        }

    }


    /* =====================================================
       INITIALISE ALL DYNAMIC MEDIA
    ===================================================== */

    async function initialiseDynamicContent() {

        const files =
            await getRepositoryMedia();


        if (!files.length) {

            console.warn(
                "No repository media found."
            );

            return;

        }


        await initialiseAboutPhotos(
            files
        );


        await initialiseAboutVideos(
            files
        );


        await initialiseEmployeeCarousel(
            files
        );


        await initialiseGallery(
            files
        );

    }


    /* =====================================================
       INITIALISE STATIC COMPONENTS
    ===================================================== */

    initialiseAdditionalProjects();


    /* =====================================================
       START DYNAMIC COMPONENTS
    ===================================================== */

    initialiseDynamicContent();


    /* =====================================================
       PAGE VISIBILITY

       If the browser tab itself is hidden,
       stop video playback.
    ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            const video =
                document.getElementById(
                    "about-video-player"
                );


            if (!video) {

                return;

            }


            if (document.hidden) {

                video.pause();

            }

        }
    );

});