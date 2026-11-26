/**
 * Barú Mayorista · registro de pedidos y clientes en Google Sheets.
 * Pegar en Extensiones > Apps Script de una planilla nueva. Ver README.md.
 */
const TOKEN = 'M4RT1N4MUN1Z270'; // el mismo valor que ORDERS_TOKEN en index.html
// Solo si el script NO se creó desde la planilla (Extensiones > Apps Script): pegá acá el ID de la
// planilla, que es el texto largo de su URL entre /d/ y /edit. Si lo hiciste desde la planilla, dejalo vacío.
const SHEET_ID = '';

const PEDIDOS = 'Pedidos';
const CLIENTES = 'Clientes';
const H_PEDIDOS = ['Código', 'Fecha', 'Cliente', 'Local', 'Teléfono', 'Localidad', 'Tipo declarado', 'Total', 'Detalle', 'Notas', 'Alerta', 'Estado', 'Clave'];
const H_CLIENTES = ['Clave (últimos 10 dígitos)', 'Nombre', 'Local', 'Teléfono', 'Localidad', 'Primer pedido', 'Último pedido', 'Pedidos', 'Total acumulado'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return out_({ ok: false, error: 'token' });
    const clave = String(d.telefonoClave || '').replace(/\D/g, '').slice(-10);
    if (!d.codigo || clave.length < 10 || !Array.isArray(d.items)) return out_({ ok: false, error: 'datos' });

    const shP = sheet_(PEDIDOS, H_PEDIDOS);
    const shC = sheet_(CLIENTES, H_CLIENTES);

    // Reintentos: si el código ya está, no se duplica.
    const codigos = shP.getRange(2, 1, Math.max(shP.getLastRow() - 1, 0), 1).getValues().flat();
    if (codigos.indexOf(d.codigo) !== -1) return out_({ ok: true, duplicado: true });

    const fecha = new Date(d.fecha || Date.now());
    const rowC = findRow_(shC, clave);
    const previos = rowC ? Number(shC.getRange(rowC, 8).getValue()) : 0;

    let alerta = '';
    if (d.tipo === 'primera' && previos > 0) alerta = 'Dijo PRIMERA compra pero ya tiene ' + previos + ' pedido(s) registrado(s)';
    if (d.tipo === 'reposicion' && previos === 0) alerta = 'Dijo REPOSICIÓN pero es cliente nuevo (sin pedidos previos)';

    const detalle = d.items.map(function (i) {
      return i.cantidad + ' x ' + i.nombre + (i.aroma ? ' (' + i.aroma + ')' : '') + ' — $' + i.subtotal;
    }).join('\n');

    shP.appendRow([
      safe_(d.codigo), fecha, safe_(d.nombre), safe_(d.negocio), safe_(d.telefono), safe_(d.localidad),
      d.tipo === 'primera' ? 'Primera compra' : 'Reposición', Number(d.total) || 0,
      safe_(detalle), safe_(d.notas), alerta, 'Nuevo', "'" + clave
    ]);

    if (rowC) {
      shC.getRange(rowC, 2, 1, 4).setValues([[safe_(d.nombre), safe_(d.negocio), safe_(d.telefono), safe_(d.localidad)]]);
      shC.getRange(rowC, 7).setValue(fecha);
      shC.getRange(rowC, 8).setValue(previos + 1);
      shC.getRange(rowC, 9).setValue(Number(shC.getRange(rowC, 9).getValue()) + (Number(d.total) || 0));
    } else {
      shC.appendRow(["'" + clave, safe_(d.nombre), safe_(d.negocio), safe_(d.telefono), safe_(d.localidad), fecha, fecha, 1, Number(d.total) || 0]);
    }
    return out_({ ok: true, alerta: alerta });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function sheet_(name, headers) {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function findRow_(sh, clave) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return 0;
  const claves = sh.getRange(2, 1, n, 1).getValues().flat().map(function (c) { return String(c).replace(/\D/g, ''); });
  const i = claves.indexOf(clave);
  return i === -1 ? 0 : i + 2;
}

// Evita que un texto que empiece con = + - @ se ejecute como fórmula en la planilla.
function safe_(v) {
  const s = String(v == null ? '' : v);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Para probar desde el editor: elegí "probar" en el desplegable y tocá Ejecutar.
// Si anda, crea las pestañas y una fila de prueba (después la borrás). Si falla, el error se ve en el registro.
function probar() {
  const r = doPost({ postData: { contents: JSON.stringify({
    token: TOKEN, codigo: 'TEST-' + Date.now(), fecha: new Date().toISOString(),
    nombre: 'Prueba', negocio: 'Local de prueba', telefono: '11 2345-6789', telefonoClave: '1123456789',
    localidad: 'Test', tipo: 'primera', notas: '', total: 1,
    items: [{ nombre: 'Producto de prueba', aroma: '', cantidad: 1, subtotal: 1 }]
  }) } });
  Logger.log(r.getContent());
}
