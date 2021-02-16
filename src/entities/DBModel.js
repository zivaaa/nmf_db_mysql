import {DateTime} from "luxon";
import {MODEL_FIELD_LIST_NOT_PROTECTED, MODEL_FIELD_LIST_PROTECTED} from "../consts.js";


/**
 * @namespace nmf
 */

/**
 * @memberOf nmf
 * @class DBModel
 */
export class DBModel {
    /**
     * @type {{}}
     */
    props = {}; //real data

    /**
     * @type {{}}
     */
    dirties = {}; // dirty vals for save

    /**
     * @type {{}}
     * @private
     */
    _store = {}; // cache storage


    constructor(props) {
        this.setPropsDirect(props);
    }

    /**
     * @public
     * get real prop
     * @param propName
     * @return {*}
     */
    prop(propName) {
        return this.props[propName];
    }

    /**
     * @param propName
     * @return {DateTime}
     */
    date(propName) {
        return DateTime.fromSQL(this.prop(propName));
    }

    /**
     * @param propName
     * @param compared
     * @return {boolean}
     */
    isPropEqual(propName, compared) {
        return this.props[propName] === compared;
    }

    /**
     *
     * @param propName
     * @return {*}
     */
    get(propName) {
        return (this.dirties.hasOwnProperty(propName)) ? this.dirties[propName] : this.props[propName];
    }

    /**
     * set dirty prop (commit required)
     * @param propName
     * @param propVal
     * @return {this}
     */
    setProp(propName, propVal) {
        this.dirties[propName] = propVal ?? null;
        return this;
    }

    /**
     * set prop direct
     * @param propName
     * @param propVal
     * @return {this}
     */
    setPropDirect(propName, propVal) {
        this.props[propName] = propVal;
        return this;
    }

    /**
     * all props to save
     * @return {{}}
     */
    getDirties() {
        return this.dirties;
    }

    /**
     * all real assigned props
     * @return {{}}
     */
    getProps() {
        return this.props;
    }

    /**
     * set dirties to save
     * @param dirties
     * @return {this}
     */
    setProps(dirties) {
        this.dirties = {};
        for (let d in dirties) {
            this.dirties[d] = dirties[d];
        }
        return this;
    }

    // setPropsRaw(dirties) {
    //     this.dirties = dirties;
    //     return this;
    // }

    /**
     * set props bypassing commit
     * @param props
     * @return {this}
     */
    setPropsDirect(props) {
        this.props = {};
        for (let prop in props) {
            this.props[prop] = props[prop];
        }
        return this;
    }

    /**
     * save external data
     * @param key
     * @param val
     * @return {nmf.DBModel}
     */
    keep(key, val) {
        this._store[key] = val;
        return this;
    }

    /**
     * get external data
     * @param key
     * @return {*}
     */
    getKept(key) {
        return this._store[key] || null;
    }

    /**
     * does it has external data
     * @param key
     * @return {boolean}
     */
    doesKept(key) {
        return this._store.hasOwnProperty(key);
    }

    /**
     * clear external data
     * @param key
     */
    unKeep(key) {
        delete this._store[key];
    }

    /**
     * return raw data
     * @return {{}}
     */
    raw() {
        return this.props;
    }

    /**
     * set dirties to props (use this after update)
     */
    commit() {
        this.setPropsDirect(
            {
                ...this.props,
                ...this.dirties
            }
        );

        this.dirties = {};
        return this;
    }

    /**
     * есть ли изменения, которые надо сохранить
     * @returns {boolean}
     */
    updateRequired() {
        return Object.keys(this.dirties).length !== 0
    }

    /**
     * get all fields beside of protected
     */
    toDTO() {
        const dto = {};

        for (let i in this.props) {
            dto[i] = this.props[i];
        }

        const meta = this.getMeta();

        for (let i = 0; i < meta.fieldLists[MODEL_FIELD_LIST_PROTECTED].length; i++) {
            const field = meta.fieldLists[MODEL_FIELD_LIST_PROTECTED][i];
            if (dto.hasOwnProperty(field)) {
                delete dto[field];
            }
        }

        return dto;
    }

    /**
     * Pick only passed fields
     * @param props
     */
    toDTOOf(props) {
        const obj = {};
        for (let i = 0; i < props.length; i++) {
            obj[props[i]] = this.props[props[i]];
        }
        return obj;
    }

    /**
     * Pick only fields from meta.{model}.fields.{NAME_OF_FIELD_LIST}
     * @param modelFieldsName
     */
    toDTOBy(modelFieldsName = MODEL_FIELD_LIST_NOT_PROTECTED) {
        if (!this.getMeta().fieldLists[modelFieldsName]) {
            throw new Error("unknown field set " + modelFieldsName);
        }
        return this.toDTOOf(this.getMeta().fieldLists[modelFieldsName]);
    }

    /**
     * @return {nmf.DBMetaModel}
     */
    getMeta() {
        return this.constructor.meta;
    }


    /**
     * @param props
     * @return {nmf.DBModel|nmf.DBModel[]}
     */
    static make(props) {
        if (Array.isArray(props)) {
            const models = [];
            for (let i = 0; i < props.length; i++) {
                models.push(new this(props[i]));
            }
            return models;
        } else {
            return props ? new this(props) : null;
        }
    }

    /**
     * @type {nmf.DBMetaModel}
     */
    static meta = null;
}
