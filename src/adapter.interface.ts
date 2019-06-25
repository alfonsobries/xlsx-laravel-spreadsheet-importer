
export interface DatabaseAdapter {
  connect(options: any): Promise<any>;
  close(): Promise<any>;
  dropTable(tableName: string): Promise<any>;
  createTable(tableName: string, columns: string[], id: string): Promise<any>;
  insertValues(tableName: string, columns: string[], values: string[][]): Promise<any>;
}
