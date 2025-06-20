const injectSidebar = async () => {
  const sidebarUrl = chrome.runtime.getURL("sidebar.html");
  const currentUrl = encodeURIComponent(window.location.href);
  const iframe = document.createElement("iframe");
  iframe.src = `${sidebarUrl}?pageUrl=${currentUrl}`;
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "300px";
  iframe.style.height = "100vh";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  iframe.style.boxShadow = "2px 0 5px rgba(0,0,0,0.2)";
  document.body.appendChild(iframe);
};

injectSidebar();
