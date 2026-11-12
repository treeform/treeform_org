const Search = document.querySelector("#libraries #project-search"),
  Filters = [...document.querySelectorAll("#libraries .filter")],
  Projects = [...document.querySelectorAll("#libraries .project")],
  Count = document.querySelector("#libraries #project-count"),
  Empty = document.querySelector("#libraries #empty-state");

/** Filter the existing HTML so libraries also work without JavaScript. */
function filterProjects() {
  const Query = Search.value.trim().toLowerCase(),
    Category = document.querySelector('#libraries .filter[aria-pressed="true"]')
      .dataset.category;
  let visible = 0;
  for (const project of Projects) {
    const MatchesCategory = Category === "all" ||
      project.dataset.category === Category,
      MatchesQuery = (project.textContent + " " + project.dataset.search)
        .toLowerCase().includes(Query);
    project.hidden = !(MatchesCategory && MatchesQuery);
    if (!project.hidden) {
      visible++;
    }
  }
  Count.textContent = visible === Projects.length
    ? `${Projects.length} libraries`
    : `${visible} of ${Projects.length} libraries`;
  Empty.hidden = visible > 0;
}
for (const filter of Filters) {
  filter.addEventListener("click", () => {
    for (const button of Filters) {
      button.setAttribute("aria-pressed", String(button === filter));
    }
    filterProjects();
  });
}
Search.addEventListener("input", filterProjects);
document.querySelector("#libraries #clear-search").addEventListener("click", () => {
  Search.value = "";
  Filters[0].click();
  Search.focus();
});
document.querySelector("#libraries #catalog-tools").hidden = false;
filterProjects();
