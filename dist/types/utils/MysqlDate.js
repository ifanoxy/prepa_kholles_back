"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateToMysqlDate = DateToMysqlDate;
exports.MysqlDateToDate = MysqlDateToDate;
function DateToMysqlDate(d = new Date()) {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function MysqlDateToDate(d = DateToMysqlDate()) {
    const date = new Date();
    const [year, month, day] = d.split('-').map(Number);
    date.setDate(day);
    date.setMonth(month - 1);
    date.setFullYear(year);
    return date;
}
