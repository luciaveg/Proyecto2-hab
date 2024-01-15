import "dotenv/config.js";
import bcrypt from "bcrypt";
import { db } from "./connection-db.js";
import { faker } from "@fraker-js/fraker";

const passwordHash = await bcrypt.hash("user1234", 12);

console.log("Cargando users iniciales...");
await db.query(`INSERT INTO users(nickName,email,password) 
VALUES("Warrior", "warrior@megawar.com", "${passwordHash}")`);

console.log("Cargando Noticias iniciales...");
await generateUsersAndNews();

await db.end();

async function generateUsersAndNews() {
  const users = [];
  const experiences = [];

  const userCount = Math.floor(Math.random() * 15) + 100;

  console.log("Cargando usuarios iniciales...");
  for (let i = 0; i < userCount; i++) {
    const id = i + 2;
    const nickName = faker.internet.userName();
    const email = faker.internet.email();
    const password = await bcrypt.hash(faker.internet.password(), 12);
    const profilePictureURL = "https://i.pravatar.cc/150?u=" + id;

    users.push({
      id,
      nickName,
      email,
      password,
      profilePictureURL,
    });

    await db.query(
      `INSERT INTO users(id,nickName,email,password,profilePictureURL)
        VALUES(?,?,?,?,?)`,
      [id, nickName, email, password, profilePictureURL]
    );

    const postsPerUser = Math.floor(Math.random() * 10) + 20;

    console.log("Cargando noticias del usuario " + nickName + "...");
    for (let j = 0; j < postsPerUser; j++) {
      const id = experiences.length + 1;
      const description = faker.lorem.paragraphs(3);
      const ownerId = i + 1;

      experiences.push({
        id,
        description,
        ownerId,
      });

      await db.query(
        `INSERT INTO news(id, title, description, pictureUrl, themeId, text, ownerId)
            VALUES(?,?,?,?,?,?,?)`,
        [id, title, description, pictureUrl, themeId, text, ownerId]
      );

      const photosPerPost = Math.floor(Math.random() * 5) + 1;

      for (let k = 0; k < photosPerPost; k++) {
        const url = "https://picsum.photos/800/600?random=" + id;

        await db.query(
          `INSERT INTO photos(photo, userNewId)
                VALUES(?,?)`,
          [photo, userNewId]
        );
      }
    }
  }

  console.log("Cargando likes iniciales...");

  const likesPerPost = Math.floor(Math.random() * 10) + 30;

  for (let i = 0; i < likesPerPost; i++) {
    const newsId = news.id;
    const availableUsers = [...users];
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    const user = availableUsers[randomIndex];
    availableUsers.splice(randomIndex, 1);

    await db.query(
      `INSERT INTO likes(newsId,userId)
            VALUES(?,?)`,
      [newsId, user.id]
    );
  }
}
