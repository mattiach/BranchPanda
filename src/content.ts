const injectSidebar = () => {
  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "branchpanda-sidebar";

  // Apply styles to the sidebar container
  Object.assign(sidebarContainer.style, {
    display: "none",
    position: "fixed",
    top: "0",
    left: "0",
    padding: "0.5em",
    width: "12.5em",
    height: "100vh",
    border: "none",
    borderRight: "1px solid #ccc",
    background: "#0D1117",
    color: "#ffffff",
    zIndex: "9999",
    overflowY: "auto",
    boxShadow: "2px 0 5px rgba(0,0,0,0.2)",
  });

  document.body.appendChild(sidebarContainer);

  import('./sidebar').then((module) => {
    module.initSidebar(sidebarContainer);
  });

  // Adjust the main content margin when the sidebar is toggled
  const mainContent = document.querySelector(".application-main") as HTMLElement | null;
  if (mainContent) {
    mainContent.style.marginLeft = "0";
    mainContent.style.transition = "margin-left 0.3s ease";
  }
};

function insertCoolButton() {
  const container = document.getElementById("repository-details-container");
  if (!container) return;

  const ul = container.querySelector("ul.pagehead-actions");
  if (!ul) return;

  const li = document.createElement("li");
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn-sm btn";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.gap = "0.4em";

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("svg/panda.svg");
  img.alt = "BranchPanda logo";
  img.style.width = "16px";
  img.style.height = "16px";
  img.style.position = "relative";
  img.style.top = "1px";

  const span = document.createElement("span");
  span.textContent = "BranchPanda";

  button.appendChild(img);
  button.appendChild(span);

  button.onclick = () => {
    const sidebar = document.getElementById("branchpanda-sidebar");
    const mainContent = document.querySelector(".application-main") as HTMLElement | null;
    if (!sidebar) return;

    const isHidden = sidebar.style.display === "none";
    sidebar.style.display = isHidden ? "block" : "none";

    if (mainContent) {
      mainContent.style.marginLeft = isHidden ? "12.5em" : "0";
    }
  };

  li.appendChild(button);
  ul.insertBefore(li, ul.firstChild);
}

injectSidebar();
insertCoolButton();
