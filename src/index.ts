import NanoDB from "./nano";

async function runDemo() {
  // Initialize the database
  const db = new NanoDB("demo.ndb");
  const movies = db.collection("movies");
  console.log("📂 Collection 'movies' loaded.\n");

  const docs = [
    {
      title: "The Batman",
      director: "Kichu",
      year: 2022,
      _embeddings: [0.9, 1.0, 0.1, 0.0],
    },
    {
      title: "Joker",
      director: "Advika Rajiv",
      year: 2019,
      _embeddings: [0.2, 1.0, 0.0, 0.1],
    },
    {
      title: "The Dark Knight",
      director: "Aswani Anoop",
      year: 2008,
      _embeddings: [0.9, 0.9, 0.2, 0.0],
    },
    {
      title: "Man of Steel",
      director: "Mahadevan Reji",
      year: 2013,
      _embeddings: [0.8, 0.4, 0.8, 0.0],
    },
    {
      title: "Wonder Woman",
      director: "Neil Oommen Renni",
      year: 2017,
      _embeddings: [0.8, 0.3, 0.4, 0.2],
    },
    {
      title: "Deadpool",
      director: "Kichu",
      year: 2016,
      _embeddings: [0.9, 0.2, 0.2, 0.9],
    },
    {
      title: "Guardians of the Galaxy",
      director: "Advika Rajiv",
      year: 2014,
      _embeddings: [0.8, 0.1, 0.8, 0.8],
    },
    {
      title: "The Flash",
      director: "Aswani Anoop",
      year: 2023,
      _embeddings: [0.7, 0.2, 0.9, 0.4],
    },
    {
      title: "Aquaman",
      director: "Mahadevan Reji",
      year: 2018,
      _embeddings: [0.7, 0.2, 0.5, 0.3],
    },
    {
      title: "Shazam!",
      director: "Neil Oommen Renni",
      year: 2019,
      _embeddings: [0.6, 0.1, 0.3, 0.9],
    },
    {
      title: "Zack Snyder's Justice League",
      director: "Kichu",
      year: 2021,
      _embeddings: [0.9, 0.7, 0.7, 0.0],
    },
    {
      title: "Batman v Superman",
      director: "Advika Rajiv",
      year: 2016,
      _embeddings: [0.8, 0.8, 0.4, 0.0],
    },
    {
      title: "The Suicide Squad",
      director: "Aswani Anoop",
      year: 2021,
      _embeddings: [0.8, 0.6, 0.2, 0.8],
    },
    {
      title: "Green Lantern",
      director: "Mahadevan Reji",
      year: 2011,
      _embeddings: [0.5, 0.1, 0.8, 0.5],
    },
    {
      title: "Watchmen",
      director: "Neil Oommen Renni",
      year: 2009,
      _embeddings: [0.7, 0.9, 0.6, 0.0],
    },
  ];

  // Insert all 15 documents at once
  const ids = movies.insertMany(docs);
  console.log(
    `Success! Inserted ${ids.length} documents. IDs: [${ids.join(", ")}]\n`,
  );

  console.log("Running Logical Query: Find movies from year >= 2020...");
  const recentMovies = movies.find({ year: { $gte: 2020 } }).exec();
  console.log(
    `Found ${recentMovies.length} movies:`,
    recentMovies.map((m) => m.title),
  );
  console.log("");

  // Target Vector: Looking for Pure Dark/Noir + Action [1.0, 1.0, 0.0, 0.0]
  console.log(
    "Running K-NN Vector Search (Target: 100% Dark/Noir & Action)...",
  );
  const targetVector = [1.0, 1.0, 0.0, 0.0];

  // Find top 8 nearest neighbors
  const nearestIds = movies.vectorSearch(targetVector, 8);
  console.log(
    `Engine returned Top 8 nearest document IDs: [${nearestIds.join(", ")}]`,
  );

  console.log("Recommended Movies based on Euclidean Distance:");
  const recommendedMovies = nearestIds.map((id) => {
    const doc = movies.findById(id);
    return `   -> ${doc.title} (Dir: ${doc.director})`;
  });
  console.log(recommendedMovies.join("\n"));
  console.log("");

  db.close();
}

runDemo();
