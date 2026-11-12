import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const Root = new URL("../", import.meta.url),
  Index = new URL("index.html", Root),
  Snapshot = new URL("assets/libraries/stars.json", Root),
  Html = readFileSync(Index, "utf8"),
  Pattern = /<span class="project-stars" data-repo="([^"]+)"[^\n]*<\/span>/g,
  Repositories = [...Html.matchAll(Pattern)].map((match) => match[1]);

if (Repositories.length === 0 ||
    new Set(Repositories).size !== Repositories.length) {
  throw new Error("Expected a unique GitHub repository on every star count.");
}
for (const repo of Repositories) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new Error(`Invalid GitHub repository: ${repo}`);
  }
}

const Fields = Repositories.map((repo, i) => {
  const [owner, name] = repo.split("/");
  return `repo${i}: repository(owner: ${JSON.stringify(owner)}, ` +
    `name: ${JSON.stringify(name)}) { nameWithOwner stargazerCount url }`;
}),
  Response = JSON.parse(execFileSync("gh", [
    "api", "graphql", "-f", `query={ ${Fields.join("\n")} }`
  ], { encoding: "utf8", cwd: fileURLToPath(Root) }));

if (Response.errors) {
  throw new Error(`GitHub query failed: ${JSON.stringify(Response.errors)}`);
}

const FetchedAt = new Date().toISOString(),
  Results = Repositories.map((repo, i) => {
    const result = Response.data?.[`repo${i}`];
    if (result?.nameWithOwner.toLowerCase() !== repo.toLowerCase() ||
        !Number.isSafeInteger(result.stargazerCount) ||
        result.stargazerCount < 0) {
      throw new Error(`Missing or invalid GitHub star count for ${repo}.`);
    }
    return { repo, stars: result.stargazerCount, url: result.url };
  }),
  Counts = new Map(Results.map((item) => [item.repo, item.stars])),
  Updated = Html.replace(Pattern, (_, repo) => {
    const count = Counts.get(repo).toLocaleString("en-US"),
      title = `${count} GitHub stars. Updated ${FetchedAt.slice(0, 10)}.`;
    return `<span class="project-stars" data-repo="${repo}" ` +
      `title="${title}"><span aria-hidden="true">★</span> ${count}` +
      `<span class="sr-only"> GitHub stars</span></span>`;
  });

writeFileSync(Index, Updated);
writeFileSync(Snapshot, JSON.stringify({
  fetchedAt: FetchedAt, repositories: Results
}, null, 2) + "\n");
console.log(`Updated GitHub star counts for ${Results.length} libraries.`);
