export function initializeCharts() {
    const ctxCombined = document.getElementById('combinedChart').getContext('2d');
    window.combinedChart = new Chart(ctxCombined, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { 
            responsive: true, 
            animation: false, 
            scales: { 
                x: { title: { display: true, text: 'Time' }, ticks: { maxRotation: 90, minRotation: 45 } },
                y: { title: { display: true, text: 'bpm / %' }, min: 50, max: 150 } 
            },
            tooltips: {
                callbacks: {
                    title: function(tooltipItem) {
                        return 'Time: ' + tooltipItem[0].label;
                    },
                    label: function(tooltipItem) {
                        let metric = tooltipItem.dataset.label.split(' ')[0];
                        let value = tooltipItem.raw;
                        let vmdUUID = tooltipItem.dataset.vmd_uuid || 'N/A';
                        return `${metric}: ${value} | VMD: ${vmdUUID}`;
                    }
                }
            }
        }
    });
}

export function updateCharts(labels, data, colorIndex) {
    window.combinedChart.data.labels = labels;
    let legendItems = [];
    window.combinedChart.data.datasets = [];

    for (let metric in data) {
        data[metric].forEach(item => {
            if (item.value !== undefined && item.value !== null) {
                let dataset = window.combinedChart.data.datasets.find(ds => ds.label === `${metric} VMD: ${item.vmd_uuid}`);
                if (!dataset) {
                    dataset = {
                        label: `${metric} VMD: ${item.vmd_uuid}`,
                        data: [],
                        borderColor: `hsl(${colorIndex * 60}, 100%, 30%)`,
                        backgroundColor: `hsla(${colorIndex * 60}, 100%, 30%, 0.2)`,
                        fill: true,
                        vmd_uuid: item.vmd_uuid
                    };
                    window.combinedChart.data.datasets.push(dataset);
                    colorIndex++;
                    legendItems.push({ color: `hsl(${colorIndex * 60}, 100%, 30%)`, label: `${metric} VMD: ${item.vmd_uuid}` });
                }
                dataset.data.push(item.value);
            }
        });
    }

    return legendItems;
}
