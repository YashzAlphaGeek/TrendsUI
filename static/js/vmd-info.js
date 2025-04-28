export function updateVMDInfo(data) {
    let vmdListElement = document.getElementById('vmdList');
    vmdListElement.innerHTML = "";

    let vmdUUIDs = new Set();
    for (let metric in data) {
        data[metric].forEach(item => { if (item.vmd_uuid) vmdUUIDs.add(item.vmd_uuid); });
    }

    if (vmdUUIDs.size === 0) {
        vmdListElement.innerHTML = "<p>No active VMDs</p>";
    } else {
        let runningVmdCount = 0;

        vmdUUIDs.forEach(vmd => {
            let vmdElement = document.createElement('div');
            vmdElement.classList.add('vmd-card');
            vmdElement.innerHTML = ` 
                <div class="vmd-uuid-box">VMD UUID: ${vmd}</div>
                <div class="status ${getVMDStatusClass(data, vmd)}">
                    Status: ${getVMDStatus(data, vmd)}
                </div>
            `;

            let metricsList = document.createElement('div');
            metricsList.classList.add('vmd-child');
            for (let metric in data) {
                let value = getLatestMetric(data[metric], vmd);
                if (value !== '-') {
                    metricsList.innerHTML += `<p><strong>${metric}:</strong> ${value} ${metric === 'SpO₂' ? '%' : 'bpm'}</p>`;
                }
            }

            vmdElement.appendChild(metricsList);
            vmdListElement.appendChild(vmdElement);

            if (getVMDStatus(data, vmd) === 'Running') {
                runningVmdCount++;
            }
        });

        document.getElementById('runningVmdCount').textContent = `Running VMDs: ${runningVmdCount}`;
    }
}

function getVMDStatus(data, vmdUUID) {
    let status = 'Running';
    for (let metric in data) {
        if (data[metric].some(item => item.vmd_uuid === vmdUUID && item.value === null)) {
            status = 'Stopped';
        }
    }
    return status;
}

function getVMDStatusClass(data, vmdUUID) {
    return getVMDStatus(data, vmdUUID) === 'Running' ? '' : 'stopped';
}

function getLatestMetric(data, vmdUUID) {
    let metric = data.filter(item => item.vmd_uuid === vmdUUID);
    return metric.length ? metric[metric.length - 1].value : '-';
}
