// Cerrar el modal cuando el usuario haga clic fuera de él
window.onclick = function (event) {
  let modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
};

let currentSection = "";
let currentParam = "";
let currentParamIndex = 0;
let parameters = [];

function openModal(seccion, parametro) {
  currentSection = seccion;
  currentParam = parametro;
  document.getElementById(
    "modal-titulo"
  ).innerText = `Agregar Valor a ${seccion}-${parametro}`;
  document.getElementById("modal").style.display = "block";
  $("#valor-input").focus();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function agregarValor() {
  let valorInput = document.getElementById("valor-input");

  valorInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent default action if it's part of a form

      // Check if the input is empty
      if (valorInput.value.trim() === "") {
        // Assuming your modal has an ID of 'modal'
        document.getElementById("modal").style.display = "none";
      } else {
        // Existing logic to save the value
        if (currentSection === "Molienda") {
          agregarValorMolienda();
        } else {
          let valor = valorInput.value;
          // Validar que el valor sea numérico
          if (/^-?\d+(\.\d+)?$/.test(valor.trim())) {
            let container = document.getElementById(
              `${currentSection}_${currentParam}_container`
            );
            let input = document.createElement("input");
            input.type = "hidden";
            input.name = `${currentSection}_${currentParam}`;
            input.value = valor;
            container.appendChild(input);
            displayNumericValue(Number(valor));
            valorInput.value = "";
            nextParameter(); // Move to the next parameter
          } else {
            alert("Por favor, ingrese un valor numérico válido.");
          }
        }
      }
      valorInput.focus();
    }
  });
}

