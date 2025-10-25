setTimeout(() => {
console.log('[GoImport] mensajeWpp.js cargó');

    function getSpec(producto, etiqueta) {
    const ps = producto.querySelectorAll('.specifications p');
    for (const p of ps) {
        const strong = p.querySelector('strong');
        if (!strong) continue;
        const key = strong.textContent.replace(':', '').trim().toLowerCase();
        if (key === etiqueta.toLowerCase()) {
        const value = p.textContent.split(':').slice(1).join(':').trim();
        return value || '';
        }
    }
    return '';
    }

    document.querySelectorAll('.product').forEach(producto => {
    const boton = producto.querySelector('.whatsapp-button');
    if (!boton) return;

    const disponibilidadSpan = producto.querySelector('.disponibilidad');
    const disponibilidadTexto = disponibilidadSpan
        ? disponibilidadSpan.textContent.trim().toLowerCase()
        : '';

    // si está sin stock no le doy link de compra directo
    if (disponibilidadTexto === 'sin stock') return;

    // título principal del producto
    const titulo = producto.querySelector('h2')?.textContent?.trim() || 'Producto';

    // leemos los campos más comunes
    const marca = getSpec(producto, 'Marca');
    const modelo = getSpec(producto, 'Modelo');
    const color = getSpec(producto, 'Color');
    const talles = getSpec(producto, 'Talles');
    const disponibilidadLegible = disponibilidadSpan
        ? disponibilidadSpan.textContent.trim()
        : '';

    // precio en usdt viene desde el atributo de la card
    const usdtStr = producto.getAttribute('data-usdt') || '-';

    // precio en pesos YA CALCULADO Y MOSTRADO EN PANTALLA
    // (esto es exactamente lo que hacía tu script viejo: toma el texto final)
    const precioPesos = producto.querySelector('.precio-ars')?.textContent?.trim() || 'Precio no disponible';

    // armamos todas las líneas de detalle del producto, al estilo que tenías
    const lineasDetalles = [];
    if (marca) lineasDetalles.push(`Marca: ${marca}`);
    if (modelo) lineasDetalles.push(`Modelo: ${modelo}`);
    if (color) lineasDetalles.push(`Color: ${color}`);
    if (talles) lineasDetalles.push(`Talles: ${talles}`);
    if (disponibilidadLegible) lineasDetalles.push(`Disponibilidad: ${disponibilidadLegible}`);

    // mensaje final para WhatsApp
    const mensaje =
    `Hola GoImport!

    Estoy interesado en este producto que vi en su web:
    ${titulo}
    ${lineasDetalles.join('\n')}

    Precio: ${usdtStr} USDT (${precioPesos})

    ¿Podrían confirmarme si está disponible?
    Gracias!`;

    const telefono = '595993373769';
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    boton.setAttribute('href', url);
    console.log('[GoImport] WhatsApp href seteado:', url);
    });
}, 200);