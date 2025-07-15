let lastUrl = location.href;
import { initSidebar } from './sidebar';

function injectSidebar() {
  // Verify we are on a valid page
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts.length < 2) return;

  if (document.getElementById("branchpanda-sidebar")) return;

  const mainContent = document.querySelector(".application-main") as HTMLElement | null;
  if (!mainContent) return;

  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "branchpanda-sidebar";

  Object.assign(sidebarContainer.style, {
    position: "absolute",
    top: "0",
    left: "-12em",
    width: "13em",
    height: "100%",
    padding: "1em 0.5em 0.5em 0.5em",
    border: "none",
    borderRight: ".5px solid #3d444d",
    background: "#0D1117",
    color: "#ffffff",
    zIndex: "10",
    overflowY: "auto",
    boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
    listStyleType: "none",
  });

  sidebarContainer.style.display = "none"; // default fallback

  mainContent.style.position = "relative";
  mainContent.prepend(sidebarContainer);
  mainContent.style.transition = "margin-left 0.3s ease";

  chrome.storage.local.get(["branchpandaSidebarVisible"], (result) => {
    let visible = result.branchpandaSidebarVisible;

    // If not set, default to true
    if (typeof visible === "undefined") {
      visible = true;
      chrome.storage.local.set({ branchpandaSidebarVisible: true });
    }

    if (visible) {
      sidebarContainer.style.display = "block";
      mainContent.style.marginLeft = "12.5em";
    } else {
      sidebarContainer.style.display = "none";
      mainContent.style.marginLeft = "0";
    }
  });

  initSidebar(sidebarContainer);
}

function insertCoolButton() {
  if (document.getElementById("branchpanda-button")) return;

  let container = document.getElementById("repository-details-container") ||
    document.querySelector('#StickyHeader > div > div');
  if (!container) {
    console.warn("Container for BranchPanda button not found.");
    return;
  }

  const button = document.createElement("button");
  button.id = "branchpanda-button";
  button.type = "button";
  button.className = "btn-sm btn";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.gap = "0.4em";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("svg/panda.svg");
  img.alt = "BranchPanda logo";
  img.style.width = "1em";
  img.style.height = "1em";
  img.style.position = "relative";
  img.style.top = "0.0625em";

  const span = document.createElement("span");
  span.textContent = "BranchPanda";

  button.appendChild(img);
  button.appendChild(span);

  button.onclick = () => {
    const sidebar = document.getElementById("branchpanda-sidebar");
    const mainContent = document.querySelector(".application-main") as HTMLElement | null;
    if (!sidebar || !mainContent) return;

    const isHidden = sidebar.style.display === "none";
    sidebar.style.display = isHidden ? "block" : "none";
    mainContent.style.marginLeft = isHidden ? "12.5em" : "0";

    chrome.storage.local.set({ branchpandaSidebarVisible: isHidden });
  };

  const isHomePage = !!document.getElementById("repository-details-container");
  if (isHomePage) {
    const ul = container.querySelector("ul.pagehead-actions");
    if (!ul) return;
    const li = document.createElement("li");
    li.appendChild(button);
    ul.insertBefore(li, ul.firstChild);
  } else {
    container.appendChild(button);
  }
}

function initialize() {
  injectSidebar();
  insertCoolButton();
}

initialize();

// Check the URL every second
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;

    // Remove previous sidebar and button
    const sidebar = document.getElementById("branchpanda-sidebar");
    if (sidebar) sidebar.remove();

    const button = document.getElementById("branchpanda-button");
    if (button) button.remove();

    // Reinitialize the sidebar and button after a short delay
    setTimeout(() => {
      initialize();
    }, 300);
  }
}, 1000);
