import {BIND_DB_CONFIG, BIND_DB_SOURCE} from "./consts.js";
import path from "path"

/**
 * @namespace nmf
 */

/**
 * @memberOf nmf
 * @class Migrator
 */
export class Migrator {

    /**
     * @type {nmf.App}
     */
    app = undefined;

    /**
     * @type {nmf.DB}
     */
    db = undefined;

    /**
     * @type {nmf.Migration[]}
     */
    migrations = [];

    constructor(app, db) {
        this.app = app;
        this.db = db;
    }


    async resolve() {
        const config = /** @type {nmf.DBConfig} */ this.app.ctx.fetch(BIND_DB_CONFIG);
        if (config) {
            const migrations = (await import(path.join(this.app.root, config.migrationsPath))).default;
            this.setMigrations(migrations)
        } else {
            this.setMigrations([]);
        }
    }


    /**
     * @param {nmf.Migration[]}
     */
    setMigrations(migrations) {
        this.migrations = migrations;
    }

    /**
     * @return {Promise<void>}
     */
    async up() {
        await this.createTableIfNeed();

        for (let [i,m] of this.migrations.entries()) {
            if (await this.hasMigration(i) === false) {
                await this.commitUp(i, m);
            }
        }
    }

    async down(all = false) {
        await this.createTableIfNeed();

        for (let [i,m] of this.migrations.reverse().entries()) {
            if (await this.hasMigration(i) === true) {
                await this.commitDown(i, m);
                if (!all) {
                    break;
                }
            }
        }
    }

    async commitUp(index, migration) {
        console.log(`#${index} migration will be executed`);
        await migration.up(this, this.db);
        await this.db.knex.table("migrations").insert({
            id: index
        });
    }

    async commitDown(index, migration) {
        console.log(`#${index} migration will be purged`);
        await migration.down(this, this.db);
        await this.db.knex.table("migrations").where({
            id: index
        }).delete();
    }

    async createTableIfNeed() {
        const hasTable = await this.hasMigrationTable();

        if (!hasTable) {
            console.log("migrations table creating");
            await this.createMigratorTable();
        }
    }

    /**
     * @param index
     * @return {Promise<boolean>}
     */
    async hasMigration(index) {
        const m = await this.db.knex.table("migrations").where("id", index).first();
        return !!m;
    }

    async createMigratorTable() {
        return new Promise((resolve, reject) => {
            this.db.knex.schema.createTable("migrations", (table) => {
                table.integer("id").primary();
            }).then(resolve);
        });
    }

    async hasMigrationTable() {
        return new Promise((resolve, reject) => {
            this.db.knex.schema.hasTable('migrations').then(function(exists) {
                resolve(exists);
            });
        });
    }
}
