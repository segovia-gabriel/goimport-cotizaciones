// ===============================
// MENSAJE DE WHATSAPP GENERAL
// ===============================
document.querySelectorAll('.product').forEach(producto => {
    const precioARS = producto.querySelector('.precio-ars')?.textContent?.trim() || 'Precio no disponible';
    const usdt = producto.getAttribute('data-usdt') || '-';
    const specs = producto.querySelectorAll('.specifications p');
    const boton = producto.querySelector('.whatsapp-button');
    const disponibilidad = producto.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase();

    if (!boton || disponibilidad === 'sin stock') return;

    // Armar texto base
    let detalles = [];
    specs.forEach(p => {
        const texto = p.textContent.trim();
        if (texto && !texto.toLowerCase().includes('precio')) {
        detalles.push(texto);
        }
    });

    const productoTitulo = producto.querySelector('h2')?.textContent?.trim() || 'Producto';
    const telefono = '595993373769';
    
    const mensaje = 
        `Hola GoImport! 👋\n\n` +
        `Estoy interesado en este producto que vi en su web:\n` +
        `📦 *${productoTitulo}*\n` +
        `${detalles.join('\n')}\n\n` +
        `💲 Precio: ${usdt} USDT (${precioARS})\n\n` +
        `¿Podrían confirmarme si está disponible?\nGracias! 🙌`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    boton.setAttribute('href', url);
});