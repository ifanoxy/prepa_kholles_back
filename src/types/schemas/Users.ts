import { UserPermissions } from "../UserPermissions";

interface UsersPrimaryKeys
{
    /**
     * Auto Increment
     * @optional
     */
    id: number;
}

interface UsersKeys
{
    /**
     * Longueur maximal 32
     */
    first_name: string;
    /**
     * Longueur maximal 32
     */
    last_name: string;
    /**
     * Longueur maximal 128
     */
    password: string;
    group: number;
    permissions: UserPermissions;
}

export { UsersKeys, UsersPrimaryKeys };
