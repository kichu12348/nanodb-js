import NanoDB from './nano'

const nano = new NanoDB("./node-storage.db");
const users = nano.collection("users");

// Insert
// users.insert({ name: "Kichu", role: "Dev" });

// Find
const results = users.find().skip(0).exec()
console.log("Found:", results);

// Cleanup
nano.close();