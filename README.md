# Barú Mayorista

Catálogo mayorista de Barú con armado de pedidos y envío del detalle a WhatsApp.

## Archivos

- `index.html`: catálogo, productos, precios y lógica del pedido.
- `improvements.css`: ajustes visuales y diseño adaptable a celular.
- `index.original.html`: copia de la versión recibida antes de las mejoras.

## Vista previa local

Desde esta carpeta:

```sh
python3 -m http.server 8765
```

Abrir http://localhost:8765 en el navegador.

## Publicación

Es un sitio estático: publicar `index.html` e `improvements.css` juntos. Las fotos de productos están incorporadas en el HTML. Las portadas usan fotos propias en `assets/portadas/`; publicar también esa carpeta. Ver `PHOTO-SOURCES.md`. Subir cambios a GitHub no configura por sí solo un alojamiento web.

## Pedidos

El carrito se guarda en el navegador. El mínimo es $180.000 para primera compra y $150.000 para reposición. WhatsApp abre un mensaje con el detalle; la web no confirma su envío ni borra el carrito. Disponibilidad, envío y pago se coordinan por WhatsApp.
