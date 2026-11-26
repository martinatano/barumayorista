# Registro de pedidos en Google Sheets

Cada vez que un cliente toca **Abrir WhatsApp con mi pedido**, la web manda el pedido a una planilla tuya. Se crean dos pestañas solas:

- **Pedidos**: una fila por pedido (código `BM-…`, fecha, cliente, teléfono, tipo declarado, total, detalle, notas, **Alerta** y **Estado**).
- **Clientes**: una fila por cliente (se reconoce por los últimos 10 dígitos del teléfono) con primer y último pedido, cantidad de pedidos y total acumulado.

La columna **Alerta** avisa cuando el cliente dijo "primera compra" pero ya había pedido, o dijo "reposición" y es nuevo. La columna **Estado** arranca en `Nuevo`; cambiala a mano (Confirmado, Cancelado, etc.).

## Puesta en marcha (5 minutos)

1. Creá una planilla nueva en Google Sheets.
2. **Extensiones > Apps Script**, borrá lo que haya y pegá el contenido de `Code.gs`.
3. Cambiá `TOKEN` por una clave tuya (cualquier texto largo).
4. **Implementar > Nueva implementación > Aplicación web**. Ejecutar como: *Yo*. Quién tiene acceso: *Cualquier usuario*. Copiá la URL que termina en `/exec`.
5. En `index.html` completá `ORDERS_ENDPOINT` con esa URL y `ORDERS_TOKEN` con la misma clave del paso 3.
6. Publicá la web y hacé un pedido de prueba.

Si cambiás `Code.gs` después, hay que crear una **nueva versión** de la implementación (Implementar > Administrar implementaciones > Editar > Nueva versión).

## Cosas a tener en cuenta

- El pedido se registra cuando el cliente toca el botón, **no cuando manda el mensaje** de WhatsApp. Por eso existe la columna Estado: marcá cuáles se concretaron.
- Si el cliente no tiene internet en ese momento, el pedido queda guardado en su navegador y se envía solo cuando vuelve la conexión. Si lo reintenta, el script no lo duplica (deduplica por código).
- El `TOKEN` viaja en el código de la web, así que solo frena spam casual; no es un secreto. Nadie puede leer tu planilla con él, solo agregar filas.
- Los datos de clientes son personales: no compartas la planilla de forma pública.
