class OptionsGUIPanel {
    constructor() {
        document.getElementById('value-pd').value = [
            '50, 50',
            '50, 100',
            '100, 100',
            '100, 500',
            '500, 100',
            '500, 500',
        ].join('\n');

        document.getElementById('value-pi').value = [
            '10, 0.5',
            '10, 1',
            '10, 5',
            '10, 10',
            '50, 0.5',
            '50, 1',
            '50, 5',
            '50, 10',
        ].join('\n');

        document.getElementById('value-pid').value = [
            '10, 50, 0.5',
            '10, 100, 1',
            '10, 100, 5',
            '100, 100, 0.5',
            '100, 100, 1',
            '100, 500, 5',
            '500, 100, 0.5',
            '500, 500, 1',
            '500, 500, 5',
        ].join('\n');
    }

    input(name) {
        return document.getElementById('value-' + name).value;
    }

    float(name) {
        return parseFloat(this.input(name));
    }

    list(name) {
        return this.input(name).split(',').map(v => parseFloat(v));
    }

    multiLines(name, perRowCallback) {
        return this.input(name).split('\n').map(v => { 
            const values = v.split(',').map(v => parseFloat(v)); 
            return perRowCallback(...values);
        });
    }

    get v() { return this.float('v'); }
    get c1() { return this.float('c1'); }
    get c2() { return this.float('c2'); }
    get m() { return this.float('m'); }
    get exteriorTemperature() { return this.float('temp-ext');}
    get interiorTemperature() { return this.float('temp-int');}
    get gasCaudal() { return this.float('gas-caudal'); }
    get time() { return this.float('sim-time'); }

    get kcValues1() { return this.list('kc-list1'); }
    get kcValues2() { return this.list('kc-list2'); }

    get kv() { return this.float('kv'); }
    get kh() { return this.float('kh'); }
    get kt() { return this.float('kt'); }
    get fsv() { return this.float('fsv'); }
    get fk() { return this.float('fk'); }
    get targetTemp() { return this.float('target-temp'); }

    get pdValues() { return this.multiLines('pd', (kc, kd) => ({kc, kd, ki: 0})); }
    get piValues() { return this.multiLines('pi', (kc, ki) => ({kc, kd: 0, ki})); }
    get pidValues() { return this.multiLines('pid', (kc, kd, ki) => ({kc, kd, ki})); }
}

class OpenLoopProcessFactory {
    constructor(optionsGuiPanel) {
        this._options = optionsGuiPanel;
    }

    create(name, volumeMultiplier) { 
        const opts = this._options;
        const process = new Process(opts.v * volumeMultiplier, opts.c1, opts.c2, opts.m, opts.interiorTemperature, opts.exteriorTemperature);
        return new OpenLoop(name, `V=${opts.v * volumeMultiplier}`, process, this._options.gasCaudal);
    }
}

class FirstOrderProcessFactory {
    constructor(optionsGuiPanel) {
        this._options = optionsGuiPanel;
    }

    create(name, kc) { 
        const opts = this._options;
        const sensor = new LinearSensor(opts.kh);
        const controller = new LinearControl(kc);
        const valve = new LinearValve(opts.kv);
        const process = new Process(opts.v, opts.c1, opts.c2, opts.m, opts.interiorTemperature, opts.exteriorTemperature);
        return new ClosedLoop(name, `KC=${kc}`, process, sensor, controller, valve, opts.targetTemp);
    }
}

class SecondOrderProcessFactory {
    constructor(optionsGuiPanel) {
        this._options = optionsGuiPanel;
    }
    create(name, kc) { 
        const opts = this._options;
        const sensor = new LinearSensor(opts.kh);
        const controller = new LinearControl(kc);
        const valve = new RealValve(opts.fsv, opts.fk, opts.kt);
        const process = new Process(opts.v, opts.c1, opts.c2, opts.m, opts.interiorTemperature, opts.exteriorTemperature);
        return new ClosedLoop(name, `KC=${kc}`, process, sensor, controller, valve, opts.targetTemp);
    }
}

class ThirdOrderProcessFactory {
    constructor(optionsGuiPanel) {
        this._options = optionsGuiPanel;
    }
    create(name, kc, kd, ki) { 
        const opts = this._options;
        const sensor = new LinearSensor(opts.kh);
        const controller = new RealControl(kc, kd, ki);
        const valve = new RealValve(opts.fsv, opts.fk, opts.kt);
        const process = new Process(opts.v, opts.c1, opts.c2, opts.m, opts.interiorTemperature, opts.exteriorTemperature);
        return new ClosedLoop(name, `KC=${kc}, KD=${kd}, KI=${ki}`, process, sensor, controller, valve, opts.targetTemp);
    }
}

