import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "./db.js";

export const indexOt = async (req, res) => {
  try {
    const route = path.resolve("./public/index.html");
    const content = await fs.readFile(route, "utf8");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(content);
  } catch (error) {
    console.error("Error reading the index.html file", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
};

export const userInfo = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    const stringData = JSON.stringify(rows);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(stringData);
  } catch (error) {
    console.error("Database Error", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};

export const exportUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");

    if (rows.length === 0) {
      throw new Error("No user data found");
    }

    const headers = Object.keys(rows[0]).join(",");
    const lines = rows.map(user => 
      `${user.id},${user.name},${user.lastname},${user.address},${user.email},${user.dni},${user.age},${user.created_date},${user.number_phone}`
    ).join("\n");
    const content = `${headers}\n${lines}`;

    await fs.writeFile("users.csv", content);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Users exported successfully" }));
  } catch (error) {
    console.error("Error exporting users", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};

export const importUsers = async (req, res) => {
  try {
    const content = await fs.readFile("users.csv", "utf8");
    const lines = content.split("\n").slice(1);

    for (const line of lines) {
      const [id, name, lastname, address, email, dni, age, created_date, number_phone] = line.split(",");

      try {
        await pool.execute(
          'INSERT INTO users (name, lastname, address, email, dni, age, created_date, number_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [name.trim(), lastname.trim(), address.trim(), email.trim(), dni.trim(), age.trim(), created_date.trim(), number_phone.trim()]
        );
        console.log("The user was inserted successfully", name);
      } catch (error) {
        if (error.errno === 1062) {
          console.log("Duplicate entry, user not inserted:", name);
          continue;
        }
        throw error;
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Users imported successfully" }));
  } catch (error) {
    console.error("Error importing users", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};
