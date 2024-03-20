import React, {useRef} from 'react';
import { BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import Loading from './Loading';
import Error from './Error';

export default ()=>{
  // BOM 구조
  let web = useRef(null);
  BackHandler.addEventListener("hardwareBackPress",(e)=>{
    // 뒤로가기 버튼 눌렀을때 동작
    web.postMessage("HistoryBack");
    return true;
  });
  return <WebView
    ref={_ref=>web=_ref}
    source={{uri:"http://192.168.100.178:3000/app"}}
    renderLoading={()=><Loading/>}
    startInLoadingState
    renderError={()=><Error/>}
    injectedJavaScript={`
      document.addEventListener("message", (e)=>{
        if(e.data == 'HistoryBack') window.history.back();
        // e.data == 받아온 데이터
        // window.ReactNativeWebview.postMessage() == 정보 전송 함수
      })
    `}
    onMessage={(e)=>{
      // e.nativeEvent.data == 받아온 데이터
    }}
  />
}