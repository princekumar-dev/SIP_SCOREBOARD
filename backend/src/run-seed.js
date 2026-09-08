const { connectDb } = require("./db");
const { seedDatabase } = require("./seed");

if (require.main === module) {
  connectDb()
    .then(() => seedDatabase({ force: true }))
    .then((result) => {
      console.log(`Database seeded with ${result.tribes} curated tribes across ${result.venues} venues!`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seed error:", error);
      process.exit(1);
    });
}
