(() => {
  const titulo = document.getElementById("prodTitulo");
  const precio = document.getElementById("prodPrecio");
  const img = document.getElementById("prodImg");
  const zoom = document.getElementById("prodZoom");
  const botonCarrito = document.getElementById("btnAddCart");

  if (!titulo || !precio || !img || !zoom) return;

  const productos = {
    nombre_viento: {
      titulo: "El nombre del viento",
      precio: "19,95€",
      alt: "Portada de El nombre del viento",
      sm: "assets/img/products/sm/nombre_viento.jpg",
      md: "assets/img/products/md/nombre_viento.jpg",
      lg: "assets/img/products/lg/nombre_viento.jpg"
    },
    "1984": {
      titulo: "1984",
      precio: "12,50€",
      alt: "Portada de 1984",
      sm: "assets/img/products/sm/1984.jpg",
      md: "assets/img/products/md/1984.jpg",
      lg: "assets/img/products/lg/1984.jpg"
    },
    dune: {
      titulo: "Dune",
      precio: "22,00€",
      alt: "Portada de Dune",
      sm: "assets/img/products/sm/dune.jpg",
      md: "assets/img/products/md/dune.jpg",
      lg: "assets/img/products/lg/dune.jpg"
    },
    got: {
      titulo: "Juego de tronos",
      precio: "24,95€",
      alt: "Portada de Juego de tronos",
      sm: "assets/img/products/sm/got.jpg",
      md: "assets/img/products/md/got.jpg",
      lg: "assets/img/products/lg/got.jpg"
    }
  };

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "nombre_viento";
  const producto = productos[id] || productos.nombre_viento;

  document.title = `Librería Jose — ${producto.titulo}`;
  titulo.textContent = producto.titulo;
  precio.textContent = producto.precio;
  img.src = producto.md;
  img.alt = producto.alt;
  img.srcset = `${producto.sm} 360w, ${producto.md} 600w, ${producto.lg} 1200w`;
  zoom.setAttribute("data-img-grande", producto.lg);

  if (botonCarrito) {
    botonCarrito.dataset.productId = productos[id] ? id : "nombre_viento";
  }
})();
