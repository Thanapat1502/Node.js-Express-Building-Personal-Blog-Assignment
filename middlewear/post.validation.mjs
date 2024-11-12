const postValidation = (req, res, next) => {
  const { title, image, category_id, description, content, status_id } =
    req.body;
  if (typeof title !== "string") {
    return res.status(401).json({ message: "Title must be string" });
  }
  if (typeof image !== "string") {
    return res.status(402).json({ message: "Image must be string" });
  }
  if (typeof category_id !== "number") {
    return res.status(401).json({ message: "Category_id must be number" });
  }
  if (typeof description !== "string") {
    return res.status(401).json({ message: "Description must be string" });
  }
  if (typeof content !== "string") {
    return res.status(401).json({ message: "Content must be string" });
  }
  if (typeof status_id !== "number") {
    return res.status(401).json({ message: "Status_id must be number" });
  }
  next();
};
export default postValidation;

// typeof(image) !== 'string'
// typeof(category_id) !== 'number'
// typeof(description) !== 'string'
// typeof(content) !== 'string'
// typeof(status_id) !== 'number'
