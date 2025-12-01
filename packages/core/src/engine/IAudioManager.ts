/**
 * 音频管理器接口（可选）
 */

/**
 * 音频管理器接口
 */
export interface IAudioManager {
    /** 播放音效 */
    playEffect(clip: IAudioClip, volume?: number): IAudioSource;
    /** 播放背景音乐 */
    playMusic(clip: IAudioClip, loop?: boolean, volume?: number): IAudioSource;
    /** 设置音效音量 */
    setEffectVolume(volume: number): void;
    /** 设置音乐音量 */
    setMusicVolume(volume: number): void;
    /** 停止所有音频 */
    stopAll(): void;
}

/**
 * 音频剪辑接口
 */
export interface IAudioClip {
    /** 音频路径 */
    path: string;
    /** 音频数据 */
    data: any;
}

/**
 * 音频源接口
 */
export interface IAudioSource {
    /** 播放 */
    play(): void;
    /** 暂停 */
    pause(): void;
    /** 停止 */
    stop(): void;
    /** 设置音量 */
    setVolume(volume: number): void;
}

