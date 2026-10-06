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
                        "open"
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
                            "open"
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
        document.getElementById("year");

    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       GET ALL MEDIA FROM GITHUB

       The repository tree is used instead of the /contents/images
       endpoint. This avoids repeated GitHub API calls and makes the
       filename-based media system much more reliable.
    ===================================================== */

    async function getRepositoryMedia(treeOverride = null) {

        const tree =
            treeOverride || await getRepositoryTree();

        if (!tree.length) {
            return [];
        }

        return tree
            .filter(file =>
                file.path &&
                file.path.toLowerCase().startsWith("images/") &&
                file.path.split("/").length === 2 &&
                file.name
            )
            .map(file => ({
                ...file,
                download_url:
                    getRawRepositoryUrl(file.path)
            }));

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

        let videoSectionVisible = false;

        /*
         * Videos advance only from the `ended` event below.
         * There is deliberately NO fixed-duration timer here,
         * so a 5-second, 30-second or 5-minute video always
         * gets its complete playback time.
         */


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
           START VIDEO PLAYBACK

           Start only while the video section is visible.
           The next video is selected by the `ended` event,
           never by a fixed timer.
        ================================================= */

        function startVideoSlider() {

            if (!videoSectionVisible) {

                return;

            }

            const playPromise =
                videoPlayer.play();

            if (
                playPromise &&
                typeof playPromise.catch ===
                    "function"
            ) {

                playPromise.catch(() => {});

            }

        }


        /* =================================================
           STOP VIDEO PLAYBACK

           Pause when the viewer leaves the section.
           The current video remains loaded so it can
           continue when the section becomes visible again.
        ================================================= */

        function stopVideoSlider() {

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
                    videoSectionVisible
                ) {

                    if (videos.length > 1) {

                        showVideo(
                            currentIndex + 1,
                            true
                        );

                    }

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
       PROJECTS - GITHUB DATA

       Uses ONE GitHub tree request instead of many
       /contents/ requests. This is much more reliable
       on GitHub Pages and greatly reduces API rate-limit use.

       Folder structure:
       /projects/<project-folder>/project.json
       /projects/<project-folder>/cover.jpg
    ===================================================== */

    const VISTAARA_PROJECTS = {
        folder: "projects",
        cacheKey: "vistaara-project-tree-v2",
        cacheDuration: 2 * 60 * 1000
    };


    function getRawRepositoryUrl(path) {

        return (
            "https://raw.githubusercontent.com/" +
            "vistaarainfraconsultants/vistaara-infra-consultants/" +
            "main/" +
            path
                .split("/")
                .map(encodeURIComponent)
                .join("/")
        );

    }


    function getCachedRepositoryTree() {

        try {

            const raw =
                localStorage.getItem(
                    VISTAARA_PROJECTS.cacheKey
                );

            if (!raw) {
                return null;
            }

            const cached = JSON.parse(raw);

            if (
                !cached ||
                !cached.timestamp ||
                !Array.isArray(cached.tree)
            ) {
                return null;
            }

            return cached;

        } catch (error) {

            console.warn(
                "Unable to read repository tree cache:",
                error
            );

            return null;

        }

    }


    function cacheRepositoryTree(tree) {

        try {

            localStorage.setItem(
                VISTAARA_PROJECTS.cacheKey,
                JSON.stringify({
                    timestamp: Date.now(),
                    tree
                })
            );

        } catch (error) {

            console.warn(
                "Unable to cache repository tree:",
                error
            );

        }

    }


    async function getRepositoryTree() {

        const cached =
            getCachedRepositoryTree();

        const cacheIsFresh =
            cached &&
            Date.now() - cached.timestamp <
                VISTAARA_PROJECTS.cacheDuration;

        if (cacheIsFresh) {
            return cached.tree;
        }

        const apiURL =
            "https://api.github.com/repos/" +
            "vistaarainfraconsultants/vistaara-infra-consultants" +
            "/git/trees/main?recursive=1";

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
                    `GitHub repository tree error: ${response.status}`
                );
            }

            const data =
                await response.json();

            if (!Array.isArray(data.tree)) {
                throw new Error(
                    "GitHub repository tree response is invalid."
                );
            }

            if (data.truncated) {
                console.warn(
                    "GitHub returned a truncated repository tree. Some files may not be discovered."
                );
            }

            const tree =
                data.tree
                    .filter(item =>
                        item &&
                        item.type === "blob" &&
                        item.path
                    )
                    .map(item => ({
                        path: item.path,
                        name: item.path.split("/").pop(),
                        download_url:
                            getRawRepositoryUrl(item.path)
                    }));

            cacheRepositoryTree(tree);

            return tree;

        } catch (error) {

            console.error(
                "Unable to load repository tree from GitHub:",
                error
            );

            if (cached) {
                console.warn(
                    "Using the previously cached repository tree."
                );
                return cached.tree;
            }

            return [];

        }

    }


    function normalisePath(path) {
        return path
            .replace(/^\/+|\/+$/g, "")
            .toLowerCase();
    }


    function getProjectFolders(tree) {

        const prefix = "projects/";
        const folders = new Map();

        tree
            .filter(item =>
                item.path.toLowerCase().startsWith(prefix)
            )
            .forEach(item => {

                const relative =
                    item.path.slice(prefix.length);

                const parts =
                    relative.split("/");

                if (parts.length < 2 || !parts[0]) {
                    return;
                }

                folders.set(
                    parts[0].toLowerCase(),
                    parts[0]
                );

            });

        return Array.from(folders.values())
            .sort((a, b) =>
                a.localeCompare(
                    b,
                    undefined,
                    { numeric: true, sensitivity: "base" }
                )
            );

    }


    async function fetchRepositoryJson(path) {

        const response =
            await fetch(
                getRawRepositoryUrl(path),
                { cache: "no-store" }
            );

        if (!response.ok) {
            throw new Error(
                `Unable to read ${path}: ${response.status}`
            );
        }

        return response.json();

    }


    function validateProjectData(project, folderName) {

        const requiredFields = [
            "title",
            "category",
            "description",
            "image"
        ];

        const missing =
            requiredFields.filter(field =>
                typeof project?.[field] !== "string" ||
                !project[field].trim()
            );

        if (missing.length) {
            console.warn(
                `Skipping project "${folderName}": missing ${missing.join(", ")}.`
            );
            return false;
        }

        return true;

    }


    async function fetchProjectDataFromTree(
        tree,
        folderName
    ) {

        try {

            const prefix =
                `projects/${folderName}/`;

            const files =
                tree.filter(item =>
                    item.path.toLowerCase().startsWith(
                        prefix.toLowerCase()
                    )
                );

            const jsonFile =
                files.find(file =>
                    file.name.toLowerCase() === "project.json"
                );

            if (!jsonFile) {
                throw new Error("project.json not found.");
            }

            const project =
                await fetchRepositoryJson(
                    jsonFile.path
                );

            if (!validateProjectData(project, folderName)) {
                return null;
            }

            const requestedImage =
                project.image.trim().toLowerCase();

            const imageFile =
                files.find(file =>
                    file.name.toLowerCase() === requestedImage
                );

            if (!imageFile) {
                throw new Error(
                    `Image "${project.image}" not found in the project folder.`
                );
            }

            return {
                ...project,
                location: project.location || "",
                status: project.status || "",
                featured: project.featured === true,
                order:
                    Number.isFinite(Number(project.order))
                        ? Number(project.order)
                        : Number.MAX_SAFE_INTEGER,
                imageUrl: imageFile.download_url,
                folder: folderName
            };

        } catch (error) {

            console.warn(
                `Skipping project folder "${folderName}":`,
                error.message
            );

            return null;

        }

    }


    function createProjectCard(project) {

        const article =
            document.createElement("article");

        article.className = "project-card";
        article.dataset.projectFolder = project.folder;
        article.dataset.category = project.category;
        article.dataset.status = project.status;

        const imageWrap =
            document.createElement("div");
        imageWrap.className = "project-image";

        const image =
            document.createElement("img");
        image.src = project.imageUrl;
        image.alt = project.title;
        image.loading = "lazy";
        image.decoding = "async";

        image.addEventListener("error", () => {
            console.warn(
                `Unable to load project image for "${project.title}".`
            );
            article.remove();
        });

        imageWrap.appendChild(image);

        const content =
            document.createElement("div");
        content.className = "project-content";

        const category =
            document.createElement("span");
        category.textContent = project.category;

        const title =
            document.createElement("h3");
        title.textContent = project.title;

        const description =
            document.createElement("p");
        description.textContent = project.description;

        content.appendChild(category);
        content.appendChild(title);
        content.appendChild(description);

        if (project.location) {
            const location =
                document.createElement("small");
            location.textContent = project.location;
            content.appendChild(location);
        }

        article.appendChild(imageWrap);
        article.appendChild(content);

        return article;

    }


    function createMoreProjectItem(project) {

        const item =
            document.createElement("div");

        item.className = "more-project-item";
        item.dataset.projectFolder = project.folder;

        const code =
            document.createElement("span");
        code.textContent = project.category || "PROJECT";

        const name =
            document.createElement("h4");
        name.className = "more-project-name";
        name.textContent = project.title;

        item.appendChild(code);
        item.appendChild(name);

        if (project.location) {
            const location =
                document.createElement("small");
            location.textContent = project.location;
            item.appendChild(location);
        }

        return item;

    }


    function renderProjects(projects) {

        const featuredGrid =
            document.getElementById("featured-project-grid");

        const moreList =
            document.getElementById("more-projects-list");

        const moreProjects =
            document.getElementById("more-projects");

        const emptyMessage =
            document.getElementById("projects-empty");

        if (!featuredGrid || !moreList) {
            return;
        }

        featuredGrid.innerHTML = "";
        moreList.innerHTML = "";

        const featured =
            projects
                .filter(project => project.featured)
                .sort((a, b) => a.order - b.order);

        const featuredProjects =
            featured.slice(0, 5);

        const extraFeatured =
            featured.slice(5);

        if (extraFeatured.length) {
            console.warn(
                `${extraFeatured.length} project(s) are marked featured beyond the five-card featured area. They will appear in More Projects.`
            );
        }

        const remainingProjects =
            projects
                .filter(project => !project.featured)
                .concat(extraFeatured)
                .sort((a, b) => a.order - b.order);

        featuredProjects.forEach(project => {
            featuredGrid.appendChild(
                createProjectCard(project)
            );
        });

        remainingProjects.forEach(project => {
            moreList.appendChild(
                createMoreProjectItem(project)
            );
        });

        if (emptyMessage) {
            emptyMessage.style.display =
                projects.length ? "none" : "block";
        }

        if (moreProjects) {
            moreProjects.style.display =
                remainingProjects.length ? "block" : "none";
        }

    }


    function initialiseProjectsToggle() {

        const list =
            document.getElementById("more-projects-list");

        const toggle =
            document.getElementById("more-projects-toggle");

        if (!list || !toggle) {
            return;
        }

        toggle.addEventListener("click", () => {

            const isOpen =
                toggle.getAttribute("aria-expanded") === "true";

            toggle.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

            list.hidden = isOpen;

        });

    }


    async function initialiseProjects(treeOverride = null) {

        initialiseProjectsToggle();

        const tree =
            treeOverride || await getRepositoryTree();

        if (!tree.length) {
            renderProjects([]);
            return;
        }

        const folders =
            getProjectFolders(tree);

        const results =
            await Promise.allSettled(
                folders.map(folderName =>
                    fetchProjectDataFromTree(
                        tree,
                        folderName
                    )
                )
            );

        const projects =
            results
                .filter(result =>
                    result.status === "fulfilled" &&
                    result.value
                )
                .map(result => result.value)
                .sort((a, b) => {
                    if (a.order !== b.order) {
                        return a.order - b.order;
                    }

                    return a.folder.localeCompare(
                        b.folder,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    );
                });

        renderProjects(projects);

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
         *
         * Start only when the employee section is visible.
         * Stop when the user scrolls away. This prevents the
         * carousel from advancing while the section is off-screen.
         */

        let employeeTimer = null;
        let employeeSectionVisible = false;

        function startEmployeeSlider() {

            if (
                employees.length <= getVisibleCount() ||
                !employeeSectionVisible
            ) {

                return;

            }

            clearInterval(employeeTimer);

            employeeTimer =
                setInterval(
                    () => {

                        if (employeeSectionVisible) {

                            moveEmployee(1);

                        }

                    },
                    5000
                );

        }


        function stopEmployeeSlider() {

            clearInterval(employeeTimer);
            employeeTimer = null;

        }


        const employeeObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            employeeSectionVisible = true;
                            startEmployeeSlider();

                        } else {

                            employeeSectionVisible = false;
                            stopEmployeeSlider();

                        }

                    });

                },
                {
                    threshold: 0.25
                }
            );

        employeeObserver.observe(carousel);

    }



    /* =====================================================
       CAREERS - GITHUB DATA

       Folder structure:
       /careers/<position-folder>/job.json
    ===================================================== */

    const VISTAARA_CAREERS = {
        folder: "careers"
    };


    function getCareerFolders(tree) {

        const prefix = "careers/";
        const folders = new Map();

        tree
            .filter(item =>
                item.path.toLowerCase().startsWith(prefix)
            )
            .forEach(item => {

                const relative =
                    item.path.slice(prefix.length);

                const parts =
                    relative.split("/");

                if (parts.length < 2 || !parts[0]) {
                    return;
                }

                folders.set(
                    parts[0].toLowerCase(),
                    parts[0]
                );

            });

        return Array.from(folders.values())
            .sort((a, b) =>
                a.localeCompare(
                    b,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                )
            );

    }


    function validateCareerData(job, folderName) {

        const requiredFields = [
            "title",
            "count",
            "status",
            "details",
            "software",
            "qualification",
            "description",
            "email"
        ];

        const missing =
            requiredFields.filter(field => {

                if (field === "details") {
                    return !Array.isArray(job?.details) ||
                        !job.details.length;
                }

                return (
                    typeof job?.[field] !== "string" ||
                    !job[field].trim()
                );

            });

        if (missing.length) {
            console.warn(
                `Skipping career position "${folderName}": missing or invalid ${missing.join(", ")}.`
            );
            return false;
        }

        if (
            !["open", "closed"].includes(
                job.status.toLowerCase()
            )
        ) {
            console.warn(
                `Skipping career position "${folderName}": status must be "open" or "closed".`
            );
            return false;
        }

        return true;

    }


    async function fetchCareerDataFromTree(
        tree,
        folderName
    ) {

        try {

            const prefix =
                `careers/${folderName}/`;

            const files =
                tree.filter(item =>
                    item.path.toLowerCase().startsWith(
                        prefix.toLowerCase()
                    )
                );

            const jsonFile =
                files.find(file =>
                    file.name.toLowerCase() === "job.json"
                );

            if (!jsonFile) {
                throw new Error("job.json not found.");
            }

            const job =
                await fetchRepositoryJson(
                    jsonFile.path
                );

            if (!validateCareerData(job, folderName)) {
                return null;
            }

            return {
                ...job,
                status: job.status.toLowerCase(),
                order:
                    Number.isFinite(Number(job.order))
                        ? Number(job.order)
                        : Number.MAX_SAFE_INTEGER,
                folder: folderName
            };

        } catch (error) {

            console.warn(
                `Skipping career folder "${folderName}":`,
                error.message
            );

            return null;

        }

    }


    function createJobCard(job, positionNumber) {

        const article =
            document.createElement("article");

        article.className = "job-card";
        article.dataset.positionFolder = job.folder;
        article.dataset.status = job.status;

        const header =
            document.createElement("div");
        header.className = "job-header";

        const titleWrap =
            document.createElement("div");

        const number =
            document.createElement("span");
        number.className = "job-number";
        number.textContent =
            job.positionLabel ||
            `POSITION ${String(positionNumber).padStart(2, "0")}`;

        const title =
            document.createElement("h3");
        title.textContent = job.title;

        const count =
            document.createElement("p");
        count.className = "job-count";
        count.textContent = job.count;

        titleWrap.appendChild(number);
        titleWrap.appendChild(title);
        titleWrap.appendChild(count);

        const status =
            document.createElement("span");
        status.className = `job-status ${job.status}`;
        status.textContent = job.status.toUpperCase();

        header.appendChild(titleWrap);
        header.appendChild(status);

        const toggle =
            document.createElement("button");
        toggle.className = "job-details-toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "false");

        const toggleText =
            document.createElement("span");
        toggleText.textContent = "View Position Details";

        const arrow =
            document.createElement("span");
        arrow.className = "job-arrow";
        arrow.textContent = "+";
        arrow.setAttribute("aria-hidden", "true");

        toggle.appendChild(toggleText);
        toggle.appendChild(arrow);

        const details =
            document.createElement("div");
        details.className = "job-details";

        const intro =
            document.createElement("h4");
        intro.textContent =
            "We are looking for candidates with experience or interest in:";
        details.appendChild(intro);

        const list =
            document.createElement("ul");

        job.details.forEach(detail => {
            const li =
                document.createElement("li");
            li.textContent = detail;
            list.appendChild(li);
        });

        details.appendChild(list);

        const softwareHeading =
            document.createElement("h4");
        softwareHeading.textContent =
            "Preferred Software Skills";
        details.appendChild(softwareHeading);

        const software =
            document.createElement("p");
        software.textContent = job.software;
        details.appendChild(software);

        const qualificationHeading =
            document.createElement("h4");
        qualificationHeading.textContent = "Qualification";
        details.appendChild(qualificationHeading);

        const qualification =
            document.createElement("p");
        qualification.textContent = job.qualification;
        details.appendChild(qualification);

        const description =
            document.createElement("p");
        description.textContent = job.description;
        details.appendChild(description);

        if (job.location) {
            const location =
                document.createElement("p");
            const strong =
                document.createElement("strong");
            strong.textContent = "Location: ";
            location.appendChild(strong);
            location.appendChild(
                document.createTextNode(job.location)
            );
            details.appendChild(location);
        }

        const apply =
            document.createElement("div");
        apply.className = "job-apply";

        const applyLink =
            document.createElement("a");
        applyLink.className = "button button-orange";
        applyLink.href =
            `mailto:${job.email}?subject=` +
            encodeURIComponent(
                `Application - ${job.title}`
            );
        applyLink.textContent =
            "Apply for this Position";

        apply.appendChild(applyLink);
        details.appendChild(apply);

        toggle.addEventListener("click", () => {

            if (job.status === "closed") {
                return;
            }

            const isOpen =
                article.classList.toggle(
                    "details-open"
                );

            toggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            arrow.textContent =
                isOpen ? "−" : "+";

        });

        article.appendChild(header);
        article.appendChild(toggle);
        article.appendChild(details);

        return article;

    }


    function renderCareers(jobs) {

        const careersList =
            document.getElementById("careers-list");

        const emptyMessage =
            document.getElementById("career-empty");

        if (!careersList) {
            return;
        }

        careersList.innerHTML = "";

        jobs.forEach((job, index) => {
            careersList.appendChild(
                createJobCard(job, index + 1)
            );
        });

        if (emptyMessage) {
            emptyMessage.style.display =
                jobs.length ? "none" : "block";
        }

    }


    async function initialiseCareers(treeOverride = null) {

        const tree =
            treeOverride || await getRepositoryTree();

        if (!tree.length) {
            renderCareers([]);
            return;
        }

        const folders =
            getCareerFolders(tree);

        const results =
            await Promise.allSettled(
                folders.map(folderName =>
                    fetchCareerDataFromTree(
                        tree,
                        folderName
                    )
                )
            );

        const jobs =
            results
                .filter(result =>
                    result.status === "fulfilled" &&
                    result.value
                )
                .map(result => result.value)
                .sort((a, b) => {
                    if (a.order !== b.order) {
                        return a.order - b.order;
                    }

                    return a.folder.localeCompare(
                        b.folder,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base"
                        }
                    );
                });

        renderCareers(jobs);

    }


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

    async function initialiseDynamicContent(treeOverride = null) {

        const files =
            await getRepositoryMedia(treeOverride);


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
       INITIALISE ALL DYNAMIC COMPONENTS

       One repository-tree request is shared by Projects, Careers,
       About media, Gallery and Employee media.
    ===================================================== */

    async function initialiseWebsiteData() {

        const tree =
            await getRepositoryTree();

        await Promise.all([
            initialiseProjects(tree),
            initialiseCareers(tree),
            initialiseDynamicContent(tree)
        ]);

    }


    initialiseWebsiteData();


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