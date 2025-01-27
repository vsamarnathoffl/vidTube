import { app } from "./app.js";
import connectDB from "./db/index.js"
import dotenv from "dotenv";

dotenv.config({
  path: "src/.env",
});

const PORT  = process.env.PORT

connectDB()
.then(()=>{
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
})
.catch((err)=>{
    console.log("Mongodb connection error", err)
})