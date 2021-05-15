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

        this._inputTargetTemp = document.getElementById("value-target-temp");
        this._inputKcList1 = document.getElementById("value-kc-list1");
        this._inputKcList2 = document.getElementById("value-kc-list2");
        this._inputKv = document.getElementById("value-kv");
        this._inputKh = document.getElementById("value-kh");
        this._inputKt = document.getElementById("value-kt");
        this._inputFsv = document.getElementById("value-fsv");
        this._inputFk = document.getElementById("value-fk");
    }

    get v() { return parseFloat(this._inputV.value); }
    get c1() { return parseFloat(this._inputC1.value);}
    get c2() { return parseFloat(this._inputC2.value); }
    get m() { return parseFloat(this._inputM.value);}
    get exteriorTemperature() {return parseFloat(this._inputExteriorTemperature.value);}
    get interiorTemperature() { return parseFloat(this._inputInteriorTemperature.value); }
    get gasCaudal() { return parseFloat(this._inputGasCaudal.value);}
    get time() { return parseFloat(this._inputSimulationTime.value); }

    get kcValues1() { return this._inputKcList1.value.split(',').map(v => parseFloat(v)); }
    get kcValues2() { return this._inputKcList2.value.split(',').map(v => parseFloat(v)); }
    get kv() { return parseFloat(this._inputKv.value); }
    get kh() { return parseFloat(this._inputKh.value); }
    get kt() { return parseFloat(this._inputKt.value); }
    get fsv() { return parseFloat(this._inputFsv.value); }
    get fk() { return parseFloat(this._inputFk.value); }
    get targetTemp() { return parseFloat(this._inputTargetTemp.value); }
}

class Main {

    constructor() {
        this._chart1 = new ProcessSimulationGraph(document.querySelector('#chart1'));
        this._chart2 = new ProcessSimulationGraph(document.querySelector('#chart2'));
        this._chart3 = new ProcessSimulationGraph(document.querySelector('#chart3'));
        this._chart4 = new ProcessSimulationGraph(document.querySelector('#chart4'), false);

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
        this.tp1();
        this.tp2();
        this.tp3();
        
        this._showAnimation = false;
    }

    _createOpenLoopProcess(name, v) { 
        const c1 = this._options.c1;
        const c2 = this._options.c2;
        const m = this._options.m;
        const exteriorTemperature = this._options.exteriorTemperature;
        const interiorTemperature = this._options.interiorTemperature;
        const gasCaudal = this._options.gasCaudal;

        return new OpenLoopProcess({
            name, info: `V=${v}`, 
            v,  c1,  c2,  m,  exteriorTemperature,  interiorTemperature,  gasCaudal,
        });
    }

    _createFirstOrderClosedLoopProcess(name, kc) { 
        const v = this._options.v;
        const c1 = this._options.c1;
        const c2 = this._options.c2;
        const m = this._options.m;
        const exteriorTemperature = this._options.exteriorTemperature;
        const interiorTemperature = this._options.interiorTemperature;
        const gasCaudal = this._options.gasCaudal;
        const kv = this._options.kv;
        const kh = this._options.kh;
        const targetTemperature = this._options.targetTemp;

        return new FirstOrderClosedLoopProcess({
            name, info: `KC=${kc}`,
            v, c1, c2, m, exteriorTemperature, interiorTemperature, gasCaudal,
            kc, kv, kh, targetTemperature,
        });
    }

    _createSecondOrderClosedLoopProcess(name, kc) { 
        const v = this._options.v;
        const c1 = this._options.c1;
        const c2 = this._options.c2;
        const m = this._options.m;
        const exteriorTemperature = this._options.exteriorTemperature;
        const interiorTemperature = this._options.interiorTemperature;
        const gasCaudal = this._options.gasCaudal;
        const kv = this._options.kv;
        const kh = this._options.kh;
        const targetTemperature = this._options.targetTemp;
        const kt = this._options.kt;
        const fsv = this._options.fsv;
        const fk = this._options.fk;

        return new SecondOrderClosedLoopProcess({
            name, info: `KC=${kc}`,
            v, c1, c2, m, exteriorTemperature, interiorTemperature, gasCaudal,
            kc, kv, kh, targetTemperature, kt, fsv, fk,
        });
    }

    tp1() {
        const v = this._options.v;
        const process1 = this._createOpenLoopProcess("Proceso A", v);
        const process2 = this._createOpenLoopProcess("Proceso B", v * 2);
        const process3 = this._createOpenLoopProcess("Proceso C", v / 2);

        const time = this._options.time;
        const sim1 = new Simulation(process1, time);
        const sim2 = new Simulation(process2, time);
        const sim3 = new Simulation(process3, time);
    
        this._chart1.show([sim1], this._showAnimation);
        this._chart2.show([sim1, sim2, sim3], this._showAnimation);

        for (const element of this._displayTimeConstant1) element.innerHTML = sim1.getTimeConstant();
        for (const element of this._displayTimeConstant2) element.innerHTML = sim2.getTimeConstant();
        for (const element of this._displayTimeConstant3) element.innerHTML = sim3.getTimeConstant();
    }

    tp2() {
        const simulations = [];
        let strTimeConstant = "<ul>";
        let strKConstant = "<ul>";
        let strSSEConstant = "<ul>";
        
        for (let kc of this._options.kcValues1) {
            const letter = String.fromCharCode(65 + simulations.length);
            const process = this._createFirstOrderClosedLoopProcess(`Lazo ${letter}`, kc);
            const simulation = new Simulation(process, this._options.time);
            simulations.push(simulation);

            strTimeConstant += `<li><b>${process.name}</b>: La constante de tiempo value <code>${process.getTimeConstant()}h</code>.</li>`;
            strKConstant += `<li><b>${process.name}</b>: El valor de K es: <code>${process.getK()}</code> (Kp = <code>${process.getKp()}</code>)</li>`;
            strSSEConstant += `<li><b>${process.name}</b>: El valor del error estacionario es: <code>${process.getSteadyStateError()}</code>.</li>`;
        }
        
        this._chart3.show(simulations, this._showAnimation);
        
        strTimeConstant += "</ul>";
        strKConstant += "</ul>";
        strSSEConstant += "</ul>";
        document.querySelector("#display-closed-loop1-time-constant").innerHTML = strTimeConstant;
        document.querySelector("#display-closed-loop1-k").innerHTML = strKConstant;
        document.querySelector("#display-closed-loop1-sse").innerHTML = strSSEConstant;
    }

    tp3() {
        const simulations = [];
        let strKConstant = "<ul>";
        let strSSEConstant = "<ul>";
        
        for (let kc of this._options.kcValues2) {
            const letter = String.fromCharCode(65 + simulations.length);
            const process = this._createSecondOrderClosedLoopProcess(`Lazo ${letter}`, kc);
            const simulation = new Simulation(process, this._options.time);
            simulations.push(simulation);

            strKConstant += `<li><b>${process.name}</b>: El valor de K es: <code>${process.getK()}</code> (Kp = <code>${process.getKp()}</code>)</li>`;
            strSSEConstant += `<li><b>${process.name}</b>: El valor del error estacionario es: <code>${process.getSteadyStateError()}</code>.</li>`;
        }
        
        this._chart4.show(simulations, this._showAnimation);
        
        strKConstant += "</ul>";
        strSSEConstant += "</ul>";
        document.querySelector("#display-closed-loop2-k").innerHTML = strKConstant;
        document.querySelector("#display-closed-loop2-sse").innerHTML = strSSEConstant;
    }
}


let main;
window.addEventListener('load', () => {
    main = new Main();
    main.update();
});