setTimeout(() => {
    console.log('[GoImport] mensajeWpp.js cargó');

    document.querySelectorAll('.product').forEach(producto => {
    const boton = producto.querySelector('.whatsapp-button');
    if (!boton) return;

    const disponibilidadSpan = producto.querySelector('.disponibilidad');
    const disponibilidadTexto = disponibilidadSpan
        ? disponibilidadSpan.textContent.trim()
        : '';

    // si no hay stock, no generamos link
    if (disponibilidadTexto.toLowerCase() === 'sin stock') return;

    // título del producto
    const tituloProducto = producto.querySelector('h2')?.textContent?.trim() || 'Producto';

    // recorremos las especificaciones visibles en la card
    const specs = producto.querySelectorAll('.specifications p');
    const detalles = [];
    specs.forEach(p => {
        const linea = p.textContent.trim();
        if (!linea) return;

        const lower = linea.toLowerCase();
        // no metemos líneas de precio en las specs
        if (lower.startsWith('precio:')) return;
        if (lower.startsWith('precio en pesos:')) return;

        detalles.push(linea);
    });

    // precios
    const usdtStr = producto.getAttribute('data-usdt') || '-';
    const precioPesos = producto.querySelector('.precio-ars')?.textContent?.trim() || 'Precio no disponible';

    // armamos el mensaje en formato prolijo
    // importante: sin emojis raros
    const mensaje =
    `Hola GoImport!

    Estoy interesado en este producto que vi en su web:
    ${tituloProducto}
    ${detalles.join('\n')}

    Precio: ${usdtStr} USDT (${precioPesos})

    ¿Podrían confirmarme si está disponible?
    Gracias!`;

    const telefono = '595993373769';
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    boton.setAttribute('href', url);
    console.log('[GoImport] WhatsApp href seteado:', url);
    });
}, 200);