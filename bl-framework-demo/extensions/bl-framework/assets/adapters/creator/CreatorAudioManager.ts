/**
 * Creator 音频管理器适配器
 */

import { AudioClip, AudioSource, Node, director } from 'cc';
import { IAudioManager, IAudioClip, IAudioSource } from '@bl-framework/core';
import { CreatorAudioClip } from './CreatorAudioClip';
import { CreatorAudioSource } from './CreatorAudioSource';

/**
 * Creator 音频管理器适配器
 */
export class CreatorAudioManager implements IAudioManager {
    private bgmNode: Node | null = null;
    private bgmSource: AudioSource | null = null;
    private effectSources: Map<IAudioClip, AudioSource> = new Map();
    
    /**
     * 初始化音频管理器
     */
    init(): void {
        // 创建背景音乐节点
        if (!this.bgmNode) {
            this.bgmNode = new Node('_bgmNode');
            this.bgmSource = this.bgmNode.addComponent(AudioSource);
            this.bgmSource.loop = true;
            director.addPersistRootNode(this.bgmNode);
        }
    }
    
    /**
     * 播放音效
     */
    playEffect(clip: IAudioClip, volume?: number): IAudioSource {
        // 如果 clip 是 CreatorAudioClip，获取原生 clip
        const nativeClip = clip instanceof CreatorAudioClip ? clip.nativeClip : clip.data as AudioClip;
        
        // 创建音效节点
        const effectNode = new Node('_effectNode');
        const source = effectNode.addComponent(AudioSource);
        source.clip = nativeClip;
        if (volume !== undefined) {
            source.volume = volume;
        }
        source.play();
        
        // 缓存音频源
        this.effectSources.set(clip, source);
        
        return new CreatorAudioSource(source);
    }
    
    /**
     * 播放背景音乐
     */
    playMusic(clip: IAudioClip, loop?: boolean, volume?: number): IAudioSource {
        if (!this.bgmSource) {
            this.init();
        }
        
        // 如果 clip 是 CreatorAudioClip，获取原生 clip
        const nativeClip = clip instanceof CreatorAudioClip ? clip.nativeClip : clip.data as AudioClip;
        
        this.bgmSource!.clip = nativeClip;
        if (loop !== undefined) {
            this.bgmSource!.loop = loop;
        }
        if (volume !== undefined) {
            this.bgmSource!.volume = volume;
        }
        this.bgmSource!.play();
        
        return new CreatorAudioSource(this.bgmSource!);
    }
    
    /**
     * 设置音效音量
     */
    setEffectVolume(volume: number): void {
        this.effectSources.forEach(source => {
            source.volume = volume;
        });
    }
    
    /**
     * 设置音乐音量
     */
    setMusicVolume(volume: number): void {
        if (this.bgmSource) {
            this.bgmSource.volume = volume;
        }
    }
    
    /**
     * 停止所有音频
     */
    stopAll(): void {
        if (this.bgmSource) {
            this.bgmSource.stop();
        }
        this.effectSources.forEach(source => {
            source.stop();
        });
    }
}

