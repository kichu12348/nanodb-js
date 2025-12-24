import koffi from "koffi";
import path from "path";

// Automatically detect .dll (Windows) or .so (Linux/Mac)
const ext = process.platform === "win32" ? ".dll" : ".so";
const libPath = path.resolve(path.join(__dirname,"native"), "nanodb" + ext);

const lib = koffi.load(libPath);

// (Mapping C types to JS types)
const NanoInit = lib.func("NanoInit", "void", ["str"]);
const NanoClose = lib.func("NanoClose", "longlong", []);
const NanoGetCollections = lib.func("NanoGetCollections", "str", []);
const NanoCreateCollection = lib.func("NanoCreateCollection", "longlong", [
  "str",
]);

const NanoInsert = lib.func("NanoInsert", "longlong", ["str", "str"]);
const NanoInsertMany = lib.func("NanoInsertMany", "str", ["str", "str"]);

const NanoFind = lib.func("NanoFind", "str", [
  "str",
  "str",
  "longlong",
  "longlong",
]);
const NanoFindOne = lib.func("NanoFindOne", "str", ["str", "str"]);
const NanoFindById = lib.func("NanoFindById", "str", ["str", "longlong"]);

const NanoUpdateById = lib.func("NanoUpdateById", "str", [
  "str",
  "longlong",
  "str",
]);
const NanoUpdateMany = lib.func("NanoUpdateMany", "str", ["str", "str", "str"]);

const NanoDeleteById = lib.func("NanoDeleteById", "longlong", [
  "str",
  "longlong",
]);
const NanoDeleteMany = lib.func("NanoDeleteMany", "longlong", ["str", "str"]);

// --- 3. The Wrapper Classes ---

class Find {
  private collection: Collection;
  private query: any;
  private limitCount: number;
  private skipCount: number;

  constructor(collection: Collection, query: any) {
    this.collection = collection;
    this.query = query;
    this.limitCount = 0; // 0 means no limit
    this.skipCount = 0;
  }

  limit(n: number): this {
    this.limitCount = n;
    return this;
  }
  skip(n: number): this {
    this.skipCount = n;
    return this;
  }

  exec(): any[] {
    const queryStr = JSON.stringify(this.query);

    // Call C Function: NanoFind(colName, query, limit,skip)
    const resStr = NanoFind(this.collection.name, queryStr, this.limitCount,this.skipCount);

    if (!resStr) return [];
    return JSON.parse(resStr);
  }
}

class Collection {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  // Insert returns the new ID (number)
  insert(doc: any): number {
    const jsonStr = JSON.stringify(doc);
    const id = NanoInsert(this.name, jsonStr);
    if (id === -1) throw new Error(`Insert failed for collection ${this.name}`);
    return id;
  }

  // InsertMany returns array of IDs
  insertMany(docs: any[]): number[] {
    const jsonStr = JSON.stringify(docs);
    const resStr = NanoInsertMany(this.name, jsonStr);
    if (!resStr) throw new Error("InsertMany failed");
    return JSON.parse(resStr);
  }

  // Returns a Find builder chain
  find(query: any = {}): Find {
    return new Find(this, query);
  }

  // Returns a single document object or null
  findOne(query: any = {}): any | null {
    const queryStr = JSON.stringify(query);
    const resStr = NanoFindOne(this.name, queryStr);
    return resStr ? JSON.parse(resStr) : null;
  }

  // Returns document by ID
  findById(id: number): any | null {
    // Note: Your Go engine expects int64 (longlong), so we pass number directly
    const resStr = NanoFindById(this.name, id);
    return resStr ? JSON.parse(resStr) : null;
  }

  // Updates multiple docs based on query
  update(query: any, update: any): any[] {
    const qStr = JSON.stringify(query);
    const uStr = JSON.stringify(update);

    const resStr = NanoUpdateMany(this.name, qStr, uStr);
    return resStr ? JSON.parse(resStr) : [];
  }

  // Update specific document by ID
  updateById(id: number, update: any): any | null {
    const uStr = JSON.stringify(update);
    const resStr = NanoUpdateById(this.name, id, uStr);
    return resStr ? JSON.parse(resStr) : null;
  }

  // Delete by Query (returns count of deleted items)
  delete(query: any): number {
    const qStr = JSON.stringify(query);
    return NanoDeleteMany(this.name, qStr);
  }

  // Delete by ID (returns 1 for success, -1 for fail)
  deleteById(id: number): boolean {
    const res = NanoDeleteById(this.name, id);
    return res === 1;
  }
}

class NanoDB {
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    NanoInit(dbPath);
  }

  collection(name: string): Collection {
    const res = NanoCreateCollection(name);
    if (res === -1) {
      console.warn(`Warning: Issue loading/creating collection ${name}`);
    }
    return new Collection(name);
  }

  // List all collections in the DB
  listCollections(): string[] {
    const resStr = NanoGetCollections();
    return resStr ? JSON.parse(resStr) : [];
  }

  close(): void {
    const res = NanoClose();
    if (res !== 1) {
      console.error("❌ Error closing database.");
    }
  }
}

// Default export
export default NanoDB;
