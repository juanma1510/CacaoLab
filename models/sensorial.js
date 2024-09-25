document
.getElementById("data-form")
.addEventListener("submit", function (event) {
  event.preventDefault();
  let form = document.getElementById("data-form");
  let formData = new FormData(form);

  // Check if any value is different from 0
  let values = Array.from(formData.values());
  if (values.some((value) => value === "0")) {
    alert("llena todas las categorias");
    return;
  }

  fetch("http://localhost:5000/generate_graphs_spider", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      let graficosDiv = document.querySelector(".graficos");
      graficosDiv.innerHTML = "";
      data.forEach((url) => {
        let img = document.createElement("img");
        img.src = url;
        img.className = "grafico";
        graficosDiv.appendChild(img);
      });
      const botonPDF = document.getElementById("download");
      if (botonPDF) {
        botonPDF.style.display = "block";
      }
    })
    .catch((error) => console.error("Error:", error));
});