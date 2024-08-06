const API = {
    debug: false,
    parent: '',
    scale: 1,
    backgroundColor: '',
    transparent: false, // 在没设置backgroundColor的情况下，可以transparent：true让canvas背景透明
    cdn: '',
    event: {
        onStart: null, // 游戏开始
        onGameOver: null, // 游戏结束
        onProgress: null, // 游戏加载进度
        onComplete: null, // 游戏加载完成
        onMessage: null // 游戏过程中的各类通知
    }
    
}
export default API 