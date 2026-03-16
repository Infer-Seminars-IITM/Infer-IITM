const basePath = window.location.pathname.endsWith("/")
  ? window.location.pathname + "../"
  : window.location.pathname + "/../";

async function loadTeam() {
  try {
    const response = await fetch(basePath + "data/team.json");
    const team = await response.json();

    const facultyDiv = document.getElementById("facultyContainer");
    const studentDiv = document.getElementById("studentContainer");

    team
      .filter(m => m.category === "faculty")
      .slice(0, 2)
      .forEach(member => facultyDiv.appendChild(makeCard(member)));

    team
      .filter(m => m.category === "student")
      .slice(0, 3)
      .forEach(member => studentDiv.appendChild(makeCard(member)));
  } catch (err) {
    console.error("Error loading team:", err);
  }
}

function makeCard(member) {
  const card = document.createElement(member.url ? "a" : "div");
  card.className = "team-card";
  if (member.url) {
    card.href = member.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
  }
  card.innerHTML = `
    <div class="team-image-wrapper">
      <img src="${basePath + member.image}" alt="${member.name}">
      <div class="team-overlay">
        <h4>${member.name}</h4>
        <p>${member.title}</p>
      </div>
    </div>
  `;
  return card;
}

document.addEventListener("DOMContentLoaded", loadTeam);
