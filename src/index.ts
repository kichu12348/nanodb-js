import NanoDB from "./nano";

const nano = new NanoDB("./benchmark.db");
const users = nano.collection("benchmark_users");

const NUM_RECORDS = 50_000;
const NUM_OPS = 5_000;

console.log(`Starting benchmark...`);

// Insert
console.log(`Inserting ${NUM_RECORDS} records...`);
const startInsert = Date.now();
const ids = [];
for (let i = 0; i < NUM_RECORDS; i++) {
  ids.push(users.insert({ name: "User", index: i }));
}
console.log(`Insert took: ${Date.now() - startInsert}ms`);

// Find
console.log(`Finding ${NUM_OPS} random records...`);
const startFind = Date.now();
for (let i = 0; i < NUM_OPS; i++) {
  const id = ids[Math.floor(Math.random() * ids.length)];
  users.findById(id);
}
console.log(`Find took: ${Date.now() - startFind}ms`);

// Update
console.log(`Updating ${NUM_OPS} random records...`);
const startUpdate = Date.now();
for (let i = 0; i < NUM_OPS; i++) {
  const id = ids[Math.floor(Math.random() * ids.length)];
  users.updateById(id, { name: "Updated User", index: 999 });
}
console.log(`Update took: ${Date.now() - startUpdate}ms`);

// Delete
console.log(`Deleting ${NUM_OPS} random records...`);
const startDelete = Date.now();
for (let i = 0; i < NUM_OPS; i++) {
  // Pick random index
  const idx = Math.floor(Math.random() * ids.length);
  const id = ids[idx];
  users.deleteById(id);
  // Remove from arrays so we don't try to delete again
  ids[idx] = ids[ids.length - 1];
  ids.pop();
}
console.log(`Delete took: ${Date.now() - startDelete}ms`);

nano.close();
