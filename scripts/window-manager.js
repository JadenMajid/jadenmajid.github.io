const taskbarEl = document.querySelector(".taskbar");
const taskbarTimeEl = document.querySelector(".taskbar-time");
const windowElements = Array.from(document.querySelectorAll(".os-window"));
const taskElements = Array.from(document.querySelectorAll(".task-item"));

function taskIdFromWindowId(windowId) {
  return "task-" + windowId.replace("win-", "");
}

function getWindowById(windowId) {
  return document.getElementById(windowId);
}

function getTaskByWindowId(windowId) {
  return document.getElementById(taskIdFromWindowId(windowId));
}

function clearTaskActiveStates() {
  taskElements.forEach((task) => task.classList.remove("active"));
}

// Clock
setInterval(() => {
  const d = new Date();
  let hours = d.getHours();
  let mins = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  mins = mins < 10 ? "0" + mins : mins;
  if (taskbarTimeEl) {
    taskbarTimeEl.innerText = hours + ":" + mins + " " + ampm;
  }
}, 1000);

// Window Manager
let highestZ = 10;

function loadLazyMedia(container) {
  if (!container) return;

  container.querySelectorAll("img[data-src]").forEach((img) => {
    const fullSrc = img.dataset.src;
    const lowSrc = img.dataset.lqSrc || fullSrc;

    if (!img.getAttribute("src")) {
      img.setAttribute("src", lowSrc);
    }

    if (lowSrc !== fullSrc && img.dataset.upgraded !== "true") {
      img.style.filter = "blur(2px)";
      img.style.transition = "filter 220ms ease";

      const fullImage = new Image();
      fullImage.decoding = "async";
      fullImage.src = fullSrc;
      fullImage.onload = () => {
        img.setAttribute("src", fullSrc);
        img.style.filter = "none";
        img.dataset.upgraded = "true";
      };
    }
  });

  container.querySelectorAll("video[data-src]").forEach((video) => {
    const fullSrc = video.dataset.src;
    const lowSrc = video.dataset.lqSrc || fullSrc;

    if (!video.getAttribute("src")) {
      video.setAttribute("src", lowSrc);
      video.load();
      if (video.autoplay) {
        video.play().catch(() => {});
      }
    }

    if (
      lowSrc === fullSrc ||
      video.dataset.upgraded === "true" ||
      video.dataset.upgrading === "true"
    ) {
      return;
    }

    video.dataset.upgrading = "true";
    const preloader = document.createElement("video");
    preloader.preload = "auto";
    preloader.muted = true;
    preloader.playsInline = true;
    preloader.src = fullSrc;

    preloader.addEventListener(
      "canplaythrough",
      () => {
        const currentTime = video.currentTime || 0;
        const shouldPlay = video.autoplay || !video.paused;

        video.setAttribute("src", fullSrc);
        video.load();

        video.addEventListener("loadedmetadata", function restorePlayback() {
          if (!Number.isNaN(currentTime) && currentTime > 0) {
            video.currentTime = Math.min(
              currentTime,
              Math.max(0, video.duration - 0.1),
            );
          }
          if (shouldPlay) {
            video.play().catch(() => {});
          }
          video.removeEventListener("loadedmetadata", restorePlayback);
        });

        video.dataset.upgraded = "true";
        video.dataset.upgrading = "false";
      },
      { once: true },
    );

    preloader.addEventListener(
      "error",
      () => {
        video.dataset.upgrading = "false";
      },
      { once: true },
    );
  });
}

function taskbarHeightPx() {
  return taskbarEl?.offsetHeight || 40;
}

function setMaxButtonState(win, isMaximized) {
  if (!win) return;
  const btn = win.querySelector("[data-max-btn]");
  if (!btn) return;
  btn.setAttribute("aria-label", isMaximized ? "Restore" : "Maximize");
  btn.textContent = isMaximized ? "[-]" : "[]";
}

function applyMaximizedBounds(win) {
  if (!win) return;
  const taskbarHeight = taskbarHeightPx();
  win.style.top = "0px";
  win.style.left = "0px";
  win.style.width = window.innerWidth + "px";
  win.style.height = window.innerHeight - taskbarHeight + "px";
}

