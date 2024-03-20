(await import("dotenv")).default.config({path:'./.env'});
export default async (req,res,next)=>{
    const response = (data)=>{ res.send(JSON.stringify(data)); }
    switch(req.query.type.toLowerCase()){
        case "s":
            switch(req.query.i.toLowerCase()){
                case 'lb':
                    response({"result":req.user ? true : false});
                    break;
                default: response({"message":"404"});
            }
            break;
        default: response({"message":"404"});
    }
}