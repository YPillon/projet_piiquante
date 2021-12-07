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
        error: new Error("Unauthorized request!"),
      });
    }
    if (req.file) {
      const sauceObject = {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      };
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            Sauce.updateOne(
              { _id: req.params.id },
              { $set: { ...sauceObject, _id: req.params.id } }
            )
              .then(() => {
                res.status(201).json({
                  message: "1 Sauce updated with success!",
                });
              })
              .catch((error) => {
                res.status(400).json({
                  error: error,
                });
              });
          });
        })
        .catch((error) => res.status(500).json({ error }));
    } else {
      const sauceObject = { ...req.body };
      Sauce.updateOne(
        { _id: req.params.id },
        { $set: { ...sauceObject, _id: req.params.id } }
      )
        .then(() => {
          res.status(201).json({
            message: "2 Sauce updated successfully!",
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
      if (req.body.like == 1) {
        if (
          sauce.usersLiked.find((userId) => userId === req.body.userId) !=
          undefined
        ) {
          res
            .status(400)
            .json({ message: "L'utilisateur a déjà liké cette sauce !" });
        } else {
          sauce.likes += 1;
          console.log("I like it !");
          sauce.usersLiked.push(req.body.userId);
        }
      }
      if (req.body.like == -1) {
        if (
          sauce.usersDisliked.find((userId) => userId === req.body.userId) !=
          undefined
        ) {
          res
            .status(400)
            .json({ message: "L'utilisateur a déjà disliké cette sauce !" });
        } else {
          sauce.dislikes += 1;
          console.log("I dislike it !");
          sauce.usersDisliked.push(req.body.userId);
        }
      }
      if (req.body.like == 0) {
        if (
          sauce.usersLiked.find((userId) => userId === req.body.userId) !=
          undefined
        ) {
          console.log("Like trouvé");
          sauce.likes -= 1;
        }
        if (
          sauce.usersDisliked.find((userId) => userId === req.body.userId) !=
          undefined
        ) {
          console.log("Dislike trouvé");
          sauce.dislikes -= 1;
        }

        const removePreviousLike = sauce.usersLiked.filter(
          (userId) => userId != req.body.userId
        );
        console.log("result1= " + removePreviousLike);
        sauce.usersLiked = removePreviousLike;

        const removePreviousDislike = sauce.usersDisliked.filter(
          (userId) => userId != req.body.userId
        );
        console.log("result2= " + removePreviousDislike);
        sauce.usersDisliked = removePreviousDislike;
      }
      console.log(sauce);
      sauce
        .save()
        .then(() => {
          res.status(201).json({
            message: "Like updated successfully!",
          });
        })
        .catch((error) => {
          res.status(408).json({
            error: error,
          });
        });
      res.status(200).json({ message: "Good!" });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
