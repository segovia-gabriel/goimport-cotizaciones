console.log('[GoImport] test-precio.js cargó');

// 1. Pedimos la cotización a tu backend
fetch('/api/rate')
  .then(res => {
    console.log('[GoImport] /api/rate status:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('[GoImport] /api/rate body:', data);

    if (!data || !data.ok) {
      throw new Error('La API devolvió ok = false');
    }

    const valorDolar = parseFloat(data.usdt_ars);
    console.log('[GoImport] valorDolar:', valorDolar);

    if (isNaN(valorDolar)) {
      throw new Error('valorDolar es NaN');
    }

    // 2. Recorremos todos los productos
    document.querySelectorAll('.product').forEach(prod => {
      const usdtStr = prod.getAttribute('data-usdt');
      const usdt = parseFloat(usdtStr);
      const precioSpan = prod.querySelector('.precio-ars');

      console.log('[GoImport] Producto detectado:', {
        usdtStr,
        usdt,
        tienePrecioSpan: !!precioSpan,
        precioSpanInicial: precioSpan ? precioSpan.textContent : null
      });

      if (isNaN(usdt) || !precioSpan) {
        // no podemos calcular este producto
        return;
      }

      // 3. Calculamos precio final
      const precioFinal = usdt * valorDolar * 1.03;

      const precioTexto = `$ ${precioFinal.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

      // 4. Mostramos en el DOM
      precioSpan.textContent = precioTexto;

      console.log('[GoImport] Precio final seteado en DOM:', precioTexto);
    });
  })
  .catch(err => {
    console.error('[GoImport] ERROR:', err);
    // fallback visual
    document.querySelectorAll('.precio-ars').forEach(span => {
      span.textContent = 'Error al cargar';
    });
  });