const Thought = require("../models/Thought");
const User = require("../models/User");

const { Op } = require("sequelize");

module.exports = class ThoughtController {
  static async showThoughts(req, res) {
    let search = "";

    if (req.query.search) {
      search = req.query.search;
    }

    let order = "DESC";

    if (req.query.order === "old") {
      order = "ASC";
    } else {
      order = "DESC";
    }

    const thoughtsData = await Thought.findAll({
      include: User,
      where: {
        title: { [Op.like]: `%${search}%` },
      },
      order: [["createdAt", order]],
    });

    const thoughts = thoughtsData.map((result) => result.get({ plain: true }));

    let thoughtsQty = thoughts.length;

    if (thoughtsQty === 0) {
      thoughtsQty = false;
    }

    res.render("thoughts/home", { thoughts, search, thoughtsQty });
  }

  static async dashboard(req, res) {
    const userId = req.session.userid;

    const user = await User.findOne({
      where: {
        id: userId,
      },
      include: Thought, // aqui relaciona a tabela de pensamentos com o id do usuário - aula 179
      plain: true, // aqui vem só os dados interessantes para fazer 'for each' no array - aula 179
    });

    // check if user exists
    if (!user) {
      res.redirect("/login");
    }

    const thoughts = user.Thoughts.map((result) => result.dataValues); // aqui pega apenas os dados necessários - aula 179

    let emptyThoughts = false;

    if (thoughts.length === 0) {
      emptyThoughts = true;
    }
    res.render("thoughts/dashboard", { thoughts, emptyThoughts });
  }

  static createThought(req, res) {
    res.render("thoughts/create");
  }

  static async createThoughtSave(req, res) {
    const thought = {
      title: req.body.title,
      UserId: req.session.userid,
    };

    try {
      await Thought.create(thought);

      req.flash("message", "Pensamento criado com sucesso!");

      req.session.save(() => {
        res.redirect("/thoughts/dashboard");
      });
    } catch (error) {
      console.log("Aconteceu um erro:" + error);
    }
  }

  static async removeThought(req, res) {
    const id = req.body.id;
    const UserId = req.session.userid;

    try {
      await Thought.destroy({ where: { id: id, UserId: UserId } });
      req.flash("message", "Pensamento removido com sucesso!");

      req.session.save(() => {
        res.redirect("/thoughts/dashboard");
      });
    } catch (error) {
      console.log("Aconteceu um erro ao remover:" + error);
    }
  }

  static async updateThought(req, res) {
    const id = req.params.id;

    const thought = await Thought.findOne({ where: { id: id }, raw: true });

    res.render("thoughts/edit", { thought });
  }

  static async updateThoughtSave(req, res) {
    const id = req.body.id;

    const thought = {
      title: req.body.title,
    };

    try {
      await Thought.update(thought, { where: { id: id } });
      req.flash("message", "Pensamento atualizado com sucesso!");

      req.session.save(() => {
        res.redirect("/thoughts/dashboard");
      });
    } catch (error) {
      console.log("Aconteceu um erro ao atualizar:" + error);
    }
  }
};
