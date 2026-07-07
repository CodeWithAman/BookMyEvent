import User from "../models/user.model.js";

// register User
export const RegisterUser = async (req, res) => {
  const { name, email, password } = req.body;

  let userExists = await User.findOne({email})
  if(userExists){
    return res.status(400).json({error: 'User already exists'})
  }



  try {
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
