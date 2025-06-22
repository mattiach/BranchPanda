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

  async function createTreeItemWithExpand(item: RepoItem, repoInfo: RepoInfo, currentPathParts: string[]): Promise<HTMLElement> {
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
      childContainer.style.paddingLeft = "1em";
      li.appendChild(childContainer);

      let expanded = false;

      const itemPathParts = item.path.split("/");

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
              for (const subItem of subContents) {
                const subChild = await createTreeItemWithExpand(subItem, subRepoInfo, currentPathParts);
                childContainer.appendChild(subChild);
              }
            } catch (e) {
              console.error("Failed to load folder contents", e);
            }
          }
          childContainer.style.display = "block";
          expanded = true;
        }
      });

      if (currentPathParts.length > 0 && item.path === currentPathParts.slice(0, item.path.split("/").length).join("/")) {
        img.style.transform = "rotate(90deg)";
        expanded = true;
        try {
          const subRepoInfo = {
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            branch: repoInfo.branch,
            path: item.path,
          };
          const subContents = await fetchRepoContents(subRepoInfo);
          for (const subItem of subContents) {
            const subChild = await createTreeItemWithExpand(subItem, subRepoInfo, currentPathParts);
            childContainer.appendChild(subChild);
          }
          childContainer.style.display = "block";
        } catch (e) {
          console.error("Failed to load folder contents", e);
        }
      } else {
        childContainer.style.display = "none";
      }
    } else {
      li.style.fontWeight = "normal";
      li.style.fontSize = "0.875rem";
      li.style.whiteSpace = "nowrap";
      li.style.overflow = "hidden";
      li.style.textOverflow = "ellipsis";
      li.style.maxWidth = "12em";
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
    let repoInfo = parseOwnerRepoBranchPath(window.location.href);
    if (!repoInfo) {
      const match = window.location.pathname.match(/^\/([^/]+)\/([^/]+)\/?$/);
      if (match) {
        const [, owner, repo] = match;
        repoInfo = {
          owner,
          repo,
          branch: '',
          path: '',
        };
      } else {
        sidebarRoot.textContent = '';
        sidebarRoot.style.display = "none";
        return;
      }
    }

    sidebarRoot.textContent = "Loading repository...";

    try {
      if (!repoInfo.branch) {
        repoInfo.branch = await fetchDefaultBranch(repoInfo.owner, repoInfo.repo);
      }

      const rootRepoInfo = {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        branch: repoInfo.branch,
        path: '',
      };

      const contents = await fetchRepoContents(rootRepoInfo);

      if (!contents || contents.length === 0) {
        sidebarRoot.textContent = '';
        sidebarRoot.style.display = "none";
        return;
      }

      sidebarRoot.textContent = '';

      const currentPathParts = repoInfo.path ? repoInfo.path.split("/") : [];

      const ul = document.createElement("ul");

      for (const item of contents) {
        const li = await createTreeItemWithExpand(item, rootRepoInfo, currentPathParts);
        ul.appendChild(li);
      }

      sidebarRoot.innerHTML = '';
      sidebarRoot.appendChild(ul);
      sidebarRoot.style.display = "block";

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
