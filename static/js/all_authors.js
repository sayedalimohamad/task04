document.addEventListener("DOMContentLoaded", function () {
  const selectElement = document.getElementById("authorSelector");
  const allAuthorsDiv = document.getElementById("all_authors");
  let table = allAuthorsDiv.querySelector("table");
  
  if (!table) {
    table = document.createElement("table");
    table.className = "table table-success table-striped-columns";
    table.innerHTML = `
      <thead>
      </thead>
      <tbody></tbody>
    `;
    allAuthorsDiv.appendChild(table);
  }

  let paginationDiv = document.createElement("div");
  paginationDiv.className = "d-flex justify-content-center mt-3";
  paginationDiv.style.position = "fixed";
  paginationDiv.style.bottom = "5px";
  paginationDiv.style.left = "50%";
  paginationDiv.style.transform = "translateX(-50%)";
  allAuthorsDiv.appendChild(paginationDiv);

  fetch("/all_authors")
    .then((response) => response.json())
    .then((authors) => {
      authors.forEach((author) => {
        const option = document.createElement("option");
        option.value = author._id;
        option.textContent = author._id + " : " + author.count;
        selectElement.appendChild(option);
      });
      selectElement.addEventListener("change", (event) => {
        const selectedAuthorId = event.target.value;
        if (selectedAuthorId) {
          fetchAndDisplayAuthorDetails(selectedAuthorId, 1);
        }
      });

      function fetchAndDisplayAuthorDetails(authorId, currentPage) {
        fetch(`/articles_by_author/${authorId}`)
          .then((response) => response.json())
          .then((data) => {
            const itemsPerPage = 9;
            const totalPages = Math.ceil(data.length / itemsPerPage);
            const maxVisiblePages = 5;
            let startPage = Math.max(currentPage - 2, 1);
            let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
            if (endPage - startPage < maxVisiblePages - 1) {
              startPage = Math.max(endPage - maxVisiblePages + 1, 1);
            }
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const tbody = table.querySelector("tbody");
            tbody.innerHTML = "";
            data.slice(startIndex, endIndex).forEach((item, index) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td class="right-align" title="Published: ${item.published_time}\nLast Updated: ${item.last_updated}">
                  <a href="${item.url}" target="_blank">${item.title}</a>
                </td>
                <td class="right-align" title="Published: ${item.published_time}\nLast Updated: ${item.last_updated}">
                  <a href="${item.url}" target="_blank" style="color: #000000;">${startIndex + index + 1}</a>
                </td>
              `;
              tbody.appendChild(row);
            });

            paginationDiv.innerHTML = "";
            let paginationList = document.createElement("ul");
            paginationList.className = "pagination";
            paginationDiv.appendChild(paginationList);

            let prevButton = document.createElement("li");
            prevButton.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
            prevButton.innerHTML = `
              <a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>
            `;
            prevButton.addEventListener("click", (e) => {
              e.preventDefault();
              if (currentPage > 1)
                fetchAndDisplayAuthorDetails(authorId, currentPage - 1);
            });
            paginationList.appendChild(prevButton);

            for (let i = startPage; i <= endPage; i++) {
              let pageButton = document.createElement("li");
              pageButton.className = `page-item ${i === currentPage ? "active" : ""}`;
              pageButton.innerHTML = `<a class="page-link" href="#">${i}</a>`;
              pageButton.addEventListener("click", (e) => {
                e.preventDefault();
                fetchAndDisplayAuthorDetails(authorId, i);
              });
              paginationList.appendChild(pageButton);
            }

            let nextButton = document.createElement("li");
            nextButton.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
            nextButton.innerHTML = `
              <a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>
            `;
            nextButton.addEventListener("click", (e) => {
              e.preventDefault();
              if (currentPage < totalPages)
                fetchAndDisplayAuthorDetails(authorId, currentPage + 1);
            });
            paginationList.appendChild(nextButton);
          })
          .catch((error) => {
            console.error(`Error fetching details for author ${authorId}:`, error);
          });
      }
    })
    .catch((error) => {
      console.error("Error fetching authors:", error);
    });
});
