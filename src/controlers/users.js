import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/create-pool.js";

export const registerUser = async (req, res, next) => {
  try {
    const { nickName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const pool = db(process.env.MYSQL_DB);

    await pool.execute(
      `INSERT INTO users(nickName, email, password) 
          VALUES (?, ?, ?)`,
      [nickName, email, hashedPassword]
    );

    res.status(200).send("Fué Registrado Exitosamente !");
  } catch (e) {
    next(e);
  }
};

export const editUser = (req, res) => {
  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const editUser = req.params.userId;
      const updatedUser = req.body;

      res.json({
        message: "Noticia editada con éxito",
      });
    }
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const pool = db(process.env.MYSQL_DB);

  const [result] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  const maybeUser = result[0];
  if (!maybeUser) {
    res.status(400).json({
      error: "Credenciales NO validas",
    });
    return;
  }

  const doesPasswordMatch = await bcrypt.compare(password, maybeUser.password);
  if (!doesPasswordMatch) {
    res.status(400).json({
      error: "Credenciales NO validas",
    });
    return;
  }

  const token = jwt.sign(
    {
      id: maybeUser.id,
      nickName: maybeUser.nickName,
      profilePictureURL: maybeUser.profilePictureURL,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "5d",
    }
  );
  res.status(200).json({
    token,
  });
};
