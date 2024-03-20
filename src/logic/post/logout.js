(await import("dotenv")).default.config({path:'./.env'});
export default async (req,res,next)=>{
    if(req.logout) req.logout(()=>{});
    req.session.destroy();
    res.redirect(`${process.env.API_BASE}/refresh`);
};