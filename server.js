require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/connectDB");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
};

startServer();
