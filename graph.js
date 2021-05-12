const colors = [
    {backgroundColor: 'rgba(49, 191, 243, 0.3)', borderColor:  'rgba(49, 191, 243, 1.0)'},
    {backgroundColor: 'rgba(164, 132, 233, 0.3)', borderColor: 'rgba(164, 132, 233, 1.0)'},
    {backgroundColor: 'rgba(244, 136, 154, 0.3)', borderColor: 'rgba(244, 136, 154, 1.0)'},
    {backgroundColor: 'rgba(255, 175, 104, 0.3)', borderColor: 'rgba(255, 175, 104, 1.0)'},
    {backgroundColor: 'rgba(246, 230, 131, 0.3)', borderColor: 'rgba(246, 230, 131, 1.0)'},
    {backgroundColor: 'rgba(121, 212, 94, 0.3)', borderColor:  'rgba(121, 212, 94, 1.0)'},
];

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
    constructor(element, simulations) {
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
    }

    show(simulations, withAnimation = true) {
        const datasets = [];
        let timeLabels = [];
        let colorIndex = 0;
        for (const simulation of simulations) {
            const points = simulation.getPoints();
            const timeContantPoint = simulation.getTimeConstantPoint();
            timeLabels = points.map(p => p.time);
            datasets.push(new LineDataSet(colorIndex, `${simulation.getName()} (${simulation.getInfo()})`, points));

            if (timeContantPoint) { // can be null if it's not in the simulated time range
                const timeContant = simulation.getTimeConstant();
                datasets.push(new BarDataSet(`Constante de tiempo de ${simulation.getName()} = ${timeContant.toFixed(2) }h`, [timeContantPoint]));
            }

            colorIndex++;
        }

        this._chart.data.datasets = datasets;
        this._chart.data.labels = timeLabels;
        this._chart.update(withAnimation ? undefined : 0);
    }
}