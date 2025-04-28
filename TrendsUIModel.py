import time as t
from collections import defaultdict
import re
from flask import Flask, render_template, jsonify
import threading

from matplotlib import pyplot as plt

app = Flask(__name__)

trend_data = defaultdict(lambda: {})
graph_data = defaultdict(list)
vmd_last_seen = {}
removed_vmds = []


class TrendModel:
    def __init__(self, vmd_uuid, metric_name):
        self.vmd_uuid = vmd_uuid
        self.metric_name = metric_name
        self.entries = []
        self.last_updated = t.time()

    def add_entry(self, time, median):
        self.entries.append((time, median))
        self.last_updated = t.time()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/get_graph_data")
def get_graph_data():
    return jsonify(graph_data)


@app.route("/get_removed_vmds")
def get_removed_vmds():
    return jsonify(removed_vmds)


def extract_time_from_timestamp(timestamp):
    date_time = timestamp.split("T")
    if len(date_time) < 2:
        return None
    return date_time[1].rstrip("Z").split(".")[0]


def extract_metric_name_manual(log_entry):
    match = re.search(r"Metric Name :\s*([^\[]+)", log_entry)
    if match:
        return re.sub(r"\(\d+,\s*\d+\)", "", match.group(1)).strip()
    return None


def parse_log_line(line):
    timestamp_match = re.search(r"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})", line)
    timestamp = timestamp_match.group(1) if timestamp_match else None
    time = extract_time_from_timestamp(timestamp) if timestamp else None

    metric_name = extract_metric_name_manual(line)
    metric_id_match = re.search(r"Metric Code :\s*(\S+)", line)
    metric_id = metric_id_match.group(1) if metric_id_match else None

    median_match = re.search(r"Median :\s*(\d+\.?\d*)", line)
    median = median_match.group(1) if median_match else None

    vmd_uuid_match = re.search(r"VMD UUID\s*(\S+)", line)
    vmd_uuid = vmd_uuid_match.group(1) if vmd_uuid_match else None

    return time, metric_name, metric_id, median, vmd_uuid


log_file_path = "apps/trends/tools/log/trends.txt"


def tail_log_file(file_path, interval=1):
    with open(file_path, "r+") as file:
        file.truncate(0)

        t.sleep(1)

        with open(file_path, "r") as file:
            file.seek(0, 2)
            while True:
                line = file.readline()
                if not line:
                    t.sleep(interval)
                    remove_stale_vmds()
                    continue
                process_log_line(line.strip())


def process_log_line(line):
    time, metric_name, metric_id, median, vmd_uuid = parse_log_line(line)
    if metric_name and metric_id and median and vmd_uuid:
        trend_data[vmd_uuid].setdefault(metric_name, TrendModel(vmd_uuid, metric_name))
        trend_data[vmd_uuid][metric_name].add_entry(time, median)
        vmd_last_seen[vmd_uuid] = t.time()
        update_graph_data(metric_name, time, median, vmd_uuid)


def remove_stale_vmds(timeout=60):
    current_time = t.time()
    stale_vmds = [
        vmd
        for vmd, last_seen in vmd_last_seen.items()
        if (current_time - last_seen) > timeout
    ]
    for vmd in stale_vmds:
        removed_vmds.append({"vmd_uuid": vmd, "last_seen": vmd_last_seen[vmd]})
        trend_data.pop(vmd, None)
        vmd_last_seen.pop(vmd, None)

        for metric_name in list(graph_data.keys()):
            graph_data[metric_name] = [
                entry for entry in graph_data[metric_name] if entry["vmd_uuid"] != vmd
            ]


def update_graph_data(metric_name, time, median, vmd_uuid):
    value = float(median) if median else 0
    graph_data[metric_name].append({"time": time, "value": value, "vmd_uuid": vmd_uuid})

    if len(graph_data[metric_name]) > 10:
        graph_data[metric_name].pop(0)

    plot_graphs()


def plot_graphs():
    plt.clf()
    for idx, (metric_name, data) in enumerate(graph_data.items(), 1):
        times = [entry["time"] for entry in data]
        values = [entry["value"] for entry in data]

        plt.subplot(len(graph_data), 1, idx)
        plt.plot(times, values, label=metric_name)
        plt.xlabel("Time")
        plt.ylabel("Value")
        plt.title(f"{metric_name} over Time")
        plt.xticks(rotation=45)

    plt.tight_layout()
    plt.draw()
    plt.pause(0.1)


def run_flask():
    app.run(debug=True, use_reloader=False, port=5000)


flask_thread = threading.Thread(target=run_flask)
flask_thread.daemon = True
flask_thread.start()

tail_log_file(log_file_path)
