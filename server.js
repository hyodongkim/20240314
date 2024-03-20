import express from 'express';
import session from 'express-session';
import redis from 'redis';
import connectRedis from 'connect-redis';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import multer from 'multer';
import { Strategy as localS } from 'passport-local';
import { Strategy as kakaoS } from 'passport-kakao';
import { Strategy as googleS } from 'passport-google-oauth20';
import { Strategy as naverS } from 'passport-naver-v2';
import sirv from 'sirv';
import compression from 'compression';
import fs from 'fs';

dotenv.config({path:"./.env", encoding:"UTF-8"});
const app = express({xPoweredBy:false});
app.set('view engine', 'ejs');
app.set('views', 'src/views');

const schemas = {};
const redisClient = redis.createClient({url:process.env.REDIS_URI});
mongoose.connect(process.env.MONGO_URI, {
    autoIndex:true,
    maxPoolSize:200,
    minPoolSize:50
});
redisClient.connect();
let models = fs.readdirSync("./src/models", {encoding:"utf-8"});
for(let key of models) schemas[key] = mongoose.model(key, (await import(`./src/models/${key}`)).default);
app.use(process.env.API_BASE, express.json());
app.use(process.env.API_BASE, express.raw());
app.use(process.env.API_BASE, express.text());
app.use(process.env.API_BASE, express.urlencoded({extended:true}));
app.use(session({
    secret:process.env.COOKIE_SECRET,
    resave:true,
    saveUninitialized:true,
    rolling:true,
    cookie:{
        maxAge:parseInt(process.env.MAX_AGE),
        secure:false
    },
    store: new connectRedis({
        prefix:"ssid:",
        ttl:parseInt(process.env.MAX_AGE),
        scanCount:100,
        client:redisClient
    })
}));
app.use(cors({
    origin:`https://${process.env.DOMAIN}`,
    methods:['get','post','put','delete'],
    allowedHeaders:['Content-Type'],
    exposedHeaders:['Content-Type'],
    maxAge:parseInt(process.env.MAX_AGE)
}));
app.use('/static', express.static('static', {
    dotfiles:'ignore',
    extensions:[],
    fallthrough:true,
    immutable:false,
    maxAge:parseInt(process.env.MAX_AGE),
    index:false,
    redirect:false
}));
app.use((req,res,next)=>{ req.mongo = schemas; next(); });
app.use(passport.initialize());
app.use(passport.session());

passport.use('local', new localS({
    usernameField:"id",
    passwordField:"pw",
    passReqToCallback:true
}, async (req, id, pw, done)=>{
    try{
        // 로그인 관련 기능
        done(null, undefined /** 유저 정보 */);
    } catch(e) { done(e); }
}));
passport.use('kakao', new kakaoS({
    clientID:process.env.KAKAO_ID,
    clientSecret:process.env.KAKAO_SECRET,
    callbackURL:process.env.KAKAO_CALLBACK,
    passReqToCallback:true
}, async(req, access, refresh, profile, done)=>{
    try{
        // 로그인 관련 기능
        done(null, undefined /** 유저 정보 */);
    } catch(e) { done(e); }
}));
passport.use('naver', new naverS({
    clientID:process.env.NAVER_ID,
    clientSecret:process.env.NAVER_SECRET,
    callbackURL:process.env.NAVER_CALLBACK,
    passReqToCallback:true
}, async(req, access, refresh, profile, done)=>{
    try{
        // 로그인 관련 기능
        done(null, undefined /** 유저 정보 */);
    } catch(e) { done(e); }
}));
passport.use('google', new googleS({
    clientID:process.env.GOOGLE_ID,
    clientSecret:process.env.GOOGLE_SECRET,
    callbackURL:process.env.GOOGLE_CALLBACK,
    passReqToCallback:true
}, async(req, access, refresh, profile, done)=>{
    try{
        // 로그인 관련 기능
        done(null, undefined /** 유저 정보 */);
    } catch(e) { done(e); }
}));
passport.serializeUser((req, data, done)=>{
    // 처음 로그인시
    done(null, data);
});
passport.deserializeUser((req,data,done)=>{
    // 로그인 이후 갱신시
    done(null, data);
});

app.post(process.env.LOCAL_CALLBACK, passport.authenticate('local',{
    successRedirect:process.env.HOME,
    failureRedirect:process.env.LOGIN
}));
app.get(process.env.NAVER_CALLBACK, passport.authenticate('naver',{
    successRedirect:process.env.HOME,
    failureRedirect:process.env.LOGIN
}));
app.get(process.env.KAKAO_CALLBACK, passport.authenticate('kakao',{
    successRedirect:process.env.HOME,
    failureRedirect:process.env.LOGIN
}));
app.get(process.env.GOOGLE_CALLBACK, passport.authenticate('google',{
    successRedirect:process.env.HOME,
    failureRedirect:process.env.LOGIN,
    scope:['profile','email']
}));