function maxWindow(id) {
  const win = getWindowById(id);
  if (!win) return;

  if (!win.classList.contains("maximized")) {
    win.dataset.prevTop = win.style.top || "";
    win.dataset.prevLeft = win.style.left || "";
    win.dataset.prevWidth = win.style.width || "";
    win.dataset.prevHeight = win.style.height || "";
    win.classList.add("maximized");
    applyMaximizedBounds(win);
    setMaxButtonState(win, true);
    bringToFront(id);
    return;
  }

  win.classList.remove("maximized");
  win.style.top = win.dataset.prevTop || "";
  win.style.left = win.dataset.prevLeft || "";
  win.style.width = win.dataset.prevWidth || "";
  win.style.height = win.dataset.prevHeight || "";
  setMaxButtonState(win, false);
  clampWindowToViewport(win);
  bringToFront(id);
}

function isMobileViewport() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function setInitialWindowLayout() {
  if (isMobileViewport()) return;

  const profile = getWindowById("win-profile");
  const map = getWindowById("win-map");
  if (!profile || !map) return;

  const taskbarHeight = taskbarHeightPx();
  const vw = window.innerWidth;
  const vh = window.innerHeight - taskbarHeight;

  const profileWidth = Math.min(460, Math.max(360, Math.floor(vw * 0.38)));
  profile.style.width = profileWidth + "px";
  profile.style.height = "auto";
  profile.style.top = "96px";
  profile.style.left =
    Math.max(12, Math.floor(vw * 0.5) - profileWidth - 16) + "px";

  const mapWidth = Math.min(640, Math.max(440, Math.floor(vw * 0.45)));
  const mapHeight = Math.min(560, Math.max(380, Math.floor(vh * 0.62)));
  map.style.width = mapWidth + "px";
  map.style.height = mapHeight + "px";

  const profileRect = profile.getBoundingClientRect();
  const preferredLeft = Math.round(profileRect.right + 16);
  const fitsRight = preferredLeft + mapWidth <= vw - 12;

  if (fitsRight) {
    map.style.left = preferredLeft + "px";
    map.style.top = "96px";
  } else {
    map.style.left = Math.max(12, Math.floor((vw - mapWidth) / 2)) + "px";
    map.style.top = Math.round(profileRect.bottom + 14) + "px";
  }

  clampWindowToViewport(profile);
  clampWindowToViewport(map);
}

function snapWindowToPixelGrid(win) {
  if (!win || isMobileViewport()) return;

  const rect = win.getBoundingClientRect();
  const roundedLeft = Math.round(rect.left);
  const roundedTop = Math.round(rect.top);

  win.style.left = roundedLeft + "px";
  win.style.top = roundedTop + "px";

  if (win.style.width && win.style.width !== "auto") {
    win.style.width = Math.round(rect.width) + "px";
  }

  if (win.style.height && win.style.height !== "auto") {
    win.style.height = Math.round(rect.height) + "px";
  }
}

function clampWindowToViewport(win) {
  if (!win || isMobileViewport()) return;
  if (getComputedStyle(win).display === "none") return;

  if (win.classList.contains("maximized")) {
    applyMaximizedBounds(win);
    return;
  }

  const taskbarHeight = taskbarHeightPx();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight - taskbarHeight;

  const rect = win.getBoundingClientRect();
  const winWidth = Math.round(rect.width);
  const winHeight = Math.round(rect.height);
  const minWidth = parseInt(getComputedStyle(win).minWidth, 10) || 320;
  const minHeight = parseInt(getComputedStyle(win).minHeight, 10) || 220;
  const targetWidth = Math.max(minWidth, winWidth);
  const targetHeight = Math.max(minHeight, winHeight);
  const maxLeft = Math.max(0, viewportWidth - winWidth);
  const maxTop = Math.max(0, viewportHeight - winHeight);

  const boundedLeft = Math.round(Math.min(Math.max(rect.left, 0), maxLeft));
  const boundedTop = Math.round(Math.min(Math.max(rect.top, 0), maxTop));

  win.style.left = boundedLeft + "px";
  win.style.top = boundedTop + "px";
  win.style.width = targetWidth + "px";
  win.style.height = targetHeight + "px";
  snapWindowToPixelGrid(win);
}

