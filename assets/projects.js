const Search = document.querySelector("#project-search"),
  Filters = [...document.querySelectorAll(".filter")],
  Projects = [...document.querySelectorAll(".project")],
  Count = document.querySelector("#project-count"),
  Empty = document.querySelector("#empty-state");

/** Filter the existing HTML so projects also work without JavaScript. */
function filterProjects() {
  const Query = Search.value.trim().toLowerCase(),
    Category = document.querySelector('.filter[aria-pressed="true"]')
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
    ? `${Projects.length} projects`
    : `${visible} of ${Projects.length} projects`;
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
document.querySelector("#clear-search").addEventListener("click", () => {
  Search.value = "";
  Filters[0].click();
  Search.focus();
});
document.querySelector("#catalog-tools").hidden = false;
filterProjects();
