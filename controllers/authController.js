const Joi = require("joi");
const HttpStatus = require("http-status-codes");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModels");
const Helpers = require("../Helpers/helpers");
const dbConfig = require("../config/secret");

exports.CreateUser = async (req, res) => {
  // const { username, email, password } = req.body;

  const schema = Joi.object().keys({
    username: Joi.string().min(5).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
  });

  const { error, value } = schema.validate(req.body);
  // console.log(value.email);

  if (error && error.details) {
    return res.status(HttpStatus.BAD_REQUEST).json({ msg: error.details });
  }

  const userEmail = await User.findOne({
    email: Helpers.lowerCase(req.body.email),
  });
  if (userEmail) {
    return res
      .status(HttpStatus.CONFLICT)
      .json({ message: "Email already exist" });
  }

  const userName = await User.findOne({
    username: Helpers.firstUpper(req.body.username),
  });
  if (userName) {
    return res
      .status(HttpStatus.CONFLICT)
      .json({ message: "Username already exist" });
  }

  return bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: "Error hashing password" });
    }
    const body = {
      username: Helpers.firstUpper(value.username),
      email: Helpers.lowerCase(value.email),
      password: hash,
    };
    console.log(body);

    User.create(body)
      .then((user) => {
        const token = jwt.sign({ data: user }, dbConfig.secret, {
          expiresIn: "5h",
        });
        res.cookie("auth", token);
        res
          .status(HttpStatus.CREATED)
          .json({ message: "User created successfully", user, token });
      })
      .catch((err) => {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured" });
      });
  });
};

exports.LoginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "No empty fields allowed" });
  }

  await User.findOne({ username: Helpers.firstUpper(username) }).then(
    (user) => {
      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Username not found' });
      }

      return bcrypt.compare(password, user.password).then((result) => {
        if (!result) {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Password is incorrect" });
        }
        const token = jwt.sign({ data: user }, dbConfig.secret, {
          expiresIn: "5h",
        });
        res.cookie("auth", token);
        return res
          .status(HttpStatus.OK)
          .json({ message: "Login successful", user, token });
      });
    }
  );
};
