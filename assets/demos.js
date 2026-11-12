const Frame = document.querySelector("#demo-frame"),
  Status = document.querySelector("#demo-status"),
  Tabs = [...document.querySelectorAll(".demo-tab")],
  OpenDemo = document.querySelector("#open-demo"),
  Source = document.querySelector("#demo-source");
let activeDemo = "basicwindow";

/** Load one compiled demo at a time in its own browsing context. */
function selectDemo(button) {
  if (button.dataset.demo === activeDemo) {
    return;
  }
  activeDemo = button.dataset.demo;
  Status.hidden = false;
  Status.textContent = "Loading the Silky demo…";
  Frame.title = `${button.textContent.trim()} — interactive Silky demo`;
  Frame.src = `demos/${activeDemo}.html`;
  OpenDemo.href = Frame.src;
  Source.href = "https://github.com/treeform/silky/tree/master/examples/" +
    activeDemo;
  for (const tab of Tabs) {
    tab.setAttribute("aria-pressed", String(tab === button));
  }
}
for (const tab of Tabs) {
  tab.addEventListener("click", () => selectDemo(tab));
}
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin ||
    event.source !== Frame.contentWindow) {
    return;
  }
  if (event.data?.type === "silky-demo-ready") {
    Status.hidden = true;
  } else if (event.data?.type === "silky-demo-error") {
    Status.hidden = false;
    Status.textContent = "This demo could not start. Try opening it in a new " +
      "tab using the link above, or use a browser with WebGL 2 support.";
  }
});
document.querySelector("#demo-controls").hidden = false;
