let lastUrl = location.href;

function injectSidebar() {
  if (document.getElementById("branchpanda-sidebar")) return;

  const mainContent = document.querySelector(".application-main") as HTMLElement | null;
  if (!mainContent) {
    console.warn("Main content not found");
    return;
  }

  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "branchpanda-sidebar";

  Object.assign(sidebarContainer.style, {
    display: "none",
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

  mainContent.style.position = "relative";
  mainContent.prepend(sidebarContainer);
  mainContent.style.marginLeft = "0";
  mainContent.style.transition = "margin-left 0.3s ease";

  import('./sidebar').then((module) => {
    module.initSidebar(sidebarContainer);
  });
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

// ✅ Avvio iniziale
initialize();

// 🔁 Controlla i cambi URL ogni secondo (SPA navigation)
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;

    // Rimuovi sidebar e bottone precedenti
    const sidebar = document.getElementById("branchpanda-sidebar");
    if (sidebar) sidebar.remove();

    const button = document.getElementById("branchpanda-button");
    if (button) button.remove();

    // Re-inietta dopo un piccolo delay per dare tempo al DOM di aggiornarsi
    setTimeout(() => {
      initialize();
    }, 300);
  }
}, 1000);
