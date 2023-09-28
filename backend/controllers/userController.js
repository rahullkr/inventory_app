const registerUser = (req,res) => {
    if(!req.body.email){
        res.status(400);
            throw new Error('Please enter the email');
    }
    res.send('register user');
}

module.exports = registerUser;