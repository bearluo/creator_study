/**
 * Creator 音频源适配器
 */

import { AudioSource } from 'cc';
import { IAudioSource } from '@bl-framework/core';

/**
 * Creator 音频源适配器
 */
export class CreatorAudioSource implements IAudioSource {
    private source: AudioSource;
    
    constructor(source: AudioSource) {
        this.source = source;
    }
    
    play(): void {
        this.source.play();
    }
    
    pause(): void {
        this.source.pause();
    }
    
    stop(): void {
        this.source.stop();
    }
    
    setVolume(volume: number): void {
        this.source.volume = volume;
    }
    
    /**
     * 获取 Creator 原生音频源（用于需要直接访问 Creator API 的场景）
     */
    get nativeSource(): AudioSource {
        return this.source;
    }
}

