export const errorNotFound = (req, res) => {
  res.status(404).send({
    status: "error",
    message: "Not found",
  });
};

export const errorMessage = (error, req, res, next) => {
  console.log(error);
  res.status(error.status || 500).send({
    status: "error",
    message: error.message,
  });
};
