/**
 * Creator 音频剪辑适配器
 */

import { AudioClip } from 'cc';
import { IAudioClip } from '@bl-framework/core';

/**
 * Creator 音频剪辑适配器
 */
export class CreatorAudioClip implements IAudioClip {
    private clip: AudioClip;
    
    constructor(clip: AudioClip) {
        this.clip = clip;
    }
    
    get path(): string {
        return this.clip.name || '';
    }
    
    get data(): any {
        return this.clip;
    }
    
    /**
     * 获取 Creator 原生音频剪辑（用于需要直接访问 Creator API 的场景）
     */
    get nativeClip(): AudioClip {
        return this.clip;
    }
}

