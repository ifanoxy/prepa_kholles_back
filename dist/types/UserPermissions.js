"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPermissions = void 0;
var UserPermissions;
(function (UserPermissions) {
    UserPermissions[UserPermissions["DEFAULT"] = 1] = "DEFAULT";
    UserPermissions[UserPermissions["MODERATEUR"] = 2] = "MODERATEUR";
    UserPermissions[UserPermissions["MODERATRICE"] = 3] = "MODERATRICE";
    UserPermissions[UserPermissions["ADMINISTRATEUR"] = 4] = "ADMINISTRATEUR";
    UserPermissions[UserPermissions["ADMINISTRATRICE"] = 5] = "ADMINISTRATRICE";
    UserPermissions[UserPermissions["ENSEIGNANT"] = 6] = "ENSEIGNANT";
    UserPermissions[UserPermissions["ENSEIGNANTE"] = 7] = "ENSEIGNANTE";
})(UserPermissions || (exports.UserPermissions = UserPermissions = {}));
