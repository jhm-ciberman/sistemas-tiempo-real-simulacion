
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




window.addEventListener('load', () => {

    const simulation = new SimulationProcess(25, 200, 2);
    const interiorTemperatureStart = 18;

    const simulationValue = simulation.function(interiorTemperatureStart);
    //const timeConstantValue = time.map(t => )

    const data = {
        labels: simulationValue.map(p => p.x),
        datasets: [
            {
                type: 'line',
                label: 'Ejercicio 1 - Lazo Abierto',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: simulationValue.map(p => p.y),
            }, 
            //{
            //    label: 'Constante de tiempo',
            //    backgroundColor: 'rgb(99, 255, 132)',
            //    borderColor: 'rgb(255, 99, 132)',
            //    data: ,
            //}

        ],
    };
    
    const options = {
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Tiempo (h)'
                }
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

    var element = document.getElementById('myChart');
    var myChart = new Chart(element, {
        type: 'line', data, options,
    });
});