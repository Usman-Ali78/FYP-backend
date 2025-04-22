// const roleMiddleware = (roles)=>{
//   return (req, res, next)=>{
//     if(!roles.includes(req.user.userType)){
//       return res.status(403).json({message: "Access Denied, Insufiicient Permission"})
//     }
//     next()
//   }
// }

const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    // 1. Get role from the nested 'user' object
    const userRole = req.user?.user?.role || req.user?.role;
    
    // 2. Case-insensitive comparison
    if (!userRole || !requiredRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())) {
      return res.status(403).json({ 
        message: `Required role(s): ${requiredRoles.join(', ')}` 
      });
    }
    next();
  };
};
module.exports = roleMiddleware