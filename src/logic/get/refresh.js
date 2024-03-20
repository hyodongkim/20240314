(await import("dotenv")).default.config({path:'./.env'});
export default (req,res,next)=>{
    res.send(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta http-equiv='refresh' content="0;url=http://${process.env.DOMAIN}${process.env.APP_BASE}"/>
        </head>
        <body></body>
    </html>
    `)
}