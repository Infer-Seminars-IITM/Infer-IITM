const basePath = window.location.pathname.endsWith("/")
  ? window.location.pathname
  : window.location.pathname + "/";

fetch(basePath + "seminars.json")
  .then(res => {
    if (!res.ok) {
      throw new Error("Cannot load seminars.json");
    }
    return res.json();
  })
  .then(data => {
    const container = document.getElementById("seminarContainer");
    container.innerHTML = "";

    data.seminars.forEach(seminar => {
      const card = document.createElement("div");
      card.className = "seminar-card";

      card.innerHTML = `
        <img src="${basePath + seminar.photo}" class="speaker-photo" alt="${seminar.speaker}">
        <h3>${seminar.name}</h3>
        <p><strong>Speaker:</strong> ${seminar.speaker}</p>
        <p><strong>Date:</strong> ${new Date(seminar.date).toLocaleString()}</p>
        <p>${seminar.short_abstract}</p>
        <p><em>Click to read more</em></p>
      `;

      card.onclick = () => openModal(seminar, basePath);
      container.appendChild(card);
    });
  })
  .catch(err => {
    document.getElementById("seminarContainer").innerHTML =
      "<p style='color:red'>Error loading seminars.json. Check console (F12).</p>";
  });

function openModal(seminar, basePath) {
  document.getElementById("modalTitle").innerText = seminar.name;
  document.getElementById("modalSpeaker").innerText = "Speaker: " + seminar.speaker;
  document.getElementById("modalDate").innerText =
    "Date: " + new Date(seminar.date).toLocaleString();
  document.getElementById("modalVenue").innerText = "Venue: " + seminar.venue;
  document.getElementById("modalFull").innerText = seminar.full_content;

  const linksDiv = document.getElementById("modalLinks");
  linksDiv.innerHTML = `
    <h4>Links</h4>
    <ul>
      <li><a href="${seminar.links.homepage}" target="_blank">Homepage</a></li>
      <li><a href="${seminar.links.google_scholar}" target="_blank">Google Scholar</a></li>
      <li><a href="${seminar.links.zoom}" target="_blank">Join Zoom</a></li>
    </ul>
  `;

  document.getElementById("seminarModal").classList.add("active");
}

function closeModal() {
  document.getElementById("seminarModal").classList.remove("active");
}
