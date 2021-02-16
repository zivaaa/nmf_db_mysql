import {EVENT_APP_EXIT} from "nmf/src/events.mjs";
import knex from 'knex'
import {BIND_DB_CONFIG} from "./consts.js";

/**
 * @namespace nmf
 */

/**
 * @memberOf nmf
 * @class DB
 */
export class DB {

    /**
     * @type {nmf.App}
     */
    app = undefined;

    /**
     * @type {Knex<any,*>}
     */
    knex = undefined;

    constructor(app) {
        this.app = app;
        this.app.em.on(EVENT_APP_EXIT, async () => {
            await this.disconnect();
        });
    }

    async connect() {
        /**
         * @type {nmf.DBConfig}
         */
        const config = this.app.ctx.fetch(BIND_DB_CONFIG);

        return new Promise((resolve, reject) => {
            try {
                this.knex = knex({
                    client: 'mysql',
                    connection: {
                        host: config.dbHost,
                        port: config.dbPort,
                        user: config.dbUser,
                        password: config.dbPassword,
                        database: config.dbName,
                        typeCast: function (field, next) {
                            if (field.type === 'DATETIME') {
                                // по умолчанию выводит в формате ISO, на надо нативно как в mysql
                                return field.string();
                            } else if (field.type === 'TINY' && field.length === 1) {
                                // переводим TINY в boolean
                                return (field.string() === '1'); // 1 = true, 0 = false
                            }
                            return next();
                        },
                    },
                });

                this.knex.raw("select 1=1").then((es) => {
                    resolve();
                }).catch(function (e) {
                    reject(e);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async disconnect() {
        if (this.knex) {
            await this.knex.destroy();
        }
    }
}
