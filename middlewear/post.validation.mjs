const postValidation = (req, res, next) => {
  return res.status(400).json({ message: "demo complate" });
};
export default postValidation;
