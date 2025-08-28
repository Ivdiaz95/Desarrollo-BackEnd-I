document.addEventListener("DOMContentLoaded", (event) => {
  // Conectar con el servidor de Websockets
  const socket = io();

  // Obtener los elementos del DOM
  const productsList = document.getElementById("products-list");
  const productForm = document.getElementById("product-form");

  // Escuchar el evento de actualización de productos desde el servidor
  socket.on("products-update", (products) => {
    console.log("Productos actualizados recibidos:", products);
    if (productsList) {
      productsList.innerHTML = ""; // Limpiar la lista antes de renderizar

      products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
                    <div class="product-info">
                        <strong>ID: ${product.id} - ${product.title}</strong>
                        <p>Descripción: ${product.description}</p>
                        <p>Precio: $${product.price}</p>
                        <p>Stock: ${product.stock}</p>
                    </div>
                    <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                `;
        productsList.appendChild(productCard);
      });
    }
  });

  // Manejar el envío del formulario
  if (productForm) {
    productForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(productForm);
      const newProduct = {
        title: formData.get("title"),
        description: formData.get("description"),
        code: formData.get("code"),
        price: parseFloat(formData.get("price")),
        stock: parseInt(formData.get("stock")),
        category: formData.get("category"),
        thumbnails: [],
        status: formData.get("status") === "on", // Esto depende de tu HTML (checkbox)
      };

      // Emitir el nuevo producto al servidor
      socket.emit("new-product", newProduct);

      // Limpiar el formulario
      productForm.reset();
    });
  } else {
    console.error('No se encontró el formulario con el ID "product-form".');
  }

  // Agregar el listener de forma global para los botones de eliminar
  if (productsList) {
    productsList.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        const productId = e.target.getAttribute("data-id");
        socket.emit("delete-product", productId);
      }
    });
  }
});
