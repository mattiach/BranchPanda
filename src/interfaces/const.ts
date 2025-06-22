export interface RepoItem {
  name: string;
  path: string;
  type: "file" | "dir";
  url: string;
};

export interface RepoInfo {
  owner: string,
  repo: string,
  path: string,
  branch: string
};