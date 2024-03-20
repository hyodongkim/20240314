(await import("dotenv")).default.config({path:'./.env'});
export default async (req,res,next)=>{
    try{
        // 회원 가입 관련 코드
        res.redirect(process.env.LOGIN);
    } catch (e){ res.redirect(process.env.SIGNUP); }
};