class Main {

    constructor() {
        this._chart1 = new ProcessSimulationGraph(document.querySelector('#chart1'));
        this._chart2 = new ProcessSimulationGraph(document.querySelector('#chart2'));
        this._chart3 = new ProcessSimulationGraph(document.querySelector('#chart3'));
        this._chart4 = new ProcessSimulationGraph(document.querySelector('#chart4'), false);

        this._chart5 = new ProcessSimulationGraph(document.querySelector('#chart5'), false);
        this._chart6 = new ProcessSimulationGraph(document.querySelector('#chart6'), false);
        this._chart7 = new ProcessSimulationGraph(document.querySelector('#chart7'), false);

        
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
        this.tp4();

        this._showAnimation = false;
    }

    tp1() {
        const factory = new OpenLoopProcessFactory(this._options);
        const process = factory.create("Proceso A", 1.0);
        this.showChart(this._chart1, [process]);

        const process1 = factory.create("Proceso A", 1.0);
        const process2 = factory.create("Proceso B", 2.0);
        const process3 = factory.create("Proceso C", 0.5);
        this.showChart(this._chart2, [process1, process2, process3]);

        for (const element of this._displayTimeConstant1) element.innerHTML = process1.getTau().toFixed(2);
        for (const element of this._displayTimeConstant2) element.innerHTML = process2.getTau().toFixed(2);
        for (const element of this._displayTimeConstant3) element.innerHTML = process3.getTau().toFixed(2);
    }

    showChart(chart, processes) {
        chart.show(processes, this._options.time, this._showAnimation);
    }

    createProcesses(kcValues, factory) {
        return kcValues.map((kc, i) => {
            const letter = String.fromCharCode(65 + i);
            return factory.create(`Lazo ${letter}`, kc);
        })
    }

    processesHtmlList(processes, selector, perItemCallback) {
        document.querySelector(selector).innerHTML = '<ul>' + processes.map(process => {
            return `<li><b>${process.getName()}</b>: ` + perItemCallback(process) + '</li>'; 
        }).join('') + '</ul>';
    }

    tp2() {
        const factory = new FirstOrderProcessFactory(this._options);
        const processes = this.createProcesses(this._options.kcValues1, factory);
        this.showChart(this._chart3, processes);
        
        this.processesHtmlList(processes, "#display-closed-loop1-time-constant", (process) => {
            return `La constante de tiempo value <code>${process.getTau().toFixed(2)}h</code>.`;
        });
        this.processesHtmlList(processes, "#display-closed-loop1-k", (process) => {
            return `El valor de K es: <code>${process.getK().toFixed(2)}</code>`;
        });
        this.processesHtmlList(processes, "#display-closed-loop1-sse", (process) => {
            return `El valor del error estacionario es: <code>${process.getSteadyStateError().toFixed(2)}</code>.`;
        });
    }

    tp3() {
        const factory = new SecondOrderProcessFactory(this._options);
        const processes = this.createProcesses(this._options.kcValues2, factory);
        this.showChart(this._chart4, processes);

        this.processesHtmlList(processes, "#display-closed-loop2-k", (process) => {
            return `El valor de K es: <code>${process.getK().toFixed(2)}</code>`;
        });
        this.processesHtmlList(processes, "#display-closed-loop2-sse", (process) => {
            return `El valor del error estacionario es: <code>${process.getSteadyStateError().toFixed(2)}</code> (Temperatura de estabilización = <code>${process.getStabilizationValue().toFixed(2)} grados</code>).`;
        });
    }

    createProcessesTP4(controllerValues, factory) {
        return controllerValues.map((controllerValue, i) => {
            const letter = String.fromCharCode(65 + i);
            return factory.create(`Lazo ${letter}`, controllerValue.kc, controllerValue.kd, controllerValue.ki);
        })
    }

    tp4() {
        const factory = new ThirdOrderProcessFactory(this._options);
        const processesPD = this.createProcessesTP4(this._options.pdValues, factory);
        this.showChart(this._chart5, processesPD);

        const processesPI = this.createProcessesTP4(this._options.piValues, factory);
        this.showChart(this._chart6, processesPI);

        const processesPID = this.createProcessesTP4(this._options.pidValues, factory);
        this.showChart(this._chart7, processesPID);
    }
}


let main;
window.addEventListener('load', () => {
    main = new Main();
    main.update();
});