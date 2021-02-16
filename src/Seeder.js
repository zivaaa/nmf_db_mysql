import {BIND_DB_CONFIG, BIND_DB_SEEDER, BIND_DB_SOURCE} from "./consts.js";
import path from "path";

/**
 * @namespace nmf
 */

/**
 * @memberOf nmf
 * @class Seeder
 */
export class Seeder {
    /**
     * @type {nmf.App}
     */
    app = undefined;

    /**
     * @type {nmf.DB}
     */
    db = undefined;

    /**
     * @type {nmf.Seed[]}
     */
    seeds = [];

    /**
     * @type {Map<string, nmf.Seed>}
     * @private
     */
    _seeds = new Map();

    constructor(app, db) {
        this.app = app;
        this.db = db;
    }

    async resolve() {
        const config = /** @type {nmf.DBConfig} */ this.app.ctx.fetch(BIND_DB_CONFIG);
        if (config) {
            this.seeds = (await import(path.join(this.app.root, config.seedsPath))).default;
        }
    }

    /**
     * @param {nmf.Seed|nmf.Seed[]} seed
     */
    registerSeed(seed) {
        if (Array.isArray(seed)) {
            seed.forEach(v => this.registerSeed(v));
        } else {
            this._seeds.set(seed.name, seed);
        }
    }

    async seed(seedKey) {
        if (!this._seeds.has(seedKey)) {
            throw new Error(`seed '${seedKey}' does not exists`);
        }

        console.log(`seed '${seedKey}' is started`);
        await this._seeds.get(seedKey).seed(this.app, this.db);
        console.log(`seed '${seedKey}' is finished`);
    }

    /**
     * @return {Map<string, nmf.Seed>}
     */
    getAllSeeds() {
        return this._seeds;
    }

}
