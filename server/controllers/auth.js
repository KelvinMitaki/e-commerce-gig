const route = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const { check, validationResult } = require("express-validator");
const passport = require("passport");

const User = require("../models/User");
const auth = require("../middlewares/is-auth");

const transporter = nodeMailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY
    }
  })
);
route.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);
route.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    try {
      req.session.isLoggedIn = true;
      req.session.user = req.user;
      res.redirect("/");
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/current_user", async (req, res) => {
  try {
    const user = req.session.user;
    const isLoggedIn = req.session.isLoggedIn;
    res.send({ user, isLoggedIn });
  } catch (error) {
    res.status(500).send(error);
  }
});
route.post(
  "/api/login",
  check("email").trim().isEmail().withMessage("Please enter a valid email"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Your password must be a minimun of six characters"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send(errors.array()[0].msg);
      }
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).send({ message: "No user with that email" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send({ message: "Passwords do not match" });
      }
      req.session.user = user;
      req.session.isLoggedIn = true;
      res.send(user);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
route.post(
  "/api/register",
  check("firstName")
    .trim()
    .isLength({ min: 3 })
    .withMessage(
      "Please enter your first name with a minimum of three characters"
    ),
  check("lastName")
    .trim()
    .isLength({ min: 3 })
    .withMessage(
      "Please enter your last name with a minimum of three characters"
    ),
  check("email").trim().isEmail().withMessage("Please enter a valid email"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Please enter a password with a minimum of six characters"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send(errors.array()[0].msg);
      }
      const {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
        number
      } = req.body;
      if (password !== confirmPassword) {
        return res.status(401).send({ message: "Passwords do not match" });
      }
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res
          .status(401)
          .send({ message: "A user with that email already exists" });
      }
      // **TODO**  CHECK IF EMAIL IS VALID VIA SENDGRID
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        number
      });
      const token = jwt.sign({ _id: user._id }, process.env.CONFIRM_EMAIL_JWT, {
        expiresIn: "1 hour"
      });
      // **TODO** FROM EMAIL TO BE CHANGED
      transporter.sendMail(
        {
          to: email,
          from: "kevinkhalifa911@gmail.com",
          subject: "Email Confirmation",
          html: `<html lang="en">
        <body>
            <h5 style="font-family: Arial, Helvetica, sans-serif;">Confirming Your Email</h5>
            <p style="font-family: Arial, Helvetica, sans-serif;">Please Click
                <a href=${process.env.EMAIL_CONFIRM_REDIRECT}/${token}>here</a> to confirm your email
            </p>
        </body>
        </html>`
        },
        (error, info) => {
          if (error) {
            console.log(error);
            return res.status(500).send(error);
          }
          console.log(info);
        }
      );
      await user.save();
      res.status(201).send({
        message:
          "An email has been sent to your email address, please check it to confirm your email"
      });
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.post(
  "/api/change/password",
  auth,
  check("currentPassword")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Please enter your current password"),
  check("newPassword")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Your new password must be atleast six characters"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).send(errors.array()[0].msg);
      }
      const { currentPassword, newPassword, confirmNewPassword } = req.body;
      const isMatch = await bcrypt.compare(
        currentPassword,
        req.session.user.password
      );
      if (!isMatch) {
        return res.status(401).send({
          message: "Your current password does not match with the provided one"
        });
      }
      if (newPassword !== confirmNewPassword) {
        return res.status(401).send({ message: "Passwords do not match" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      const updatedUser = await User.findByIdAndUpdate(req.session.user._id, {
        password: hashedPassword
      });

      res.send(updatedUser);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

route.get("/api/confirm/email/:emailToken", async (req, res) => {
  try {
    const { emailToken } = req.params;
    const decoded = jwt.verify(emailToken, process.env.CONFIRM_EMAIL_JWT);
    if (!decoded._id) {
      return res.status(401).send({ message: "Invalid token" });
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).send({ message: "No user with that email" });
    }
    user.verified = true;
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post("/api/logout", auth, (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        return res.redirect("/");
      }
    });
    res.send({ message: "Successfully logged out" });
  } catch (error) {
    res.status(500).send(error);
  }
});

route.post("/api/reset", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({ message: "No user with that email found" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30 minutes"
    });
    // **TODO** from email address to be fixed
    transporter.sendMail(
      {
        to: email,
        from: "kevinkhalifa911@gmail.com",
        subject: "Password Resetting",
        html: `<html lang="en">
          <body>
              <h5 style="font-family: Arial, Helvetica, sans-serif;">You requested for password reset</h5>
              <p style="font-family: Arial, Helvetica, sans-serif;">Please Click
                  <a href=${process.env.RESET_REDIRECT}/${token}>here</a> to reset your password
              </p>
          </body>
          </html>`
      },
      (error, info) => {
        if (error) console.log(error);
        console.log("Sending message info: ", info);
      }
    );
    res.send({ token });
  } catch (error) {
    res.status(500).send(error);
  }
});

route.get("/api/reset/:resetToken", async (req, res) => {
  try {
    const { resetToken } = req.params;
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded._id) {
      return res.status(401).send({ message: "Invalid Token" });
    }
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).send({ message: "No user found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});
route.post("/api/reset/:resetToken", async (req, res) => {
  try {
    const { resetToken } = req.params;
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (!decoded._id) {
      return res.status(401).send({ message: "Invalid Token" });
    }
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(decoded._id, {
      password: hashedPassword
    });
    res.send({ user, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = route;
