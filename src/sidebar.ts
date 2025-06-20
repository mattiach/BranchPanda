import { RepoItem } from "./interfaces/const";

const sidebarRoot = document.getElementById("sidebar-root")!;

async function fetchRepoContents(owner: string, repo: string, path = ""): Promise<RepoItem[]> {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("Failed to fetch repo contents");
  return res.json();
}

function createTreeItem(item: RepoItem, owner: string, repo: string): HTMLElement {
  const li = document.createElement("li");
  li.textContent = item.name;
  li.style.cursor = "pointer";

  if (item.type === "dir") {
    li.style.fontWeight = "bold";
    li.addEventListener("click", async () => {
      if (li.querySelector("ul")) {
        const ul = li.querySelector("ul")!;
        ul.style.display = ul.style.display === "none" ? "block" : "none";
      } else {
        try {
          const children = await fetchRepoContents(owner, repo, item.path);
          const ul = document.createElement("ul");
          children.forEach(child => ul.appendChild(createTreeItem(child, owner, repo)));
          li.appendChild(ul);
        } catch {
          alert("Failed to load directory contents");
        }
      }
    });
  } else {
    li.addEventListener("click", () => {
      window.open(`https://github.com/${owner}/${repo}/blob/main/${item.path}`, "_blank");
    });
  }

  return li;
}

function getPageUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("pageUrl");
}

function parseOwnerRepoFromUrl(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/^\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

async function init() {
  const pageUrl = getPageUrl();
  if (!pageUrl) {
    sidebarRoot.textContent = "Missing page URL";
    return;
  }
  const repoInfo = parseOwnerRepoFromUrl(pageUrl);
  if (!repoInfo) {
    return;
  }

  sidebarRoot.textContent = "Loading repository...";
  try {
    const rootContents = await fetchRepoContents(repoInfo.owner, repoInfo.repo);
    sidebarRoot.textContent = "";
    const ul = document.createElement("ul");
    rootContents.forEach(item => ul.appendChild(createTreeItem(item, repoInfo.owner, repoInfo.repo)));
    sidebarRoot.appendChild(ul);
  } catch {
    sidebarRoot.textContent = "Failed to load repository contents";
  }
}

init();
