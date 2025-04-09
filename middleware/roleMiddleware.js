const roleMiddleware = (roles)=>{
  return (req, res, next)=>{
    if(!roles.includes(req.user.userType)){
      return res.status(403).json({message: "Access Denied, Insufiicient Permission"})
    }
    next()
  }
}

module.exports = roleMiddleware