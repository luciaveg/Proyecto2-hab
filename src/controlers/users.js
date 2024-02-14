import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db/create-pool.js";

const pool = db(process.env.MYSQL_DB);
export const registerUser = async (req, res, next) => {
  try {
    console.log(req.body);
    const { nickName, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const pool = db(process.env.MYSQL_DB);

    if (!nickName || !email || !hashedPassword) {
      throw new Error("Faltan Datos");
    }

    const [[maybeUserEmail]] = await pool.execute(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    if (maybeUserEmail) {
      throw new Error("Email en uso!");
    }

    const [[maybeUserNickName]] = await pool.execute(
      `SELECT * FROM users WHERE nickName = ? LIMIT 1`,
      [nickName]
    );
    if (maybeUserNickName) {
      throw new Error("NickName en uso");
    }
    if (maybeUserEmail === email && maybeUserNickName === nickName) {
      throw new Error("Registro no Válido");
    }
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

export const editUser = async (req, res, next) => {
  try {
    console.log("editando");
    const userId = req.params.id;

    const { nickName, email, password } = req.body;
    console.log(req.files);
    if (!nickName || !email || !password) {
      throw new Error("Faltan datos");
    }


    if (isNaN(userId)) {
      throw new Error("El Id debe ser un número");
    }
    const [result] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [
      userId,
    ]);
    if (!result.length) {
      throw new Error("Este usuario no Existe");
    }

    const user = req.userData;
    let { ownerId } = result[0];
    console.log("user:", user, "owner:", ownerId);
    if (user.id !== ownerId) {
      throw new Error("No estas logueado");
    }

    let photo = result[0].profilePictureURL;
    if (req.files?.photo) {
      let oldPhoto = photo;
      photo = await insertPhoto(req.files.photo);
      console.log(photo);
      fs.unlink(path.join(PUBLIC_DIR, oldPhoto));
    }
    let sql = `UPDATE users   SET nickName = ?, email = ?, password = ?, profilePictureURL=?
    WHERE id = ?`;
    await pool.execute(sql, [nickName, email, password, photo, userId]);
    
    
    res.json({
      message: "Usuario editado con éxito",
    });

  } catch (e) {
    next(e);
  }

  /*  jwt.verify(req.token, "secretKey", (err, authData) => {
    if (err) {
      res.sendStatus(403);
    } else {
      const editUser = req.params.userId;
      const updatedUser = req.body;

      res.json({
        status: "ok",
        message: "Usuario editado con éxito",
      });
    }
  });*/
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
