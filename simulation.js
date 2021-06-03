class Process {
    
    constructor(v, c1, c2, m, interiorTemperature, exteriorTemperature) {
        this._v = v;
        this._c1 = c1;
        this._c2 = c2;
        this._m = m;
        this._exteriorTemperature = exteriorTemperature;
        this._interiorTemperature = interiorTemperature;
    }
    
    getTau() { return this._c1 / (this._c2 * this._v); }

    getKp() {  return this._m / (this._c2 * this._v);  }

    getCurrentTemperature() { return this._interiorTemperature; }

    getTemperature(gasCaudal, deltaTime) {
        const deltaTemp = (this._m * gasCaudal - this._c2 * this._v * (this._interiorTemperature - this._exteriorTemperature)) / this._c1;
        this._interiorTemperature += deltaTemp * deltaTime;
        return this._interiorTemperature;
    }
}

class LinearSensor {
    constructor(kh) {
        this._kh = kh;
    }

    getKh() { return this._kh; }

    getDeltaE(interiorTemperature, targetTemperature, deltaTime) {
        const deltaR = this._kh * targetTemperature;
        const deltaC1 = this._kh * interiorTemperature;
        return deltaR - deltaC1;
    }
}

class LinearControl {
    constructor(kc) {
        this._kc = kc;
    }

    getKc() { return this._kc; }

    getDeltaM(error, deltaTime) { 
        return error * this._kc;
    }
}

class RealControl {
    constructor(kc, kd, ki) {
        this._kc = kc;
        this._kd = kd;
        this._ki = ki;

        this._totalE = 0;
        this._prevError = 0;
    }

    getKc() { return this._kc; }

    getDeltaM(error, deltaTime) { 
        const deltaEdeltaT = (error - this._prevError) / deltaTime;
        this._prevError = error;
        this._totalE += error;

        return this._kc * error + this._kd * deltaEdeltaT + this._ki * this._totalE;
    }
}


class LinearValve {
    constructor(kv) {
        this._kv = kv;
    }

    getKv() { return this._kv; }

    getGasCaudal(deltaM, deltaTime) {
        return deltaM * this._kv;
    }
}

class RealValve {
    constructor(fsv, fk, kt) { 
        this._fsv = fsv ?? 5;
        this._fk = fk ?? 5;
        this._kt = kt ?? 1; 
        this._currentGasCaudal = 0;
    }

    getKv() { return this._fk / this._fsv; }

    getGasCaudal(deltaM, deltaTime) {
        // @Profe: como el valor de la constante kt es 1, para el programa, donde no se incluyen unidades, no provocaría ningún cambio en los valores de las variables
        const deltaP = deltaM * this._kt;
        const deltaGasCaudal = (deltaP / this._fsv) - (this._currentGasCaudal / this._fk);
        this._currentGasCaudal += deltaGasCaudal * deltaTime;
        return this._currentGasCaudal;
    }
}

class Loop {
    constructor(name, info, process) {
        this._name = name;
        this._info = info;
        this._process = process;
        this._interiorTemperature = this._process.getCurrentTemperature();
    }

    getName() { return this._name; }

    getInfo() { return this._info; }

    getValue() { return this._interiorTemperature; }

    getTau() { return this._process.getTau(); }

    getK() {  return this._process.getKp(); }

    simulateStep(deltaTime) {
        // Abstract method, it's implemented in child classes
    }
}

class OpenLoop extends Loop {
    constructor(name, info, process, gasCaudal) {
        super(name, info, process);

        this._gasCaudal = gasCaudal;
    }

    simulateStep(deltaTime) {
        this._interiorTemperature = this._process.getTemperature(this._gasCaudal, deltaTime);
    }
}

// Ejercicio 2
class ClosedLoop extends Loop {
    constructor(name, info, process, sensor, controller, valve, targetTemperature) {
        super(name, info, process)

        this._controller = controller;
        this._sensor = sensor;
        this._valve = valve;
        
        this._initialTemperature = this._interiorTemperature;
        this._targetTemperature = targetTemperature;
    }

    getK() { 
        return this._process.getKp() 
            * this._controller.getKc() 
            * this._valve.getKv() 
            * this._sensor.getKh(); 
    }

    getSteadyStateError() { 
        return 1 / (1 + this.getK()); 
    }

    getStabilizationValue() {
        return this._targetTemperature - (this._targetTemperature - this._initialTemperature) * this.getSteadyStateError();
    }

    getTau() {
        return super.getTau() / (1 + this.getK());
    }

    simulateStep(deltaTime) {
        const deltaE = this._sensor.getDeltaE(this._interiorTemperature, this._targetTemperature, deltaTime);
        const deltaM = this._controller.getDeltaM(deltaE, deltaTime);
        const gasCaudal = this._valve.getGasCaudal(deltaM, deltaTime);
        this._interiorTemperature = this._process.getTemperature(gasCaudal, deltaTime);
        return this._interiorTemperature;
    }
}