const imagesUploader = multer({
    storage:multer.diskStorage({
        destination:(req,file,done)=>{
            let now = new Date();
            if(!fs.existsSync(`static/images/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`))
                fs.mkdirSync(`static/images/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`, {recursive:true});
            done(null, `static/images/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`);
        },
        filename:(req,file,done)=>{
            done(null, 
                btoa(`${file.originalname}${process.env.COOKIE_SECRET}${new Date().toJSON()}`).slice(0,50) + 
                file.originalname.slice(file.originalname.lastIndexOf('.'))
            )
        }
    })
})
const videosUploader = multer({
    storage:multer.diskStorage({
        destination:(req,file,done)=>{
            let now = new Date();
            if(!fs.existsSync(`static/videos/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`))
                fs.mkdirSync(`static/videos/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`, {recursive:true});
            done(null, `static/videos/${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`);
        },
        filename:(req,file,done)=>{
            done(null, 
                btoa(`${file.originalname}${process.env.COOKIE_SECRET}${new Date().toJSON()}`).slice(0,50) + 
                file.originalname.slice(file.originalname.lastIndexOf('.'))
            )
        }
    })
})
app.post(process.env.API_BASE + `/upload/images`, imagesUploader.array("images", 50),
    (req,res,next)=>{ req.body = JSON.parse(JSON.stringify(req.body)); next(); },
    (req,res,next)=>{
        // 파일 업로드 관련 기능
    }
);
app.post(process.env.API_BASE + `/upload/videos`, videosUploader.array("videos", 10),
    (req,res,next)=>{ req.body = JSON.parse(JSON.stringify(req.body)); next(); },
    (req,res,next)=>{
        // 파일 업로드 관련 기능
    }
);

const templateBuild = process.env.TYPE == 'dev' ?
    undefined : 
    fs.readFileSync('./dist/client/index.html', {encoding:"utf-8"});
const ssrManifest = process.env.TYPE == 'dev' ?
    undefined : 
    fs.readFileSync('./dist/client/.vite/ssr-manifest.json', {encoding:"utf-8"});
const renderBuild = process.env.TYPE == 'dev' ?
    undefined :
    (await import("./dist/server/index-server.js")).default;
const vite = process.env.TYPE != 'dev' ?
    undefined :
    await (await import('vite')).createServer({
        server:{
            middlewareMode:true,
            watch:{
                usePolling:true,
                interval:100
            }
        },
        appType:"custom",
        base: process.env.APP_BASE
    });

if(process.env.TYPE == 'dev') app.use(process.env.APP_BASE, vite.middlewares);
else {
    app.use(process.env.APP_BASE, compression());
    app.use(process.env.APP_BASE, sirv('./dist/client', {extensions:[]}));
}

app.use(process.env.APP_BASE, async (req,res,next)=>{
    try{
        const url = req.originalUrl.replace(process.env.APP_BASE, "");
        let template = process.env.TYPE == 'dev' ?
            await vite.transformIndexHtml(url, fs.readFileSync('./index.html', {encoding:"utf-8"})) :
            templateBuild;
        let render = process.env.TYPE == 'dev' ?
            (await vite.ssrLoadModule('./src/index-server.jsx')).render :
            renderBuild;
        res.status(200).set({'Content-Type':'text/html'}).send(
            template.replace(
                process.env.CONTAINER_HOLDER,
                (await render(url, ssrManifest)).html
            )
        );
    } catch(e){ next(new Error("react")); }
});

let postLogics = fs.readdirSync("./src/logic/post", {encoding:"utf-8"});
let getLogics = fs.readdirSync("./src/logic/get", {encoding:"utf-8"});
for(let key of postLogics){
    app.post(process.env.API_BASE + `/${key.replace(".js","")}`, (await import(`./src/logic/post/${key}`)).default);
}
for(let key of getLogics){
    app.get(process.env.API_BASE + `/${key.replace(".js","")}`, (await import(`./src/logic/get/${key}`)).default);
}

app.use((req,res,next)=>{
    res.redirect(process.env.APP_BASE);
});

app.use((err,req,res,next)=>{
    if(err.message == 'react'){
        setTimeout(()=>{
            res.redirect(process.env.APP_BASE);
        }, 100);
    }
    else { res.render('error404'); }
})

app.listen(process.env.PORT, ()=>{
    console.log(`Port ${process.env.PORT} server open!`);
})