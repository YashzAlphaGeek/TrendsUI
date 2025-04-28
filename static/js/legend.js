export function updateLegend(legendItems) {
    const legendContainer = document.getElementById('legendContainer');
    legendContainer.innerHTML = '';

    legendItems.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        legendItem.innerHTML = `
            <span class="legend-box" style="background-color: ${item.color};"></span>
            ${item.label}
        `;
        legendContainer.appendChild(legendItem);
    });
}
