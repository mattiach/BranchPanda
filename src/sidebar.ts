import { RepoInfo, RepoItem } from "./interfaces/const";

const mainContent = document.querySelector(".application-main") as HTMLElement | null;

export async function initSidebar(container: HTMLElement) {
  const sidebarRoot = container;

  function parseOwnerRepoBranch(url: string) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split("/").filter(Boolean);

      if (parts.length < 2) return null;

      const owner = parts[0];
      const repo = parts[1];
      let branch = "main";

      if (parts.length >= 4 && (parts[2] === "tree" || parts[2] === "blob")) {
        branch = parts[3];
      }

      return { owner, repo, branch };
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

  function createTreeItem(item: RepoItem, repoInfo: RepoInfo): HTMLElement {
    const li = document.createElement("li");
    li.style.cursor = "pointer";
    li.style.userSelect = "none";
    li.style.listStyleType = "none";

    if (item.type === "dir") {
      li.style.fontWeight = "bold";

      const img = document.createElement("img");
      img.src = chrome.runtime.getURL("svg/folder.svg");
      img.alt = "folder icon";
      img.style.width = "1em";
      img.style.height = "1em";
      img.style.marginRight = "0.375em";
      img.style.verticalAlign = "middle";
      img.style.transition = "transform 0.2s ease";

      li.appendChild(img);
      li.appendChild(document.createTextNode(item.name));

      const childContainer = document.createElement("ul");
      childContainer.style.display = "none";
      childContainer.style.paddingLeft = "1em";
      li.appendChild(childContainer);

      let expanded = false;

      li.addEventListener("click", async (event) => {
        event.stopPropagation();

        if (expanded) {
          childContainer.style.display = "none";
          expanded = false;
          img.style.transform = "rotate(0deg)";
        } else {
          img.style.transform = "rotate(90deg)";

          if (childContainer.childElementCount === 0) {
            try {
              const subRepoInfo = {
                owner: repoInfo.owner,
                repo: repoInfo.repo,
                branch: repoInfo.branch,
                path: item.path,
              };
              const subContents = await fetchRepoContents(subRepoInfo);
              subContents.forEach(subItem => {
                childContainer.appendChild(createTreeItem(subItem, subRepoInfo));
              });
            } catch (e) {
              console.error("Failed to load folder contents", e);
            }
          }

          childContainer.style.display = "block";
          expanded = true;
        }
      });
    } else {
      li.style.fontWeight = "normal";
      li.style.fontSize = "0.875rem";
      li.style.whiteSpace = "nowrap";
      li.style.overflow = "hidden";
      li.style.textOverflow = "ellipsis";
      li.style.maxWidth = "12em";
      li.textContent = item.name;
      li.title = item.name

      li.addEventListener("click", () => {
        if (window.top) {
          window.top.location.href = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/blob/${repoInfo.branch}/${item.path}`;
        }
      });
    }

    return li;
  }

  let currentRepoKey = '';

  async function refreshSidebar() {
    const parsed = parseOwnerRepoBranch(window.location.href);
    if (!parsed) {
      sidebarRoot.style.display = "none";
      if (mainContent) {
        mainContent.style.marginLeft = "0";
      }
      return;
    }

    // Keep the path always at root
    const repoInfo: RepoInfo = {
      owner: parsed.owner,
      repo: parsed.repo,
      branch: parsed.branch,
      path: "",
    };

    // Avoid reloading sidebar if still in the same repo
    const newRepoKey = `${repoInfo.owner}/${repoInfo.repo}`;
    if (newRepoKey === currentRepoKey) return;
    currentRepoKey = newRepoKey;

    sidebarRoot.style.display = "block";
    sidebarRoot.textContent = "Loading.. 🐼";

    try {
      // Get default branch if not specified
      if (!repoInfo.branch) {
        repoInfo.branch = await fetchDefaultBranch(repoInfo.owner, repoInfo.repo);
      }

      const contents = await fetchRepoContents(repoInfo);
      if (!contents || contents.length === 0) {
        sidebarRoot.textContent = "The repository is empty 🐼";
        return;
      }

      sidebarRoot.textContent = "";
      const ul = document.createElement("ul");
      contents.forEach(item => ul.appendChild(createTreeItem(item, repoInfo)));
      sidebarRoot.appendChild(ul);
    } catch (e) {
      console.error(e);
      sidebarRoot.style.display = "none";
    }
  }

  let lastUrl = "";

  async function pollUrlChange() {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      await refreshSidebar();
    }
  }

  await refreshSidebar();
  setInterval(pollUrlChange, 1000);
}
