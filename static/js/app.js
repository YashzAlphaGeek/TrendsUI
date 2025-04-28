import { initializeCharts, updateGraphs } from './chart.js';
import { fetchGraphData } from './data-fetch.js';
import { updateLegend } from './legend.js';
import { updateVMDInfo } from './vmd-info.js';

let combinedChart = initializeCharts();

setInterval(() => {
    fetchGraphData().then(data => {
        updateGraphs(data, combinedChart);
        updateLegend(data.legendItems);  
        updateVMDInfo(data);
    });
}, 1000);
