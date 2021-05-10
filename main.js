
// Returns {x: array, y: array}
function euler(func, x0, y0, dx, n = 100) {
    //const dx = (xn - x0) / n;
    const list = [];

    let point = {x: x0, y: y0};

    for (let i = 0; i < n; i++) {
        point = {
            x: point.x + dx,
            y: point.y + func(point.x, point.y) * dx,
        };
        list.push(point);
    }

    return list;
}

class SimulationProcess {
    
    constructor(v, c1, c2) {
        this.v = v;
        this.c1 = c1;
        this.c2 = c2;
        this.m = 10;
        this.exteriorTemperature = 18;
        this.time = 0.125;
        this.gasCaudal = 10;
    }
    
    timeConstant() {
        return this.c1 / (this.c2 * this.v);
    }

    /**
     * Calculates the derivative of the process function
     * @returns The value of the derivative of dTi/dt
     */
    derivative(_x, y) {
        const interiorTemperature = y;
        return (this.m * this.gasCaudal - this.c2 * this.v * (interiorTemperature - this.exteriorTemperature)) / this.c1;
    }

    function(interiorTemperatureStart) {
        const func = (x, y) => this.derivative(x, y);
        const timeStart = 0;
        const deltaTime = 0.125;
        const numberOfPoints = 200;
        return euler(func, timeStart, interiorTemperatureStart, deltaTime, numberOfPoints);
    }
}

function chart(idChart, v, c1, c2) {
    const simulation = new SimulationProcess(v, c1, c2);
    const interiorTemperatureStart = 18;

    const simulationPoints = simulation.function(interiorTemperatureStart);
    const timeConstantX = simulation.timeConstant();
    const timeConstantY = simulationPoints.find(p => p.x > timeConstantX).y;

    const data = {
        labels: simulationPoints.map(p => p.x),
        datasets: [
            {
                type: 'line',
                label: 'Ejercicio 1 - Lazo Abierto',
                backgroundColor: 'rgba(60, 90, 255, 0.3)',
                borderColor: 'rgba(60, 90, 255, 1.0)',
                data: simulationPoints,
                parsing: {
                    yAxisKey: 'y',
                }
            }, 
            {
                type: 'bar',
                label: 'Constante de tiempo',
                backgroundColor: 'rgb(0, 0, 0, 0.3)',
                borderColor: 'rgba(0, 0, 0, 1.0)',
                data: [{x: timeConstantX, y: timeConstantY}],
                parsing: {
                    yAxisKey: 'y',
                }
            }

        ],
    };
    
    const options = {
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Tiempo (h)'
                },
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Temperatura interior (ºC)'
                },
            }
        }
    };

    var element = document.getElementById(idChart);
    return new Chart(element, {
        type: 'line', data, options,
    });
}

function reloadCharts() {
    const v = document.getElementById("value-v").value;
    const c1 = document.getElementById("value-c1").value;
    const c2 = document.getElementById("value-c2").value;
    chart('myChart1', v, c1, c2);
    chart('myChart2', v * 2, c1, c2);
}

window.addEventListener('load', () => {
    reloadCharts();
});