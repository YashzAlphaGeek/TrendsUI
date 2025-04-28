export function updateTimeDuration(labels) {
    console.log("Labels:", labels);

    document.getElementById('durationValue').textContent = "Loading...";

    if (labels.length >= 2) {
        const parsedTimes = labels.map(label => parseTime(label));

        if (parsedTimes.includes(null)) {
            console.error("Invalid time format in labels");
            document.getElementById('durationValue').textContent = "Invalid Time Format";
            return;
        }

        let timeDifferences = [];
        for (let i = 1; i < parsedTimes.length; i++) {
            const diff = parsedTimes[i].totalSeconds - parsedTimes[i - 1].totalSeconds;
            timeDifferences.push(diff);
        }

        const mostFrequentDiff = findMostFrequent(timeDifferences);

        document.getElementById('durationValue').textContent = `${mostFrequentDiff} seconds`;
    }
}

function parseTime(timeString) {
    const timeParts = timeString.split(':');

    if (timeParts.length === 3) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = parseInt(timeParts[2], 10);

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            return null; 
        }

        const totalSeconds = hours * 3600 + minutes * 60 + seconds; 
        return { hours, minutes, seconds, totalSeconds };
    }

    if (timeParts.length === 2) {
        const minutes = parseInt(timeParts[0], 10);
        const seconds = parseInt(timeParts[1], 10);

        if (isNaN(minutes) || isNaN(seconds)) {
            return null;
        }

        const totalSeconds = minutes * 60 + seconds; 
        return { minutes, seconds, totalSeconds };
    }

    if (timeParts.length === 1) {
        const seconds = parseInt(timeParts[0], 10);

        if (isNaN(seconds)) {
            return null;
        }

        return { seconds, totalSeconds: seconds };
    }

    return null;
}

function findMostFrequent(arr) {
    const frequencyMap = {};
    let maxCount = 0;
    let mostFrequent = null;
    arr.forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
        if (frequencyMap[num] > maxCount) {
            maxCount = frequencyMap[num];
            mostFrequent = num;
        }
    });

    return mostFrequent;
}
