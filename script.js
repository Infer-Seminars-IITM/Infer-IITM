const basePath = window.location.pathname.endsWith("/")
  ? window.location.pathname
  : window.location.pathname + "/";

const dateOpts = {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
};

let seminarsData = [];
const container = document.getElementById("seminarContainer");
const searchInput = document.getElementById("seminarSearch");
const searchCount = document.getElementById("searchCount");
const featuredDiv = document.getElementById("featuredSeminar");

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function safeAbstract(text = "") {
  const truncated = text.length > 300 ? text.slice(0, 300) + "…" : text;
  return escapeHtml(truncated);
}


function renderSeminars(list = []) {
  if (!container) return;
  container.innerHTML = "";

  if (!list.length) {
    container.innerHTML = "<p class='no-results'>No seminars match your search.</p>";
    return;
  }

  list.forEach(seminar => {
    const card = document.createElement("div");
    card.className = "seminar-card";
    card.innerHTML = `
      <div class="card-left">
        <h3>${seminar.name}</h3>
        <p class="card-date">${new Date(seminar.date).toLocaleString(undefined, dateOpts)}</p>
        <p class="card-abstract clamp" data-full="${escapeHtml(seminar.short_abstract)}">
          ${safeAbstract(seminar.short_abstract)}
        </p>
        <button class="read-more" type="button">Read more</button>
      </div>
      <div class="card-right">
        <a href="${seminar.speaker_url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
          <img src="${basePath + seminar.photo}" class="speaker-photo" alt="${seminar.speaker}" loading="lazy">
        </a>
        <div class="card-speaker">${seminar.speaker}</div>
        <div class="card-actions">
          ${seminar.youtube_url ? `<a class="youtube-cta" href="${seminar.youtube_url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="Watch">▶</a>` : ""}
          ${seminar.notes_url ? `<a class="notes-cta" href="${seminar.notes_url}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" title="View Notes">📄</a>` : ""}
        </div>
      </div>
    `;

    const readBtn = card.querySelector(".read-more");
    readBtn.addEventListener("click", e => {
      e.stopPropagation();
      openModal(seminar, basePath);
    });

    container.appendChild(card);
  });
}

function applySearch() {
  const term = (searchInput?.value || "").trim().toLowerCase();
  const filtered = term
    ? seminarsData.filter(s => [s.name, s.speaker, s.venue, s.short_abstract]
        .some(field => (field || "").toLowerCase().includes(term)))
    : seminarsData;

  renderSeminars(filtered);
  if (searchCount) {
    searchCount.textContent = term ? `${filtered.length} match${filtered.length === 1 ? "" : "es"}` : "";
  }
}

fetch(basePath + "data/seminars.json")
  .then(res => {
    if (!res.ok) {
      throw new Error("Cannot load seminars.json");
    }
    return res.json();
  })
  .then(data => {
    // most recent seminar
    const featured = data.seminars[0];

    featuredDiv.innerHTML = `
      <img 
        src="${basePath + featured.thumbnail}" 
        class="featured-poster"
        alt="Seminar Poster"
      >

      <div class="featured-content">
        <div class="featured-title">${featured.name}</div>

        <a 
          class="featured-speaker"
          href="${featured.speaker_url}"
          target="_blank"
          onclick="event.stopPropagation()"
        >
          <img 
            src="${basePath + featured.photo}" 
            alt="${featured.speaker}">
          <div>
            <strong>${featured.speaker}</strong>
            <div class="featured-meta">
              ${featured.profile}
              ${new Date(featured.date).toLocaleString()} · ${featured.venue}
            </div>
          </div>
        </a>

        ${featured.youtube_url
        ? `<a
            href="${featured.youtube_url}"
            target="_blank"
            class="youtube-cta"
            onclick="event.stopPropagation()"
          >
            ▶ YouTube
          </a>`
        : ""
        }

        <div class="featured-abstract">
          ${featured.short_abstract}
        </div>
        <span class="read-more">Read more ▾</span>
      </div>
    `;
    
    // modal opening
    const poster = featuredDiv.querySelector(".featured-poster");
    poster.addEventListener("click", () => openModal(featured, basePath));

    // readmore
    featuredDiv.querySelector(".read-more").onclick = function() {
      const abs = featuredDiv.querySelector(".featured-abstract");
      abs.classList.toggle("expanded");

      this.textContent =
        abs.classList.contains("expanded")
          ? "Read less ▲"
          : "Read more ▾";
    };

    // seminar cards
    seminarsData = data.seminars;
    seminarsData.forEach(seminar => { // reading data into cache in idle time 
      seminar.images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    });
    renderSeminars(seminarsData);
    if (searchInput) {
      searchInput.addEventListener("input", applySearch);
    }
  })
  .catch(err => {
    document.getElementById("seminarContainer").innerHTML =
      "<p style='color:red'>Error loading seminars.json. Check console (F12).</p>";
  });


function openModal(seminar) {
  const pdfScroll = document.getElementById("pdfScroll");
  pdfScroll.innerHTML = "";

  seminar.images.forEach(src => {
    const img = document.createElement("img");
    img.loading = "lazy"; //load progressively instead of blocking
    img.src = src;
    pdfScroll.appendChild(img);
  });

  document.getElementById("youtubeLink").href = seminar.youtube_url;
  document.getElementById("seminarModal").classList.add("active");
}

function closeModal() {
  document.getElementById("seminarModal").classList.remove("active");
}

document.getElementById("seminarModal").addEventListener("click", closeModal);
document.querySelector(".modal-content").addEventListener("click", e => {
  e.stopPropagation();
});

// Ensure hash navigation (e.g., #seminars) scrolls after content loads
function scrollToHash() {
  const id = window.location.hash ? window.location.hash.slice(1) : "";
  if (!id) return;
  const target = document.getElementById(id);
  if (target) {
    // slight delay to allow layout/render to settle
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}

window.addEventListener("load", scrollToHash);
window.addEventListener("hashchange", scrollToHash);