function displayNumericValue(value) {
  const container = document.getElementById(
    `list_${currentSection}_${currentParam}_container`
  );
  let list = document.createElement("ul");
  let listItem = document.createElement("li");
  if (Number.isInteger(value)) {
    listItem.innerText = value.toLocaleString(); // Display numeric value with commas
  } else {
    listItem.innerText = `${value.toLocaleString().replace(",", ".")}`; // Display float value with parentheses and commas
  }
  list.appendChild(listItem);
  container.appendChild(list);
      }

      function agregarValorMolienda() {
        let valor = document.getElementById("valor-input").value.toLowerCase();
        if (valor === "gruesa" || valor === "media" || valor === "fina") {
          let container = document.getElementById(
        "Molienda_molienda_container"
          );
          let input = document.createElement("input");
          input.type = "hidden";
          input.name = "Molienda_molienda";
          input.value = valor;
          container.appendChild(input);
          let span = document.createElement("span");
          span.innerText = valor;
          container.appendChild(span);
          container.appendChild(document.createElement("br"));
          document.getElementById("valor-input").value = "";
          nextParameter(); // Move to the next parameter
        } else {
          alert(
        "Por favor ingrese un valor válido para molienda (gruesa, media, fina)."
          );
        }
      }



      document.addEventListener("DOMContentLoaded", function () {
        const botonPDF = document.getElementById("download");
        const loader = document.getElementById("loader");

        if (botonPDF) {
          botonPDF.onclick = function () {
        const form = document.getElementById("data-form");
        const formData = new FormData(form);

        fetch("http://localhost:5000/generate_pdf", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.blob())
          .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = "graficos.pdf";
            document.body.appendChild(a);

            loader.style.display = "block"; // Mostrar loader justo antes de iniciar la descarga

            setTimeout(() => {
          a.click(); // Descargar el archivo después del retraso
          loader.style.display = "none"; // Ocultar loader después de iniciar la descarga
          window.URL.revokeObjectURL(url);
            }, 800); // Retraso de 3 segundos (3000 milisegundos)
          })
          .catch((error) => {
            console.error("Error:", error);
            loader.style.display = "none"; // Ocultar loader en caso de error
          });
          };
        } else {
          console.error('No se encontró el elemento con id "boton-pdf"');
        }
      });

      function validateContainersAndGenerateGraphs() {
        // Obtenemos todos los divs con la clase 'listValues'
        const containers = document.querySelectorAll('.listValues');
        let allFilled = true; // Variable para verificar si todos los contenedores están llenos
      
        containers.forEach(container => {
          // Verificamos si el contenedor tiene elementos hijos
          if (container.children.length === 0) {
            allFilled = false; // Si no tiene hijos, el contenedor está vacío
          }
        });
      
        if (allFilled) {
          // Si todos los contenedores tienen valores, llamamos a generarGraficos()
          generarGraficos();
        } else {
          // Si algún contenedor está vacío, mostramos una alerta
          alert('Por favor, completa todos los parámetros antes de generar los gráficos.');
        }
      }

      function generarGraficos() {

        let form = document.getElementById("data-form");
        let formData = new FormData(form);

        fetch("http://localhost:5000/generate_graphs", {
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
      }
      function agregarValor() {
        let valor = document.getElementById("valor-input").value;
        // Validar que el valor sea numérico
        if (/^-?\d+(\.\d+)?$/.test(valor.trim())) {
          let container = document.getElementById(
            `${currentSection}_${currentParam}_container`
          );
          let input = document.createElement("input");
          input.type = "hidden";
          input.name = `${currentSection}_${currentParam}`;
          input.value = valor;
          container.appendChild(input);
          displayNumericValue(Number(valor));
          document.getElementById("valor-input").value = "";
        } else {
          alert("Por favor, ingrese un valor numérico válido.");
        }
      }

      


      function agregarValorMolienda() {
        let valor = document.getElementById("valor-input").value.toLowerCase();
        if (valor === "gruesa" || valor === "media" || valor === "fina") {
          let container = document.getElementById(
            "Molienda_molienda_container"
          );
          let input = document.createElement("input");
          input.type = "hidden";
          input.name = "Molienda_molienda";
          input.value = valor;
          container.appendChild(input);
          let span = document.createElement("span");
          span.innerText = valor;
          container.appendChild(span);
          container.appendChild(document.createElement("br"));
          document.getElementById("valor-input").value = "";
        } else {
          alert(
            "Por favor ingrese un valor válido para molienda (gruesa, media, fina)."
          );
        }
      }

      document.addEventListener("DOMContentLoaded", function () {
        var valorInput = document.getElementById("valor-input");

        valorInput.addEventListener("keypress", function (event) {
          if (event.key === "Enter") {
            event.preventDefault(); // Prevent default action if it's part of a form

            // Check if the input is empty
            if (valorInput.value.trim() === "") {
              // Assuming your modal has an ID of 'modal'
              document.getElementById("modal").style.display = "none";
            } else {
              // Existing logic to save the value
              if (currentSection === "Molienda") {
                agregarValorMolienda();
              } else {
                agregarValor();
              }
            }
            valorInput.focus();
          }
        });
      });

      document.addEventListener("DOMContentLoaded", function () {
        const botonPDF = document.getElementById("download");
        const loader = document.getElementById("loader");

        if (botonPDF) {
          botonPDF.onclick = function () {
            const form = document.getElementById("data-form");
            const formData = new FormData(form);

            fetch("http://localhost:5000/generate_pdf", {
              method: "POST",
              body: formData,
            })
              .then((response) => response.blob())
              .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = "graficos.pdf";
                document.body.appendChild(a);

                loader.style.display = "block"; // Mostrar loader justo antes de iniciar la descarga

                setTimeout(() => {
                  a.click(); // Descargar el archivo después del retraso
                  loader.style.display = "none"; // Ocultar loader después de iniciar la descarga
                  window.URL.revokeObjectURL(url);
                }, 800); // Retraso de 3 segundos (3000 milisegundos)
              })
              .catch((error) => {
                console.error("Error:", error);
                loader.style.display = "none"; // Ocultar loader en caso de error
              });
          };
        } else {
          console.error('No se encontró el elemento con id "boton-pdf"');
        }
      });
function validateContainersAndGenerateGraphs() {
  // Obtenemos todos los divs con la clase 'listValues'
  const containers = document.querySelectorAll('.listValues');
  let emptyContainers = []; // Arreglo para almacenar contenedores vacíos

  containers.forEach(container => {
    // Ignoramos el contenedor de 'Molienda'
    if (container.id === 'list_Molienda_molienda_container') {
      return;
    }
    // Verificamos si el contenedor está vacío (sin hijos)
    if (container.children.length === 0) {
      emptyContainers.push(container.id); // Agregamos el contenedor vacío al arreglo
    }
  });

  if (emptyContainers.length > 0) {
    // Si hay contenedores vacíos, mostramos una alerta
    alert('Tienes parámetros sin valores, complétalos por favor.');
  } else {
    // Si todos los contenedores están llenos, llamamos a la función para generar gráficos
    generarGraficos();
  }
}
      function generarGraficos() {

        let form = document.getElementById("data-form");
        let formData = new FormData(form);

        fetch("http://localhost:5000/generate_graphs", {
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
      }