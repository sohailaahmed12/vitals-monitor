const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../User');

exports.signup=async(req,res)=>{
    const {email,password}=req.body;
    const existingUser=await User.findOne({email});
    if (existingUser){
        return res.status(400).json({error:' Email in use'});
    } 
    const hashedPassword=await bcrypt.hash(password,10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User created' });
}

exports.login=async(req,res)=>{
    const {email,password}=req.body;
    const user= await User.findOne({email});
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
}