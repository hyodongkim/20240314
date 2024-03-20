import React, {useEffect, useState, useCallback} from 'react';
export default (option)=>{
    let {url, method, ...options} = option;
    url = url || '/info';
    method = method || 'get';
    let [data, dataChanger] = useState({});
    const handle = useCallback(async ()=>{
        let query = "";
        for(let key in options){ query += `${key}=${options[key]}&`; }
        dataChanger(await fetch(`http://192.168.100.178:3000/api${url}?${query.slice(0, -1)}`, {method:method})
        .then(v=>v.json()));
    });
    useEffect(()=>{
        handle();
    }, [handle]);
    return data;
}