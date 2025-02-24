export type MysqlDate = `${number}-${number}-${number}`;

export function DateToMysqlDate(d: Date = new Date()): MysqlDate {
    return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
}

export function MysqlDateToDate(d: MysqlDate = DateToMysqlDate()): Date {
    const date = new Date();
    const [year, month, day] = d.split('-').map(Number);
    date.setDate(day);
    date.setMonth(month-1);
    date.setFullYear(year);
    return date;
}