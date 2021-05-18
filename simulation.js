class Point {
    constructor(time, value) {
        this.time = time;
        this.value = value;
    }

    get x() { return this.time; }
    get y() { return this.value; }
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
            this._process.simulateStep(deltaTime)
            this._points.push(new Point(this._currentTime, process.getValue()));

            this._currentTime += deltaTime;
        }
    }

    /**
     * @returns The name of the simulation
     */
    getName() { return this._process.name; }

    /**
     * @returns The info string for the simulation
     */
    getInfo() { return this._process.info; }

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

class Process {
    constructor(options = {}) {
        this.name = options.name ?? "Process";
        this.info = options.info ?? "";
    }

    /**
     * @returns {number} The process controlled directly controlled value
     */
    getValue() {
        return 0; // Must be overriden in the child classe
    }

    /**
     * @returns {number} The process time constant value
     */
    getTau() {
        return 0; // Must be overriden in the child classe
    }

    /**
     * Simulate a step in the process
     * 
     * @param {number} deltaTime The amount of time passed since the last time this function was called
     */
    simulateStep(deltaTime) {
        // Must be overriden in the child classe
    }
}

// Ejercicio 1
class OpenLoopProcess extends Process {
    
    constructor(options = {}) {
        super(options);
        
        this.v = options.v ?? 25;
        this.c1 = options.c1 ?? 200;
        this.c2 = options.c2 ?? 2;
        this.m = options.m ?? 10;
        this.exteriorTemperature = options.exteriorTemperature ?? 18;
        this.interiorTemperature = options.interiorTemperature ?? 18;
        this.gasCaudal = options.gasCaudal ?? 10;
    }
    
    getTau() {
        return this.c1 / (this.c2 * this.v);
    }

    getKp() { 
        return this.m / (this.c2 * this.v); 
    }

    getValue() {
        return this.interiorTemperature;
    }
    
    simulateStep(deltaTime) {
        const deltaTemp = (this.m * this.gasCaudal - this.c2 * this.v * (this.interiorTemperature - this.exteriorTemperature)) / this.c1;
        this.interiorTemperature += deltaTemp * deltaTime;
    }
}

// En comun en ejercicios 2 y 3
class ClosedLoopProcess extends OpenLoopProcess {
    constructor(options = {}) {
        super(options);

        this.kc = options.kc ?? 50;
        this.kh = options.kh ?? 0.05;
        this.targetTemperature = options.targetTemperature ?? 24;
    }

    getDeltaM() { 
        const deltaR = this.kh * this.targetTemperature;
        const deltaC1 = this.kh * this.interiorTemperature;
        const deltaE = deltaR - deltaC1;
        const deltaM = deltaE * this.kc;
        return deltaM;
    }

    simulateStep(deltaTime) {
        super.simulateStep(deltaTime);
    }
}

// Ejercicio 2
class FirstOrderClosedLoopProcess extends ClosedLoopProcess {
    constructor(options = {}) {
        super(options);

        this.kv = options.kv ?? 2;
    }

    getTau() {
        return super.getTau() / (1 + this.getK());
    }

    getK() { 
        return this.getKp() * this.kc * this.kv * this.kh; 
    }

    getSteadyStateError() { 
        return 1 / (1 + this.getK()); 
    }

    simulateStep(deltaTime) {
        //const deltaGasCaudal = this.getDeltaM() * this.kv;
        //this.gasCaudal += deltaGasCaudal * deltaTime;
        this.gasCaudal = this.getDeltaM() * this.kv;

        super.simulateStep(deltaTime);
    }
}

// Ejercicio 3
class SecondOrderClosedLoopProcess extends ClosedLoopProcess {
    constructor(options = {}) {
        super(options);

        this.fsv = options.fsv ?? 5;
        this.fk = options.fk ?? 5;
        this.kt = options.kt ?? 1; 
    }

    getK() {
        return (this.getTau() - this.fk) / this.fk;
    }

    getSteadyStateError() { 
        return 1 / (1 + this.getK()); 
    }

    simulateStep(deltaTime) {
        // @Profe: como el valor de la constante kt es 1, para el programa, donde no se incluyen unidades, no provocaría ningún cambio en los valores de las variables
        const deltaP = this.getDeltaM() * this.kt;
        const deltaGasCaudal = (deltaP / this.fsv) - (this.gasCaudal / this.fk);
        this.gasCaudal += deltaGasCaudal * deltaTime;
        super.simulateStep(deltaTime);
    }
}