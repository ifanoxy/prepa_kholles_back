import Database from "./Database";
import {IncludesType} from "../../types/database/Includes";

export default class Manager<PrimaryKeys extends Record<string, any>, Keys extends Record<string, any>> {
    constructor(private database: Database, public readonly tableName: string)
    {

    }

    /**
     * Transforme les objets nodeJS en string permettant une recherche sécurisé par requête SQL
     *
     * @param where
     * @private
     */
    private formatWhere(where: Record<string, any>): string {
        return Object.entries(where).map(([key, value]) => {
            if (typeof value === "string") {
                return `\`${key}\`='${value.replace(/'/g, "''")}'`;
            } else if (typeof value === "number" || typeof value === "boolean") {
                return `\`${key}\`=${value}`;
            } else {
                return `\`${key}\` IS NULL`;
            }
        }).join(" AND ");
    }


    /**
     * Obtenir une valeur de la base de donnée
     *
     * @param {PrimaryKeys & Partial<Keys>} where Les conditions d'identifications
     * @param {(Keys & PrimaryKeys)[]} includes Les attributs qui seront retournée (* par défaut)
     */
    public async get(where: PrimaryKeys & Partial<Keys>, includes: IncludesType<Keys & PrimaryKeys> = ["*"]): Promise<PrimaryKeys & Keys>
    {
        return (await this.database.query(`SELECT ${includes.join(",")} FROM ${this.tableName} WHERE ${this.formatWhere(where)}`))[0] as unknown as PrimaryKeys & Keys;
    }
}