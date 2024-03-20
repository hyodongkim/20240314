import React, {useState} from 'react';
import {useInfo} from '../hook';

export default ()=>{
    let data = useInfo({type:'s', i:'lb'});
    let [number, numberChanger] = useState(0);
    return <div>
        {number}
        <button onClick={()=>numberChanger(number + 1)}>버튼</button>
        <form action='/api/logout' method="post">
            <button type="submit">로그아웃</button>
        </form>
        중요한거긴한데
        {`${data.result}`}
    </div>
}