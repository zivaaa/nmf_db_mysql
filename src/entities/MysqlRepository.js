import {BaseRepository} from "./BaseRepository.js";
import {BIND_DB_SOURCE, MODEL_FIELD_LIST, MODEL_FIELD_LIST_PRIMARY} from "../consts.js";

/**
 * @namespace nmf
 */

/**
 * @memberOf nmf
 * @class MysqlRepository
 */
export class MysqlRepository extends BaseRepository {
    /**
     *
     * @type {nmf.DB}
     */
    db = undefined;

    /**
     * @type {nmf.DBMetaModel}
     */
    metadata = undefined;

    /**
     * @param {nmf.App} app
     * @param {nmf.DBMetaModel} modelMetadata
     */
    constructor(app, modelMetadata) {
        super(app);
        this.metadata = modelMetadata;
    }

    prepare() {
        this.db = this.app.ctx.fetch(BIND_DB_SOURCE);
    }

    /**
     * methods
     */


    /**
     * @param {Object} where
     * @return {Promise<nmf.DBModel[]>}
     */
    async find(where) {
        const ms = await this.query().where(where).then();
        return this.doModels(ms);
    }

    /**
     * @param where
     * @async
     * @return {Promise<nmf.Application|nmf.DBModel|null>}
     */
    async findOne(where) {
        const m = await this.query().where(where).first().then();
        return m ? this.doModel(m) : null;
    }

    /**
     * получить чистый ответ без обертки в модель
     * @param where
     * @return {Promise<T>}
     */
    async n_findOne(where) {
        return await this.query().where(where).first();
    }

    /**
     *
     * @param cb
     * @return {Promise<nmf.DBModel[]>}
     */
    async findCb(cb) {
        const qb = this.query();
        cb(qb);
        return this.doModels(await qb.then());
    }

    /**
     *
     * @param cb
     * @return {Promise<nmf.DBModel|null>}
     */
    async findOneCb(cb) {
        const qb = this.query();
        cb(qb);
        const m = await qb.first();
        return m ? this.doModel(m) : null;
    }


    /**
     * @return {Promise<nmf.DBModel[]>}
     */
    async all() {
        return this.doModels(await this.allRaw());
    }

    /**
     * @return {Promise<Knex.Record[]>}
     */
    async allRaw() {
        return await this.query();
    }

    /**
     * @param data
     * @return {Promise<nmf.DBModel|undefined>}
     */
    async create(data) {
        const ids = await this.query().insert(data);

        if (this.metadata.incremental === false || ids.length === 0) {
            return null;
        }

        return await this.findOne({id: ids[0]});
    }

    /**
     * create multiple objects
     * @param {Object[]} items
     * @return {Promise<void>}
     */
    async createMultiple(items) {
        if (items.length > 0) {
            await this.query().insert(items);
        }
    }

    /**
     * @param data
     * @return {Promise<nmf.DBModel|null>}
     */
    async createAndReturnByIdentity(data) {
        const result = await super.create(data);
        if (result) {
            return result;
        }
        const identity = this.getModelIdentity(data);
        return await this.findOne(identity);
    }



    /**
     * обновление модели
     * обновятся только свойства из списка свойств модели!
     * @param {nmf.DBModel} model
     */
    async update(model) {
        const identity = this.getModelIdentity(model.props);

        if (!model.updateRequired()) {
            return model;
        }

        const upd = this.fetchOnlyFields(model.getDirties());
        if (Object.keys(upd).length === 0) {
            return model.commit();
        }

        await this.query().update(upd).where(identity);
        return model.commit();
    }


    /**
     * отфильтровать только относящиеся к модели атрибуты и вернуть
     * @param dirties
     * @private
     */
    fetchOnlyFields(dirties) {
        const upd = {};
        const fields = this.fieldLists[MODEL_FIELD_LIST];

        for (let i = 0; i < fields.length; i++) {
            if (Object.hasOwnProperty.call(dirties, fields[i])) {
                upd[fields[i]] = dirties[fields[i]];
            }
        }

        return upd;
    }

    /**
     * @param {nmf.DBModel} model
     * @return {Promise<nmf.DBModel>}
     */
    async refresh(model) {
        const identity = this.getModelIdentity(model.props);
        model.setProps(await this.n_findOne(identity));
        model.commit();
        return model;
    }

    async delete(model) {
        const identity = this.getModelIdentity(model.props);
        await this.query().where(identity).delete();
    }

    /**
     * @return {Knex.QueryBuilder<unknown, DeferredKeySelection.ReplaceBase<TResult, unknown>>}
     */
    query() {
        return this.db.knex.table(this.metadata.table);
    }

    /**
     * @return {string}
     */
    get table() {
        return this.metadata.table;
    }

    /**
     * @return {nmf.DBMetaModelField[]}
     */
    get fields() {
        return this.metadata.fields;
    }

    /**
     * @return {Object<string, string[]>}
     */
    get fieldLists() {
        return this.metadata.fieldLists;
    }

    /**
     * @return {typeof nmf.DBModel}
     */
    model() {
        return this.metadata.model;
    }

    /**
     * @param props
     * @return {nmf.DBModel}
     */
    doModel(props) {
        return !props ? null : new this.metadata.model(props);
    }

    /**
     * @param propsList
     * @return {[nmf.DBModel]}
     */
    doModels(propsList) {
        return this.metadata.model.make(propsList);
    }

    /**
     * get model primary data for finding exact model u need
     * @param props
     */
    getModelIdentity(props) {
        const primaries = this.metadata.fieldLists[MODEL_FIELD_LIST_PRIMARY];
        const o = {};
        for (let i = 0; i < primaries.length > 0; i++) {
            if (!props[primaries[i]]) {
                throw new Error(`identity field ${primaries[i]} is not exists in passed props!`);
            }
            o[primaries[i]] = props[primaries[i]];
        }
        return o;
    }

    /**
     * @param {Knex.QueryBuilder} query
     * @param {number} by
     * @return {Object}
     */
    iterableChunk(query, by ) {
        const repo = this;

        return {
            query: query,
            by: by,

            [Symbol.asyncIterator]() {
                return {
                    offset: 0,
                    total: null,
                    by: this.by,
                    /**
                     * @type {QueryBuilder}
                     */
                    query: this.query,

                    async next() {
                        if (this.total === null) {
                            const total = await this.query.clone().count("* as cnt");
                            this.total = total.length > 0 ? total[0].cnt : 0;
                        }

                        if (this.offset >= this.total) {
                            return {done: true};
                        }

                        const result = await query.offset(this.offset).limit(this.by);
                        this.offset += this.by;

                        if (result.length > 0) {
                            return {done: false, value: repo.doModels(result)};
                        } else {
                            return {done: true};
                        }
                    }
                };
            }
        };
    }
}