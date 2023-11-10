const Card = require("../models/Card");

const getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    return res.send(cards);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
const createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    Card.create({ name, link, owner }).then((Card) => res.send({ data: Card }));
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .send({ message: "Ошибка валидации полей", ...error });
    }
  }
};

const deleteCard = async (req, res) => {
  try {
    const { idCard } = req.params; //получаем передаваемый через /:idCard

    Card.findByIdAndRemove(idCard).then((card) => res.send({ data: card }));
  } catch (error) {
    res.status(500).send({ message: "Произошла ошибка" });
  }
};

const likeCard = async (req, res) => {
  try {
    Card.findByIdAndUpdate(
      req.params.idCard,
      { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
      { new: true }
    ).then((Card) => res.send({ data: Card }));
  } catch (error) {
    res.status(500).send({ message: "Произошла ошибка" });
  }
};

const dislikeCard = async (req, res) => {
  try {
    Card.findByIdAndUpdate(
      req.params.idCard,
      { $pull: { likes: req.user._id } }, // убрать _id из массива
      { new: true }
    ).then((Card) => res.send({ data: Card }));
  } catch (error) {
    res.status(500).send({ message: "Произошла ошибка" });
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
