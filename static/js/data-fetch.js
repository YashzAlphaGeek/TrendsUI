import { updateCharts } from './chart.js';
import { updateVMDInfo } from './vmd-info.js';
import { updateTimeDuration } from './time-utils.js';
import { updateLegend } from './legend.js';

export function fetchGraphData() {
    fetch('/get_graph_data')
        .then(response => response.json())
        .then(data => updateGraphs(data))
        .catch(error => console.error('Error fetching data:', error));
}

export function updateGraphs(data) {
    const labels = Object.values(data)[0].map(item => item.time);
    let colorIndex = 0;
    let legendItems = updateCharts(labels, data, colorIndex);

    updateLegend(legendItems);
    window.combinedChart.update();
    updateVMDInfo(data);
    updateTimeDuration(labels);
}
