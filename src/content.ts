const injectSidebar = () => {
  const sidebarContainer = document.createElement("div");
  sidebarContainer.id = "branchpanda-sidebar";
  sidebarContainer.style.position = "fixed";
  sidebarContainer.style.top = "0";
  sidebarContainer.style.left = "0";
  sidebarContainer.style.padding = "0.5em";
  sidebarContainer.style.width = "12.5em"; // 200px
  sidebarContainer.style.height = "100vh";
  sidebarContainer.style.border = "1px solid #ccc";
  sidebarContainer.style.background = "#0D1117";
  sidebarContainer.style.color = "#ffffff";
  sidebarContainer.style.zIndex = "9999";
  sidebarContainer.style.overflowY = "auto";
  sidebarContainer.style.boxShadow = "2px 0 5px rgba(0,0,0,0.2)";
  sidebarContainer.textContent = "Loading sidebar...";

  document.body.appendChild(sidebarContainer);

  import('./sidebar').then((module) => {
    module.initSidebar(sidebarContainer);
  });
};

injectSidebar();
