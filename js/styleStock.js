document.querySelectorAll('.product').forEach(producto => {
    const disponibilidadSpan = producto.querySelector('.disponibilidad');
    if (!disponibilidadSpan) return;
    const texto = disponibilidadSpan.textContent.trim().toLowerCase();
    if (texto === 'en stock') {
        disponibilidadSpan.style.color = 'green';
        disponibilidadSpan.style.fontWeight = 'bold';
    } else if (texto === 'sin stock') {
        disponibilidadSpan.style.color = 'red';
        disponibilidadSpan.style.fontWeight = 'bold';
    }
});

    (function () {
        const grid = document.querySelector('.products-grid');
        if (!grid) return;
        const cards = Array.from(grid.querySelectorAll('.product'));
        cards.sort((a, b) => {
            const aEnStock = (a.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase() === 'en stock') ? 0 : 1;
            const bEnStock = (b.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase() === 'en stock') ? 0 : 1;
            return aEnStock - bEnStock;
        });
        cards.forEach(c => grid.appendChild(c));
    })();