import NanoDB from "./nano";

const nano = new NanoDB("./node-storage.db");
const users = nano.collection("users");

// Insert
const id = users.insert({ name: "Kichu", role: "Dev" });

// Find
const results = users.findById(id)
console.log("Found:", results);

users.updateById(id, { name: "piku", role: "ble", blu: "ble" });

{
  const results = users.findById(id)
  console.log("Found:", results);
}

users.deleteById(id)

{
  const results = users.findById(id)
  console.log("Found:", results);
}


// Cleanup
nano.close();
