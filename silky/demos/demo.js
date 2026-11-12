var Module;

(() => {
  const demo = document.body.dataset.demo;
  const canvas = document.getElementById("canvas");
  const status = document.getElementById("status");
  const heading = document.getElementById("status-heading");
  const detail = document.getElementById("status-detail");
  const reload = document.getElementById("reload");
  let failed = false;

  // Notify an embedding page on this origin about the demo's state.
  function notify(type) {
    if (window.parent !== window && location.origin !== "null") {
      window.parent.postMessage({ type, demo }, location.origin);
    }
  }

  // Keep runtime failures visible and offer a fresh attempt.
  function showError(message) {
    if (failed) {
      return;
    }
    failed = true;
    document.body.classList.remove("ready");
    status.hidden = false;
    heading.textContent = "The demo could not start";
    detail.textContent = message;
    reload.hidden = false;
    notify("silky-demo-error");
  }

  // Reveal the canvas after initialization and the first rendered frames.
  function showReady() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!failed) {
          document.body.classList.add("ready");
          status.hidden = true;
          notify("silky-demo-ready");
        }
      });
    });
  }

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    showError("The graphics context was lost. Reload to try again.");
  });
  window.addEventListener("error", () => {
    showError("A browser error stopped the demo. Reload to try again.");
  });
  window.addEventListener("unhandledrejection", () => {
    showError("A demo file could not load. Check your connection and reload.");
  });

  Module = {
    canvas,
    preRun: [],
    postRun: [showReady],
    onAbort() {
      showError("This demo needs WebAssembly and WebGL. Try reloading in a current browser.");
    },
    monitorRunDependencies(remaining) {
      if (!failed && remaining > 0) {
        detail.textContent = "Loading the WebAssembly app and its graphics…";
      }
    }
  };

  if (demo !== "basicwindow" && demo !== "calculator") {
    showError("This demo is not available.");
    return;
  }
  const script = document.createElement("script");
  script.src = `${demo}.js`;
  script.async = true;
  script.addEventListener("error", () => {
    showError("The demo file could not load. Check your connection and reload.");
  });
  document.body.append(script);
})();
