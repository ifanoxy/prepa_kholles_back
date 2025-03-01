"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lru_cache_1 = __importDefault(require("lru-cache"));
class Manager {
    constructor(database, tableName, cacheOptions = {}) {
        this.database = database;
        this.tableName = tableName;
        this.cache = new lru_cache_1.default({
            max: cacheOptions.maxSize || 1000,
            ttl: cacheOptions.ttl || 24 * 60 * 60000,
            updateAgeOnGet: true,
        });
        this.cacheDependencies = new Map();
    }
    generateCacheKey(method, args) {
        return `${method}:${this.tableName}:${JSON.stringify(args)}`;
    }
    trackDependency(key) {
        if (!this.cacheDependencies.has(this.tableName)) {
            this.cacheDependencies.set(this.tableName, new Set());
        }
        this.cacheDependencies.get(this.tableName).add(key);
    }
    invalidateDependencies() {
        const dependencies = this.cacheDependencies.get(this.tableName);
        if (dependencies) {
            for (const key of dependencies) {
                this.cache.delete(key);
            }
            this.cacheDependencies.delete(this.tableName);
        }
    }
    /**
     * Transforme les objets nodeJS en string permettant une recherche sécurisé par requête SQL
     *
     * @param {Record<string, any>} where les wheres de la requetes
     * @private
     */
    formatWhere(where) {
        return Object.entries(where)
            .map(([key, value]) => {
            if (typeof value === "string") {
                return `\`${key}\`='${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
            }
            else if (typeof value === "number" || typeof value === "boolean") {
                return `\`${key}\`=${value}`;
            }
            else {
                return `\`${key}\` IS NULL`;
            }
        })
            .join(" AND ");
    }
    /**
     * Transforme les objets nodeJS en string permettant une recherche sécurisé par requête SQL
     *
     * @param {Record<string, any>} values les valeurs de la requetes
     * @private
     */
    formatSet(values) {
        return Object.entries(values)
            .map(([key, value]) => {
            if (typeof value === "string") {
                return `\`${key}\`='${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
            }
            else if (typeof value === "number" || typeof value === "boolean") {
                return `\`${key}\`=${value}`;
            }
            else {
                return `\`${key}\`= NULL`;
            }
        })
            .join(", ");
    }
    /**
     * Transforme les objets nodeJS en string permettant une recherche sécurisé par requête SQL
     *
     * @param {Record<string, any>} values les valeurs entrée par l'utilisateur
     * @private
     */
    formatValues(values) {
        return Object.entries(values)
            .map(([key, value]) => {
            if (typeof value === "string") {
                return `'${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
            }
            else if (typeof value === "number" || typeof value === "boolean") {
                return value;
            }
            else {
                return "NULL";
            }
        })
            .join(", ");
    }
    /**
     * Obtenir une valeur de la base de donnée
     *
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {(Keys & PrimaryKeys)[]} includes Les attributs qui seront retournée (* par défaut)
     */
    async get(where, includes = "*") {
        const cacheKey = this.generateCacheKey("get", [where, includes]);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const result = (await this.database.query(`SELECT ${includes === "*" ? "*" : "`" + includes.join("`,`") + "`"} FROM ${this.tableName} WHERE ${this.formatWhere(where)} LIMIT 1`))[0];
        this.cache.set(cacheKey, result);
        this.trackDependency(cacheKey);
        return result;
    }
    /**
     * Obtenir une liste de valeurs de la base de donnée
     *
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {(Keys & PrimaryKeys)[]} includes Les attributs qui seront retournée (* par défaut)
     * @param {getAllOptions} options les options de la requête
     */
    async getAll(where, includes = "*", options = { offset: 0, limits: 100, orderBy: "", beforeId: null }) {
        options.beforeId = typeof options.beforeId == "number" ? options.beforeId : null;
        const cacheKey = this.generateCacheKey("getAll", [where, includes, options]);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const result = (await this.database.query(`SELECT ${includes === "*" ? "*" : "`" + includes.join("`,`") + "`"} FROM ${this.tableName} ${where ? `WHERE ${this.formatWhere(where)} ${(options.beforeId !== null ? `AND id <= ${options.beforeId} ` : '')}` : (options.beforeId !== null ? `WHERE id <= ${options.beforeId} ` : '')}${options.orderBy ? `ORDER BY ${options.orderBy}` : ""} LIMIT ${options.limits ?? 10} OFFSET ${options.offset ?? 0}`));
        this.cache.set(cacheKey, result);
        this.trackDependency(cacheKey);
        return result;
    }
    /**
     * Permet d'ajouter des valeurs ou une liste de valeurs en base de donnée
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    async insert(values) {
        const result = await this.database.query(`INSERT INTO ${this.tableName} (\`${Array.isArray(values) ? Object.keys(values[0]).join("`, `") : Object.keys(values).join("`, `")}\`) VALUES (${Array.isArray(values) ? values.map(x => this.formatValues(Object.values(x))).join("), (") : this.formatValues(Object.values(values))})`);
        this.invalidateDependencies();
        return result;
    }
    /**
     * Permet d'ajouter des valeurs ou une liste de valeurs en base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    async update(where, values) {
        const result = await this.database.query(`UPDATE ${this.tableName} SET ${this.formatSet(values)} WHERE ${this.formatWhere(where)}`);
        this.invalidateDependencies();
        return result;
    }
    /**
     * Permet de supprimer des lignes en base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     */
    async delete(where) {
        const result = await this.database.query(`DELETE FROM ${this.tableName} WHERE ${this.formatWhere(where)}`);
        this.invalidateDependencies();
        return result;
    }
    /**
     * Vérifie si une ligne est existante dans la base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where
     */
    async has(where) {
        const cacheKey = this.generateCacheKey("has", [where]);
        const has = (await this.size(where)) >= 1;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        this.cache.set(cacheKey, has);
        this.trackDependency(cacheKey);
        return has;
    }
    /**
     * Renvoie le nombre de ligne en base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where
     */
    async size(where) {
        const cacheKey = this.generateCacheKey("size", [where]);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const result = (await this.database.query(`SELECT COUNT(*) as count FROM ${this.tableName} ${where ? ` WHERE ${this.formatWhere(where)}` : ""}`))[0];
        this.cache.set(cacheKey, result.count);
        this.trackDependency(cacheKey);
        return result.count;
    }
    /**
     * Retourne une ligne si elle existe sinon renvoie null
     * @param {PrimaryKeys & Partial<Keys>} where
     * @param {(Keys & PrimaryKeys)[]} includes Les attributs qui seront retournée (* par défaut)
     */
    async getIfExists(where, includes = "*") {
        try {
            const get = await this.get(where, includes);
            return get ? get : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Modifie ou Ajoute une ligne dans la base de donnée
     * @param {PrimaryKeys & Partial<Keys>} where
     * @param {PrimaryKeys & Keys | (PrimaryKeys & Keys)[]} values
     */
    async UpdateOrCreate(where, values) {
        return await this.has(where) ? this.update(where, values) : this.insert({ ...values, ...where });
    }
}
exports.default = Manager;
