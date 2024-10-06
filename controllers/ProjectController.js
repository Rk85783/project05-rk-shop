export const addProduct = (req, res) => {
  console.info("addProduct(): req.body:", req.body);
  const { name, price, quantity } = req.body;
  res.send("Ok");
};
