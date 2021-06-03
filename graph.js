const colors = [
    {backgroundColor: 'rgba(49, 191, 243, 0.3)', borderColor:  'rgba(49, 191, 243, 1.0)'},
    {backgroundColor: 'rgba(164, 132, 233, 0.3)', borderColor: 'rgba(164, 132, 233, 1.0)'},
    {backgroundColor: 'rgba(244, 136, 154, 0.3)', borderColor: 'rgba(244, 136, 154, 1.0)'},
    {backgroundColor: 'rgba(255, 175, 104, 0.3)', borderColor: 'rgba(255, 175, 104, 1.0)'},
    {backgroundColor: 'rgba(246, 230, 131, 0.3)', borderColor: 'rgba(246, 230, 131, 1.0)'},
    {backgroundColor: 'rgba(121, 212, 94, 0.3)', borderColor:  'rgba(121, 212, 94, 1.0)'},
];

class Point {
    constructor(time, value) {
        this.time = time;
        this.value = value;
    }

    get x() { return this.time; }
    get y() { return this.value; }
}

class LineDataSet {    
    constructor(colorIndex, label, data) {
        this.type = 'line';
        this.label = label;
        this.backgroundColor = colors[colorIndex % colors.length].backgroundColor;
        this.borderColor = colors[colorIndex % colors.length].borderColor;
        this.data = data;
    }
}

class BarDataSet {    
    constructor(label, data) {
        this.type = 'bar';
        this.label = label;
        this.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        this.borderColor = 'rgba(0, 0, 0, 1.0)';
        this.data = data;
    }
}

// Taken from: https://www.schemecolor.com/bright-pastel-theme.php


class ProcessSimulationGraph {
    constructor(element, showTimeConstantPoint = true) {
        this._chart = new Chart(element, {
            type: 'line', 
            data: {
                labels: [],
                datasets: [],
            }, 
            options: {
                scales: {
                    x: {display: true, title: { display: true, text: 'Tiempo (h)'}},
                    y: {display: true, title: { display: true, text: 'Temperatura interior (ºC)'}}
                },
            },
        });

        this.showTimeConstantPoint = showTimeConstantPoint;
    }

    show(processes, time, withAnimation = true) {
        const datasets = [];
        let timeLabels = [];
        let colorIndex = 0;
        
        for (const process of processes) {
            const simulation = new Simulation(process, time);
            const points = simulation.getPoints();
            timeLabels = points.map(p => p.time);
            datasets.push(new LineDataSet(colorIndex, `${simulation.getName()} (${simulation.getInfo()})`, points));
            
            if (this.showTimeConstantPoint) {
                const timeContantPoint = simulation.getTimeConstantPoint();
                if (timeContantPoint) {  // can be null if it's not in the simulated time range
                    const timeContant = simulation.getTimeConstant();
                    datasets.push(new BarDataSet(`Constante de tiempo de ${simulation.getName()} = ${timeContant.toFixed(2) }h`, [timeContantPoint]));
                }
            }

            colorIndex++;
        }

        this._chart.data.datasets = datasets;
        this._chart.data.labels = timeLabels;
        this._chart.update(withAnimation ? undefined : 0);
    }
}

class Simulation {

    /**
     * Creates a simulation object. This object is responsible for 
     * running the simulation of the process over the time. Once the simulation has ran, the
     * process is NOT resetted to his original state.
     * 
     * @param {Process} process The process to simulate
     * @param {number} totalTime The total time to simulate
     * @param {number} deltaTime The delta time between points in the simulation
     */
    constructor(process, totalTime = 10, deltaTime = 0.125) {
        this._process = process;
        this._deltaTime = deltaTime;
        this._points = [];
        this._currentTime = 0;

        while (this._currentTime < totalTime) {
            this._points.push(new Point(this._currentTime, process.getValue()));
            this._process.simulateStep(deltaTime);

            this._currentTime += deltaTime;
        }
    }

    /**
     * @returns The name of the simulation
     */
    getName() { return this._process.getName(); }

    /**
     * @returns The info string for the simulation
     */
    getInfo() { return this._process.getInfo(); }

    /**
     * Returns a list with the simulated points of the simulation.
     * The x points represent the time and the y points represents the output variable. 
     * 
     * @returns {Point[]} An array of the simulated points up to this time
     */
    getPoints() {
        return this._points;
    }

    /**
     * @returns {number} The real time constant value
     */
    getTimeConstant() {
        return this._process.getTau();
    }

    /**
     * Returns the nearest simulated point near the time constant value.
     * 
     * @returns {Point} The nearest point to the time constant value
     */
    getTimeConstantPoint() {
        const time = this.getTimeConstant();
        const nearesSimulatedPoint = this._points.find(p => p.time > time);
        return nearesSimulatedPoint ? nearesSimulatedPoint : null;
    }

}