import * as fs from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';
import * as R from 'ramda';
import { BenchmarkType, DurationMeasurementMode } from './benchmarksCommon';
import { CPUBenchmarkPuppeteer, fileNameTrace } from './benchmarksPuppeteer';
import { config, initializeFrameworks } from './common';
import { computeResultsCPU } from './forkedBenchmarkRunnerPuppeteer';
import {benchmarks} from "./benchmarkConfiguration";
import { writeResults } from "./writeResults";
// let TimelineModelBrowser = require("./timeline-model-browser.js");
let Tracelib = require('tracelib').default;
// import Tracelib from 'tracelib';
//var DevtoolsTimelineModel = require('devtools-timeline-model');

async function main() {



    for (let i = 0; i < 12; i++) {
        let trace = `traces/xania-v0.3.3-keyed_01_run1k_${i}.json`;
        console.log(trace, await computeResultsCPU(trace, DurationMeasurementMode.LAST_PAINT))
    }


}

async function readAll() {
    let jsonResult: { framework: string; benchmark: string; values: number[] }[] = [];

    let puppeteerCPUBenchmarks: Array<CPUBenchmarkPuppeteer> = benchmarks.filter(b => b instanceof CPUBenchmarkPuppeteer) as Array<CPUBenchmarkPuppeteer>;
    
    let frameworks = await initializeFrameworks();
    for (let framework of frameworks) {
        for (let benchmark of puppeteerCPUBenchmarks) {
            let results: number[] = [];
            for (let i = 0; i < 12; i++) {
                let trace = `${fileNameTrace(framework, benchmark.benchmarkInfo, i)}`;
                if (!fs.existsSync(trace)) {
                    console.log("ignoring ", trace, "since it doesn't exist.");
                } else {
                    console.log("checking ", trace, benchmark.benchmarkInfo.durationMeasurementMode);
                    let result = await computeResultsCPU(trace, benchmark.benchmarkInfo.durationMeasurementMode); 
                    results.push(result);
                    console.log(result);
                }
            }
            results.sort((a: number, b: number) => a - b);
            results = results.slice(0, config.NUM_ITERATIONS_FOR_BENCHMARK_CPU);      
            await writeResults(config, {
                framework: framework,
                benchmark: benchmark.benchmarkInfo,
                results: results,
                type: BenchmarkType.CPU
              });
        }
    }
}

main().then(() => { }); 