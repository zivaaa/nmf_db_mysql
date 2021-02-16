import {BIND_DB_CONFIG, BIND_DB_REPO} from "./consts.js";
import path from "path";
import defaultModelLists from "./modelLists.js"

/**
 * @namespace nmf
 */

/**
 * @memberOf nmf
 * @class DBModelLoader
 */
export class DBModelLoader {
    /**
     * @type {nmf.App}
     * @private
     */
    _app = null;

    /**
     * @type {nmf.DBMeta}
     * @private
     */
    _meta = null;

    /**
     * @type {nmf.DBModelList[]}
     * @private
     */
    _lists = [];

    /**
     * @type {nmf.DBMetaModel[]}
     * @private
     */
    _models = [];

    constructor(app) {
        this._app = app;
    }

    /**
     * @return {Promise<DBModelLoader>}
     */
    async bind() {
        const config = /** @type {nmf.DBConfig} */ this.app.ctx.fetch(BIND_DB_CONFIG);
        if (!config) {
            throw new Error(`db config not found, did u bind ${BIND_DB_CONFIG}?`)
        }

        this._meta = (await import(path.join(this.app.root, config.metaPath))).default;

        if (!this._meta) {
            throw new Error(`seem's like file exists but metadata is not defined as required, did u use export default?`)
        }

        defaultModelLists.forEach(v => {
            this.registerList(v);
        });

        return this.handleMeta(this._meta);
    }

    /**
     * @param {nmf.DBMeta} meta
     * @return {this}
     */
    handleMeta(meta) {
        meta.lists.forEach(v => {
            this.registerList(v);
        });

        meta.models.forEach(v => {
            this.registerModel(v);
        });

        return this;
    }

    async resolve() {
        for await (let model of this._models) {
            const repo = this.app.ctx.fetch(model.repositoryKey);
            await repo.resolve();
        }
    }

    /**
     * @param {nmf.DBMetaModel} metaModel
     * @return {this}
     */
    registerModel(metaModel) {
        const repoKey = metaModel.repositoryKey ? metaModel.repositoryKey : `${BIND_DB_REPO}.${metaModel.table}`;

        const repository = new metaModel.repository(this.app, metaModel);
        metaModel.repositoryKey = repoKey;

        this.optimizeModel(metaModel).fillModelFieldLists(metaModel);

        this.app.ctx.bind(repoKey, repository);
        this._models.push(metaModel);

        metaModel.model.meta = metaModel;

        return this;
    }

    async resolve() {
        for await (const metaModel of this._models) {
            const repo = /** @type {nmf.BaseRepository} */ this.app.ctx.fetch(metaModel.repositoryKey);
            repo.prepare();
            await repo.resolve();
        }
    }

    /**
     * @param {nmf.DBMetaModel} metaModel
     * @return {this}
     */
    fillModelFieldLists(metaModel) {
        if (!metaModel.fieldLists) {
            metaModel.fieldLists = {};
        }

        for (let i = 0; i < this._lists.length; i++) {
            const list = this._lists[i];
            if (list.fn) {
                metaModel.fieldLists[list.list] = list.fn(metaModel, list);
            } else {
                const fieldsList = [];
                metaModel.fieldLists[list.list] = fieldsList;

                for (let j = 0; j < metaModel.fields.length; j++) {
                    const field = metaModel.fields[j];
                    if (field[list.property]) {
                        fieldsList.push(field.name);
                    }
                }
            }
        }

        return this;
    }

    /**
     * @param {nmf.DBMetaModel} metaModel
     * @return {this}
     */
    optimizeModel(metaModel) {
        if (!metaModel.fieldsByName) {
            metaModel.fieldsByName = {};
        }
        for (let j = 0; j < metaModel.fields.length; j++) {
            const field = metaModel.fields[j];
            metaModel.fieldsByName[field.name] = field;
        }
        return this;
    }

    /**
     * @param {nmf.DBModelList | nmf.DBModelList[]} list
     * @return {this}
     */
    registerList(list) {
        if (Array.isArray(list)) {
            list.forEach((v) => {
                this._lists.push(v);
            })
        } else {
            this._lists.push(list);
        }

        return this;
    }

    /**
     * @return {nmf.App}
     */
    get app() {
        return this._app;
    }
}