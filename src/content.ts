const mainContent = document.querySelector(".application-main") as HTMLElement | null;

const SIDEBAR_STORAGE_KEY = "branchpanda-sidebar-visible";

const injectSidebar = () => {
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

  if (mainContent) {
    mainContent.style.position = "relative";
    mainContent.prepend(sidebarContainer);
    mainContent.style.marginLeft = "0";
    mainContent.style.transition = "margin-left 0.3s ease";
  } else {
    console.warn("mainContent not found, appending sidebar to body.");
    document.body.appendChild(sidebarContainer);
  }

  import('./sidebar').then((module) => {
    module.initSidebar(sidebarContainer);
  });
};

function insertCoolButton() {
  let container = document.getElementById("repository-details-container");
  const isHomePage = !!container;
  if (!container) {
    container = document.querySelector('#StickyHeader > div > div');
  }

  if (!container) {
    console.warn("Container for BranchPanda button not found, inserting fallback button.");

    const fallbackButton = createButton();
    Object.assign(fallbackButton.style, {
      position: "fixed",
      top: "1em",
      left: "1em",
      zIndex: "1000",
      backgroundColor: "#21262d",
      border: "none",
      color: "#fff",
      fontSize: "1rem",
      padding: "0.25em 0.5em",
      borderRadius: "3px",
      userSelect: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.4em",
    });

    document.body.appendChild(fallbackButton);
    return;
  }

  function createButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-sm btn";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.gap = "0.4em";
    button.style.cursor = "pointer";

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
      if (!sidebar) return;

      const isHidden = sidebar.style.display === "none";

      if (isHidden) {
        sidebar.style.display = "block";
        if (mainContent) {
          mainContent.style.marginLeft = "12.5em";
        }
      } else {
        sidebar.style.display = "none";
        if (mainContent) {
          mainContent.style.marginLeft = "0";
        }
      }

      localStorage.setItem(SIDEBAR_STORAGE_KEY, isHidden ? "visible" : "hidden");
    };

    return button;
  }

  const button = createButton();

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

injectSidebar();
insertCoolButton();

window.addEventListener("resize", () => {
  const sidebar = document.getElementById("branchpanda-sidebar");
  if (!sidebar || !mainContent) return;
  sidebar.style.height = `${window.innerHeight}px`;
});


window.addEventListener("load", () => {
  const sidebar = document.getElementById("branchpanda-sidebar");
  if (!sidebar) return;

  const storedPref = localStorage.getItem(SIDEBAR_STORAGE_KEY);

  if (storedPref === "hidden") {
    sidebar.style.display = "none";
    if (mainContent) {
      mainContent.style.marginLeft = "0";
    }
  } else {
    sidebar.style.display = "block";
    if (mainContent) {
      mainContent.style.marginLeft = "12.5em";
    }
  }
});
