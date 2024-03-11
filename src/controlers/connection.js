const PORT = process.env.MYSQL_PORT;
export const connectionPort3000 =
  (PORT || 3000,
  () => {
    console.log(`Escuchando http://localhost:${PORT}`);
  });
