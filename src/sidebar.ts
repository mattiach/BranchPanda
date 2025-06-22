import { RepoInfo, RepoItem } from "./interfaces/const";

export async function initSidebar(container: HTMLElement) {
  const sidebarRoot = container;

  function parseOwnerRepoBranchPath(url: string) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);

      if (parts.length < 2) return null;

      const owner = parts[0];
      const repo = parts[1];
      let branch = "main";
      let path = '';

      if (parts.length === 2) {
        return { owner, repo, branch, path };
      }

      if (parts.length >= 4 && (parts[2] === "tree" || parts[2] === "blob")) {
        branch = parts[3];
        path = parts.slice(4).join("/");
        return { owner, repo, branch, path };
      }

      return null;
    } catch {
      return null;
    }
  }

  async function fetchDefaultBranch(owner: string, repo: string): Promise<string> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Failed to fetch repo info");
    const repoInfo = await res.json();
    return repoInfo.default_branch;


  }

  async function fetchRepoContents(repoInfo: RepoInfo): Promise<RepoItem[]> {
    const apiUrl = `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${repoInfo.path}?ref=${repoInfo.branch}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("Failed to fetch repo contents");
    return res.json();
  }

  function createTreeItem(
    item: RepoItem,
    repoInfo: RepoInfo
  ): HTMLElement {
    const li = document.createElement("li");
    li.style.cursor = "pointer";

    if (item.type === "dir") {
      li.style.fontWeight = "bold";

      // Create an image element for the folder icon
      const img = document.createElement("img");
      img.src = chrome.runtime.getURL("svg/folder.svg");
      img.alt = "folder icon";
      img.style.width = "16px";
      img.style.height = "16px";
      img.style.marginRight = "6px";
      img.style.verticalAlign = "middle";

      // Insert the image before the text
      li.appendChild(img);
      li.appendChild(document.createTextNode(item.name));

      li.addEventListener("click", () => {
        if (window.top) {
          window.top.location.href = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/tree/${repoInfo.branch}/${item.path}`;
        }
      });
    } else {
      li.textContent = item.name;

      li.addEventListener("click", () => {
        if (window.top) {
          window.top.location.href = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/blob/${repoInfo.branch}/${item.path}`;
        }
      });
    }

    return li;
  }

  async function refreshSidebar() {
    const repoInfo = parseOwnerRepoBranchPath(window.location.href);
    if (!repoInfo) {
      sidebarRoot.textContent = '';
      sidebarRoot.style.display = "none";
      return;
    }

    sidebarRoot.textContent = "Loading repository...";

    try {
      if (!repoInfo.path) {
        repoInfo.branch = await fetchDefaultBranch(repoInfo.owner, repoInfo.repo);
      }

      sidebarRoot.style.display = "block";

      const contents = await fetchRepoContents(repoInfo);

      // hide the sidebar if there are no contents
      if (!contents || contents.length === 0) {
        sidebarRoot.textContent = '';
        sidebarRoot.style.display = "none";
        return;
      }

      sidebarRoot.style.display = "block";
      sidebarRoot.textContent = '';
      const ul = document.createElement("ul");
      contents.forEach(item => ul.appendChild(createTreeItem(item, repoInfo)));
      sidebarRoot.appendChild(ul);
    } catch (e) {
      console.error(e);
      sidebarRoot.style.display = "none";
    }
  }

  let lastUrl = '';

  async function pollUrlChange() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      await refreshSidebar();
    }
  }

  await refreshSidebar();
  setInterval(pollUrlChange, 1000);
}
