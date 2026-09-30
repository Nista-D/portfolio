(() => {
  // ========================================
  // FULL-IMAGE VIEWER
  // ========================================

  const viewer = document.querySelector("#designViewer");
  const openViewerButton = document.querySelector("[data-open-viewer]");
  const closeViewerButton = document.querySelector("[data-close-viewer]");

  const zoomInButton = document.querySelector("[data-zoom-in]");
  const zoomOutButton = document.querySelector("[data-zoom-out]");
  const resetZoomButton = document.querySelector("[data-reset-zoom]");
  const zoomLabel = document.querySelector("[data-zoom-label]");

  const viewerStage = document.querySelector("[data-viewer-stage]");
  const viewerImage = document.querySelector("[data-viewer-image]");

  let zoom = 1;
  let imageDragging = false;

  let imageStartX = 0;
  let imageStartY = 0;
  let imageStartScrollLeft = 0;
  let imageStartScrollTop = 0;

  function setZoom(value) {
    zoom = Math.min(Math.max(value, 0.6), 2.2);

    if (viewerImage) {
      viewerImage.style.transform = `scale(${zoom})`;
    }

    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    }
  }

  function resetViewer() {
    setZoom(1);

    viewerStage?.scrollTo({
      top: 0,
      left: 0
    });
  }

  function openViewer() {
    if (!viewer) return;

    resetViewer();
    viewer.showModal();
    document.body.classList.add("viewer-open");
  }

  function closeViewer() {
    if (!viewer) return;

    viewer.close();
    document.body.classList.remove("viewer-open");
  }

  openViewerButton?.addEventListener("click", openViewer);
  closeViewerButton?.addEventListener("click", closeViewer);

  zoomInButton?.addEventListener("click", () => {
    setZoom(zoom + 0.2);
  });

  zoomOutButton?.addEventListener("click", () => {
    setZoom(zoom - 0.2);
  });

  resetZoomButton?.addEventListener("click", resetViewer);

  viewer?.addEventListener("click", (event) => {
    if (event.target === viewer) {
      closeViewer();
    }
  });

  viewer?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeViewer();
  });

  // Drag the expanded design.

  viewerStage?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    imageDragging = true;

    imageStartX = event.clientX;
    imageStartY = event.clientY;

    imageStartScrollLeft = viewerStage.scrollLeft;
    imageStartScrollTop = viewerStage.scrollTop;

    viewerStage.setPointerCapture(event.pointerId);
  });

  viewerStage?.addEventListener("pointermove", (event) => {
    if (!imageDragging) return;

    viewerStage.scrollLeft =
      imageStartScrollLeft - (event.clientX - imageStartX);

    viewerStage.scrollTop =
      imageStartScrollTop - (event.clientY - imageStartY);
  });

  viewerStage?.addEventListener("pointerup", () => {
    imageDragging = false;
  });

  viewerStage?.addEventListener("pointercancel", () => {
    imageDragging = false;
  });

  // Ctrl/Cmd + mouse wheel zoom.

  viewerStage?.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();

      setZoom(
        zoom + (event.deltaY < 0 ? 0.1 : -0.1)
      );
    },
    { passive: false }
  );

  // ========================================
  // MORE-PROJECTS CAROUSEL
  // ========================================

  const projectViewport = document.querySelector(
    "[data-project-viewport]"
  );

  const projectTrack = document.querySelector(
    "[data-project-track]"
  );

  const projectCards = [
    ...document.querySelectorAll(".project")
  ];

  const projectControls = document.querySelector(
    "[data-carousel-controls]"
  );

  const previousButton = document.querySelector(
    "[data-project-prev]"
  );

  const nextButton = document.querySelector(
    "[data-project-next]"
  );

  // Horizontal scrolling activates only above three projects.

  if (
    projectViewport &&
    projectTrack &&
    projectControls &&
    previousButton &&
    nextButton &&
    projectCards.length > 3
  ) {
    projectViewport.classList.add("is-scrollable");
    projectControls.hidden = false;

    let projectDragging = false;
    let projectMoved = false;
    let projectStartX = 0;
    let projectStartScroll = 0;

    function getProjectStep() {
      const cardWidth =
        projectCards[0].getBoundingClientRect().width;

      const gap =
        parseFloat(getComputedStyle(projectTrack).gap) || 0;

      return cardWidth + gap;
    }

    function updateCarouselButtons() {
      const scrollEnd =
        projectTrack.scrollWidth - projectTrack.clientWidth;

      previousButton.disabled =
        projectTrack.scrollLeft < 2;

      nextButton.disabled =
        projectTrack.scrollLeft > scrollEnd - 2;
    }

    previousButton.addEventListener("click", () => {
      projectTrack.scrollBy({
        left: -getProjectStep(),
        behavior: "smooth"
      });
    });

    nextButton.addEventListener("click", () => {
      projectTrack.scrollBy({
        left: getProjectStep(),
        behavior: "smooth"
      });
    });

    projectTrack.addEventListener(
      "scroll",
      updateCarouselButtons,
      { passive: true }
    );

    // Mouse dragging.

    projectTrack.addEventListener("pointerdown", (event) => {
      if (
        event.pointerType !== "mouse" ||
        event.button !== 0
      ) {
        return;
      }

      projectDragging = true;
      projectMoved = false;

      projectStartX = event.clientX;
      projectStartScroll = projectTrack.scrollLeft;

      projectTrack.classList.add("is-dragging");
      projectTrack.setPointerCapture(event.pointerId);
    });

    projectTrack.addEventListener("pointermove", (event) => {
      if (!projectDragging) return;

      const distance = event.clientX - projectStartX;

      if (Math.abs(distance) > 5) {
        projectMoved = true;
      }

      projectTrack.scrollLeft =
        projectStartScroll - distance;
    });

    function stopProjectDragging() {
      projectDragging = false;
      projectTrack.classList.remove("is-dragging");
    }

    projectTrack.addEventListener(
      "pointerup",
      stopProjectDragging
    );

    projectTrack.addEventListener(
      "pointercancel",
      stopProjectDragging
    );

    // Prevent project navigation after dragging.

    projectTrack.addEventListener(
      "click",
      (event) => {
        if (projectMoved) {
          event.preventDefault();
          projectMoved = false;
        }
      },
      true
    );

    window.addEventListener(
      "resize",
      updateCarouselButtons
    );

    updateCarouselButtons();
  }

  // ========================================
  // ORIGINAL MOUSE SCROLL ANIMATION
  // ========================================

  const mouseButton = document.querySelector(
    ".mouse-scroll-button"
  );

  if (mouseButton) {
    const progressFill = mouseButton.querySelector(
      ".progress-fill"
    );

    const progressText = mouseButton.querySelector(
      ".progress-text"
    );

    function updateMouseProgress() {
      const page =
        document.scrollingElement ||
        document.documentElement;

      const maximumScroll =
        page.scrollHeight - page.clientHeight;

      const progress = maximumScroll > 0
        ? Math.min(
            100,
            Math.max(
              0,
              (page.scrollTop / maximumScroll) * 100
            )
          )
        : 0;

      progressFill.style.height = `${progress}%`;
      progressText.textContent = `${Math.round(progress)}%`;
    }

    mouseButton.addEventListener("click", () => {
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "instant" : "smooth"
      });
    });

    window.addEventListener(
      "scroll",
      updateMouseProgress,
      { passive: true }
    );

    window.addEventListener("resize", updateMouseProgress);
    window.addEventListener("load", updateMouseProgress);

    updateMouseProgress();
  }
})();