function addResizeHandles(win) {
  if (!win || isMobileViewport()) return;

  const directions = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
  directions.forEach((direction) => {
    const handle = document.createElement("div");
    handle.className = `resize-handle ${direction}`;
    handle.dataset.direction = direction;
    win.appendChild(handle);

    handle.addEventListener("mousedown", function (e) {
      if (win.classList.contains("maximized")) return;
      e.preventDefault();
      e.stopPropagation();
      bringToFront(win.id);

      const startRect = win.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const taskbarHeight = taskbarHeightPx();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight - taskbarHeight;
      const minWidth = parseInt(getComputedStyle(win).minWidth, 10) || 320;
      const minHeight = parseInt(getComputedStyle(win).minHeight, 10) || 220;

      function onMouseMove(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        let newLeft = startRect.left;
        let newTop = startRect.top;
        let newWidth = startRect.width;
        let newHeight = startRect.height;

        if (direction.includes("e")) {
          newWidth = startRect.width + dx;
        }
        if (direction.includes("s")) {
          newHeight = startRect.height + dy;
        }
        if (direction.includes("w")) {
          newWidth = startRect.width - dx;
          newLeft = startRect.left + dx;
        }
        if (direction.includes("n")) {
          newHeight = startRect.height - dy;
          newTop = startRect.top + dy;
        }

        newWidth = Math.max(minWidth, Math.min(newWidth, viewportWidth));
        newHeight = Math.max(minHeight, Math.min(newHeight, viewportHeight));

        if (direction.includes("w")) {
          newLeft = startRect.right - newWidth;
        }
        if (direction.includes("n")) {
          newTop = startRect.bottom - newHeight;
        }

        const maxLeft = Math.max(0, viewportWidth - newWidth);
        const maxTop = Math.max(0, viewportHeight - newHeight);
        newLeft = Math.min(Math.max(newLeft, 0), maxLeft);
        newTop = Math.min(Math.max(newTop, 0), maxTop);

        win.style.left = Math.round(newLeft) + "px";
        win.style.top = Math.round(newTop) + "px";
        win.style.width = Math.round(newWidth) + "px";
        win.style.height = Math.round(newHeight) + "px";
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        clampWindowToViewport(win);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
}

function bringToFront(id) {
  highestZ++;
  const win = getWindowById(id);
  if (win) {
    loadLazyMedia(win);
    win.style.zIndex = highestZ;
    win.style.display = "flex";
    clampWindowToViewport(win);
  }

  // Update taskbar visibility and active state
  clearTaskActiveStates();
  const task = getTaskByWindowId(id);
  if (task) {
    task.style.display = "block";
    task.classList.add("active");
  }
}

function minWindow(id) {
  if (id === "all") {
    windowElements.forEach((w) => (w.style.display = "none"));
    clearTaskActiveStates();
    return;
  }
  const win = getWindowById(id);
  if (!win) return;
  win.style.display = "none";
  const task = getTaskByWindowId(id);
  if (task) task.classList.remove("active");
}

function closeWindow(id) {
  const win = getWindowById(id);
  if (!win) return;
  win.style.display = "none";
  const task = getTaskByWindowId(id);
  if (task) task.style.display = "none"; // removing from taskbar entirely
}

function toggleWindow(id) {
  const win = getWindowById(id);
  if (!win) return;
  const task = getTaskByWindowId(id);
  if (task) task.style.display = "block"; // Make sure the task item shows when toggled open

  if (win.style.display === "none") {
    bringToFront(id);
  } else {
    if (win.style.zIndex == highestZ) {
      minWindow(id);
    } else {
      bringToFront(id);
    }
  }
}

// Draggable Logic
windowElements.forEach((win) => {
  win.addEventListener("mousedown", () => bringToFront(win.id));
  addResizeHandles(win);

  const titleBar = win.querySelector(".title-bar");
  if (!titleBar) return;

  titleBar.addEventListener("mousedown", function (e) {
    if (e.target.tagName === "BUTTON") return;
    bringToFront(win.id);
    if (win.classList.contains("maximized")) return;

    let rect = win.getBoundingClientRect();
    let shiftX = e.clientX - rect.left;
    let shiftY = e.clientY - rect.top;

    function moveAt(pageX, pageY) {
      win.style.left = Math.round(pageX - shiftX) + "px";
      win.style.top = Math.round(pageY - shiftY) + "px";
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
      clampWindowToViewport(win);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      clampWindowToViewport(win);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
  titleBar.ondragstart = function () {
    return false;
  };
});

window.addEventListener("resize", () => {
  windowElements.forEach((win) => {
    if (win.classList.contains("maximized")) {
      applyMaximizedBounds(win);
    } else {
      clampWindowToViewport(win);
    }
  });
});

if (window.ResizeObserver) {
  const windowResizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => clampWindowToViewport(entry.target));
  });
  windowElements.forEach((win) => windowResizeObserver.observe(win));
}

// Initial setup
setInitialWindowLayout();
if (isMobileViewport()) {
  minWindow("all");
} else {
  bringToFront("win-profile");
  bringToFront("win-map");
}
windowElements.forEach(clampWindowToViewport);
