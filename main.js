class OptionsGUIPanel {
    constructor() {
        this._inputV = document.getElementById("value-v");
        this._inputC1 = document.getElementById("value-c1");
        this._inputC2 = document.getElementById("value-c2");
        this._inputM = document.getElementById("value-m");
        this._inputExteriorTemperature = document.getElementById("value-temp-ext");
        this._inputInteriorTemperature = document.getElementById("value-temp-int");
        this._inputGasCaudal = document.getElementById("value-gas-caudal");
        this._inputSimulationTime = document.getElementById("value-sim-time");
    }

    get v() { return parseFloat(this._inputV.value); }
    get c1() { return parseFloat(this._inputC1.value);}
    get c2() { return parseFloat(this._inputC2.value); }
    get m() { return parseFloat(this._inputM.value);}
    get exteriorTemperature() {return parseFloat(this._inputExteriorTemperature.value);}
    get interiorTemperature() { return parseFloat(this._inputInteriorTemperature.value); }
    get gasCaudal() { return parseFloat(this._inputGasCaudal.value);}
    get time() { return parseFloat(this._inputSimulationTime.value); }
}

class Main {

    constructor() {
        this.chart1 = new ProcessSimulationGraph(document.querySelector('#myChart1'));
        this.chart2 = new ProcessSimulationGraph(document.querySelector('#myChart2'));

        const inputs = document.querySelectorAll(".simulation-value");
        for (const input of inputs) {
            input.addEventListener('change', () => this.update())
        }

        this._options = new OptionsGUIPanel();


        this._displayTimeConstant1 = document.querySelectorAll(".display-time-constant1");
        this._displayTimeConstant2 = document.querySelectorAll(".display-time-constant2");
        this._displayTimeConstant3 = document.querySelectorAll(".display-time-constant3");

        this._showAnimation = true;
    }

    update() {
        const v = this._options.v;
        const c1 = this._options.c1;
        const c2 = this._options.c2;
        const m = this._options.m;
        const exteriorTemperature = this._options.exteriorTemperature;
        const interiorTemperature = this._options.interiorTemperature;
        const gasCaudal = this._options.gasCaudal;
        const time = this._options.time;
    
        const kc = 10; // 10, 25, 50, 100 y 500
        const kv = 2;
        const kh = 0.05;
        const targetTemperature = 24;
    
        const process1 = new OpenLoopProcess({
            name: `Lazo Abierto (V=${v})`,
            v, c1, c2, m, exteriorTemperature, interiorTemperature, gasCaudal,
        });
        const sim1 = new Simulation(process1, time);
        
        const process2 = new OpenLoopProcess({
            name: `Lazo Abierto (V=${v*2})`,
            v: v * 2, c1, c2, m, exteriorTemperature, interiorTemperature, gasCaudal,
        });
        const sim2 = new Simulation(process2, time);
    
        const process3 = new OpenLoopProcess({
            name: `Lazo Abierto (V=${v/2})`,
            v: v / 2, c1, c2, m, exteriorTemperature, interiorTemperature, gasCaudal,
        });
        const sim3 = new Simulation(process3, time);
    
        this.chart1.show([sim1], this._showAnimation);
        this.chart2.show([sim1, sim2, sim3], this._showAnimation);
        this._showAnimation = false;
        
        for (const element of this._displayTimeConstant1) element.innerHTML = sim1.getTimeConstant();
        for (const element of this._displayTimeConstant2) element.innerHTML = sim2.getTimeConstant();
        for (const element of this._displayTimeConstant3) element.innerHTML = sim3.getTimeConstant();
    }

}


let main;
window.addEventListener('load', () => {
    main = new Main();
    main.update();
});