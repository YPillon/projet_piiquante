const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => {
      res.status(201).json({
        message: "Sauce saved successfully!",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No such Sauce!"),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Requête non authentifiée!"),
      });
    }
    if (req.file) {
      const sauceObject = {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      };
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.updateOne(
          { _id: req.params.id },
          { $set: { ...sauceObject, _id: req.params.id } }
        )
          .then(() => {
            res.status(201).json({
              message: "Sauce updated with success!",
            });
          })
          .catch((error) => {
            res.status(400).json({
              error: error,
            });
          });
      });
    } else {
      const sauceObject = { ...req.body };
      Sauce.updateOne(
        { _id: req.params.id },
        { $set: { ...sauceObject, _id: req.params.id } }
      )
        .then(() => {
          res.status(201).json({
            message: "Sauce updated successfully!",
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: error,
          });
        });
    }
  });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    if (!sauce) {
      res.status(404).json({
        error: new Error("No such Sauce!"),
      });
    }
    if (sauce.userId !== req.auth.userId) {
      res.status(403).json({
        error: new Error("Unauthorized request!"),
      });
    } else {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    }
  });
};

exports.likeAndDislike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      function canLikeOrDislike() {
        if (
          sauce.usersLiked.find((userId) => userId === req.body.userId) !=
            undefined ||
          sauce.usersDisliked.find((userId) => userId === req.body.userId) !=
            undefined
        ) {
          return false;
        } else {
          return true;
        }
      }
      if (req.body.like == 1) {
        if (canLikeOrDislike() === true ) {
        sauce.likes += 1;
        sauce.usersLiked.push(req.body.userId);
        } else {
          res
        .status(400)
        .json({ error: `L'utilisateur a déja liké ou disliké !` });
        }
      }
      if (req.body.like == -1) {
        if (canLikeOrDislike() === true ) {
          sauce.dislikes += 1;
          sauce.usersDisliked.push(req.body.userId);
          } else {
            res
          .status(400)
          .json({ error: `L'utilisateur a déja liké ou disliké !` });
          }
      }
      if (req.body.like == 0) {
        if (
          sauce.usersLiked.find((userId) => userId === req.body.userId) !=
          undefined
        ) {
          sauce.likes -= 1;
        }
        if (
          sauce.usersDisliked.find((userId) => userId === req.body.userId) !=
          undefined
        ) {
          sauce.dislikes -= 1;
        }

        const removePreviousLike = sauce.usersLiked.filter(
          (userId) => userId != req.body.userId
        );
        sauce.usersLiked = removePreviousLike;

        const removePreviousDislike = sauce.usersDisliked.filter(
          (userId) => userId != req.body.userId
        );
        sauce.usersDisliked = removePreviousDislike;
      }
      sauce
        .save()
        .then(() => {
          res.status(201).json({
            message: "Like updated successfully!",
          });
        })
        .catch((error) => {
          res.status(400).json({
            error: error,
          });
        });
      res.status(200).json({ message: "Good!" });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
