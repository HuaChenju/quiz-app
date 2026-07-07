const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");


const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;


    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });


    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "PLAYER"
      }
    });


    res.json({
      message: "User created",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });


  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });


    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }


    const validPassword = await bcrypt.compare(
      password,
      user.password
    );


    if (!validPassword) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }


    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );


    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });


  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

module.exports = {
  register,
  login
};