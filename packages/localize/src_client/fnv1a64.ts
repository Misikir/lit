/* @license
Copyright 2014 Travis Webb
SPDX-License-Identifier: MIT */

// This module is derived from the file:
// https://github.com/tjwebb/fnv-plus/blob/1e2ce68a07cb7dd4c3c85364f3d8d96c95919474/index.js#L530
//
// Changes:
// - Only the _hash64_1a_fast_utf function is included.
// - Converted to TypeScript ES module.
// - var -> let/const
//
// TODO(aomarks) Upstream improvements to https://github.com/tjwebb/fnv-plus/.

const hl: string[] = [];
for (let i = 0; i < 256; i++) {
  hl[i] = ((i >> 4) & 15).toString(16) + (i & 15).toString(16);
}

/**
 * Perform a FNV-1A 64-bit hash of the given string (encoded to UTF-8), and
 * return a hexadecimal digest (left zero padded to 16 characters).
 *
 * @see {@link http://tools.ietf.org/html/draft-eastlake-fnv-06}
 */
export function fnv1a64(str: string): string {
  const l = str.length;
  let c: number,
    i: number,
    t0 = 0,
    v0 = 0x2325,
    t1 = 0,
    v1 = 0x8422,
    t2 = 0,
    v2 = 0x9ce4,
    t3 = 0,
    v3 = 0xcbf2;

  for (i = 0; i < l; i++) {
    c = str.charCodeAt(i);
    if (c < 128) {
      v0 ^= c;
    } else if (c < 2048) {
      v0 ^= (c >> 6) | 192;
      t0 = v0 * 435;
      t1 = v1 * 435;
      t2 = v2 * 435;
      t3 = v3 * 435;
      t2 += v0 << 8;
      t3 += v1 << 8;
      t1 += t0 >>> 16;
      v0 = t0 & 65535;
      t2 += t1 >>> 16;
      v1 = t1 & 65535;
      v3 = (t3 + (t2 >>> 16)) & 65535;
      v2 = t2 & 65535;
      v0 ^= (c & 63) | 128;
    } else if (
      (c & 64512) == 55296 &&
      i + 1 < l &&
      (str.charCodeAt(i + 1) & 64512) == 56320
    ) {
      c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
      v0 ^= (c >> 18) | 240;
      t0 = v0 * 435;
      t1 = v1 * 435;
      t2 = v2 * 435;
      t3 = v3 * 435;
      t2 += v0 << 8;
      t3 += v1 << 8;
      t1 += t0 >>> 16;
      v0 = t0 & 65535;
      t2 += t1 >>> 16;
      v1 = t1 & 65535;
      v3 = (t3 + (t2 >>> 16)) & 65535;
      v2 = t2 & 65535;
      v0 ^= ((c >> 12) & 63) | 128;
      t0 = v0 * 435;
      t1 = v1 * 435;
      t2 = v2 * 435;
      t3 = v3 * 435;
      t2 += v0 << 8;
      t3 += v1 << 8;
      t1 += t0 >>> 16;
      v0 = t0 & 65535;
      t2 += t1 >>> 16;
      v1 = t1 & 65535;
      v3 = (t3 + (t2 >>> 16)) & 65535;
      v2 = t2 & 65535;
      v0 ^= ((c >> 6) & 63) | 128;
      t0 = v0 * 435;
      t1 = v1 * 435;
      t2 = v2 * 435;
      t3 = v3 * 435;
      t2 += v0 << 8;
      t3 += v1 << 8;
      t1 += t0 >>> 16;
      v0 = t0 & 65535;
      t2 += t1 >>> 16;
      v1 = t1 & 65535;
      v3 = (t3 + (t2 >>> 16)) & 65535;
      v2 = t2 & 65535;
      v0 ^= (c & 63) | 128;
    } else {
      v0 ^= (c >> 12) | 224;
      t0 = v0 * 435;
      t1 = v1 * 435;
      t2 = v2 * 435;
      t3 = v3 * 435;
      t2 += v0 << 8;
      t3 += v1 << 8;
      t1 += t0 >>> 16;
      v0 = t0 & 65535;
      t2 += t1 >>> 16;
      v1 = t1 & 65535;
      v3 = (t3 + (t2 >>> 16)) & 65535;
      v2 = t2 & 65535;
      v0 ^= ((c >> 6) & 63) | 128;
      t0 = v0 * 435;
      t1 = v1 * 435;
      t2 = v2 * 435;
      t3 = v3 * 435;
      t2 += v0 << 8;
      t3 += v1 << 8;
      t1 += t0 >>> 16;
      v0 = t0 & 65535;
      t2 += t1 >>> 16;
      v1 = t1 & 65535;
      v3 = (t3 + (t2 >>> 16)) & 65535;
      v2 = t2 & 65535;
      v0 ^= (c & 63) | 128;
    }
    t0 = v0 * 435;
    t1 = v1 * 435;
    t2 = v2 * 435;
    t3 = v3 * 435;
    t2 += v0 << 8;
    t3 += v1 << 8;
    t1 += t0 >>> 16;
    v0 = t0 & 65535;
    t2 += t1 >>> 16;
    v1 = t1 & 65535;
    v3 = (t3 + (t2 >>> 16)) & 65535;
    v2 = t2 & 65535;
  }

  return (
    hl[v3 >> 8] +
    hl[v3 & 255] +
    hl[v2 >> 8] +
    hl[v2 & 255] +
    hl[v1 >> 8] +
    hl[v1 & 255] +
    hl[v0 >> 8] +
    hl[v0 & 255]
  );
}
