/**
 * Unit tests for description-finalization.ts
 * Covers Korean terminator fix and ensureTerminator/appendTerminator behavior.
 */
import { describe, it, expect } from 'vitest';

const {
  ensureTerminator,
  appendTerminator,
  ensureDescriptionTerminator
} = await import('../../scripts/aggregator/metadata/description-finalization.js');

describe('appendTerminator', () => {
  it('appends 。 for Japanese (CJK)', () => {
    const result = appendTerminator('テスト文章です', 'cjk', undefined, 'ja');
    expect(result).toMatch(/。$/);
  });

  it('appends 。 for Chinese (CJK)', () => {
    const result = appendTerminator('测试文章', 'cjk', undefined, 'zh');
    expect(result).toMatch(/。$/);
  });

  it('appends . (Western period) for Korean — NOT 。', () => {
    const result = appendTerminator('한국어 테스트 문장입니다', 'cjk', undefined, 'ko');
    expect(result).toMatch(/\.$/);
    expect(result).not.toMatch(/。$/);
  });

  it('appends . for Latin scripts', () => {
    const result = appendTerminator('This is a test', 'latin');
    expect(result).toMatch(/\.$/);
  });

  it('appends . for RTL scripts', () => {
    const result = appendTerminator('هذا اختبار', 'rtl');
    expect(result).toMatch(/\.$/);
  });

  it('CJK without lang defaults to 。', () => {
    const result = appendTerminator('テスト', 'cjk');
    expect(result).toMatch(/。$/);
  });
});

describe('ensureTerminator', () => {
  it('does not double-terminate Korean ending with .', () => {
    const input = '한국 의회에서의 중요한 투표 결과를 추적합니다.';
    const result = ensureTerminator(input, 'cjk', undefined, 'ko');
    expect(result).toBe(input);
    expect(result).not.toMatch(/。/);
  });

  it('does not double-terminate Japanese ending with 。', () => {
    const input = '日本のテストです。';
    const result = ensureTerminator(input, 'cjk', undefined, 'ja');
    expect(result).toBe(input);
  });

  it('appends . for Korean text missing terminator', () => {
    const input = '한국어 설명 텍스트';
    const result = ensureTerminator(input, 'cjk', undefined, 'ko');
    expect(result).toMatch(/\.$/);
    expect(result).not.toMatch(/。$/);
  });

  it('appends 。 for Japanese text missing terminator', () => {
    const input = '日本語の説明テキスト';
    const result = ensureTerminator(input, 'cjk', undefined, 'ja');
    expect(result).toMatch(/。$/);
  });

  it('handles Korean text ending with ! (Western exclamation)', () => {
    const input = '중요한 결과!';
    const result = ensureTerminator(input, 'cjk', undefined, 'ko');
    expect(result).toBe(input);
  });

  it('handles Korean text ending with ? (Western question)', () => {
    const input = '투표 결과는?';
    const result = ensureTerminator(input, 'cjk', undefined, 'ko');
    expect(result).toBe(input);
  });
});

describe('ensureDescriptionTerminator', () => {
  it('uses . for Korean', () => {
    const input = '한국어 메타 설명';
    const result = ensureDescriptionTerminator('ko', input);
    expect(result).toMatch(/\.$/);
    expect(result).not.toMatch(/。$/);
  });

  it('uses 。 for Japanese', () => {
    const input = '日本語メタ説明';
    const result = ensureDescriptionTerminator('ja', input);
    expect(result).toMatch(/。$/);
  });

  it('uses . for English', () => {
    const input = 'English meta description';
    const result = ensureDescriptionTerminator('en', input);
    expect(result).toMatch(/\.$/);
  });
});
