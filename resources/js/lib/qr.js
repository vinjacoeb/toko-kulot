/**
 * Encoder QR mandiri — mode byte, koreksi galat level L, versi 1–20.
 *
 * Dipakai `QrisPanel` untuk merender `qr_string` QRIS dari server
 * (docs/kontrak-props.md §7.7: "frontend merender QR dari `qr_string` bila
 * `qris_url` null"). Tanpa pustaka luar — tabel RS/blok di bawah diambil dari
 * ISO/IEC 18004 dan diverifikasi ulang oleh scripts/verify-qr (jsQR).
 */

const EC_LEVEL_BITS = 1; // 01 = level koreksi L

// [totalCodewords, eccPerBlok, [[jumlahBlok, dataPerBlok], ...]]
const RS_BLOCKS = {
    1: [26, 7, [[1, 19]]],
    2: [44, 10, [[1, 34]]],
    3: [70, 15, [[1, 55]]],
    4: [100, 20, [[1, 80]]],
    5: [134, 26, [[1, 108]]],
    6: [172, 18, [[2, 68]]],
    7: [196, 20, [[2, 78]]],
    8: [242, 24, [[2, 97]]],
    9: [292, 30, [[2, 116]]],
    10: [346, 18, [[2, 68], [2, 69]]],
    11: [404, 20, [[4, 81]]],
    12: [466, 24, [[2, 92], [2, 93]]],
    13: [532, 26, [[4, 107]]],
    14: [581, 30, [[3, 115], [1, 116]]],
    15: [655, 22, [[5, 87], [1, 88]]],
    16: [733, 24, [[5, 98], [1, 99]]],
    17: [815, 28, [[1, 107], [5, 108]]],
    18: [901, 30, [[5, 120], [1, 121]]],
    19: [991, 28, [[3, 113], [4, 114]]],
    20: [1085, 28, [[3, 107], [5, 108]]],
};

// Titik tengah pola penyelaras per versi.
const ALIGN = {
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
    11: [6, 30, 54],
    12: [6, 32, 58],
    13: [6, 34, 62],
    14: [6, 26, 46, 66],
    15: [6, 26, 48, 70],
    16: [6, 26, 50, 74],
    17: [6, 30, 54, 78],
    18: [6, 30, 56, 82],
    19: [6, 30, 58, 86],
    20: [6, 34, 62, 90],
};

const remainderBits = (version) => (version === 1 ? 0 : version <= 6 ? 7 : version <= 13 ? 0 : 3);

// --- Aritmetika GF(256), polinomial primitif 0x11D -------------------------

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(function initGalois() {
    let x = 1;
    for (let i = 0; i < 255; i += 1) {
        EXP[i] = x;
        LOG[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
})();

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

function rsGenerator(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i += 1) {
        const next = new Array(poly.length + 1).fill(0);
        for (let j = 0; j < poly.length; j += 1) {
            next[j] ^= poly[j];
            next[j + 1] ^= gfMul(poly[j], EXP[i]);
        }
        poly = next;
    }
    return poly;
}

function rsRemainder(data, generator) {
    const res = new Array(generator.length - 1).fill(0);
    data.forEach((byte) => {
        const factor = byte ^ res[0];
        res.shift();
        res.push(0);
        for (let i = 0; i < res.length; i += 1) res[i] ^= gfMul(generator[i + 1], factor);
    });
    return res;
}

// --- Bit pembantu ----------------------------------------------------------

const lengthBits = (version) => (version < 10 ? 8 : 16);

function dataCodewords(version) {
    const [, , groups] = RS_BLOCKS[version];
    return groups.reduce((sum, [count, per]) => sum + count * per, 0);
}

function byteCapacity(version) {
    return Math.floor((dataCodewords(version) * 8 - 4 - lengthBits(version)) / 8);
}

function pickVersion(byteLength) {
    for (let version = 1; version <= 20; version += 1) {
        if (byteCapacity(version) >= byteLength) return version;
    }
    return null;
}

function toCodewords(bytes, version) {
    const bits = [];
    const push = (value, length) => {
        for (let i = length - 1; i >= 0; i -= 1) bits.push((value >> i) & 1);
    };

    push(0b0100, 4); // mode byte
    push(bytes.length, lengthBits(version));
    bytes.forEach((byte) => push(byte, 8));

    const capacity = dataCodewords(version) * 8;
    push(0, Math.min(4, capacity - bits.length)); // terminator
    while (bits.length % 8 !== 0) bits.push(0);

    const codewords = [];
    for (let i = 0; i < bits.length; i += 8) {
        codewords.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0));
    }
    let padToggle = true;
    while (codewords.length < dataCodewords(version)) {
        codewords.push(padToggle ? 0xec : 0x11);
        padToggle = !padToggle;
    }
    return codewords;
}

function interleave(codewords, version) {
    const [, eccPerBlock, groups] = RS_BLOCKS[version];
    const generator = rsGenerator(eccPerBlock);
    const blocks = [];
    let offset = 0;
    groups.forEach(([count, per]) => {
        for (let i = 0; i < count; i += 1) {
            blocks.push(codewords.slice(offset, offset + per));
            offset += per;
        }
    });

    const eccBlocks = blocks.map((block) => rsRemainder(block, generator));
    const out = [];
    const maxData = Math.max(...blocks.map((b) => b.length));
    for (let i = 0; i < maxData; i += 1) {
        blocks.forEach((block) => {
            if (i < block.length) out.push(block[i]);
        });
    }
    for (let i = 0; i < eccPerBlock; i += 1) {
        eccBlocks.forEach((block) => out.push(block[i]));
    }
    return out;
}

// --- Matriks ---------------------------------------------------------------

const MASKS = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function formatBits(mask) {
    const data = (EC_LEVEL_BITS << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    return (((data << 10) | rem) ^ 0x5412) & 0x7fff;
}

function versionBits(version) {
    let rem = version;
    for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    return ((version << 12) | rem) & 0x3ffff;
}

function placeholderMatrix(version) {
    const size = version * 4 + 17;
    const modules = Array.from({ length: size }, () => new Array(size).fill(false));
    const fixed = Array.from({ length: size }, () => new Array(size).fill(false));
    const set = (row, col, dark) => {
        modules[row][col] = dark;
        fixed[row][col] = true;
    };

    const finder = (row0, col0) => {
        for (let dr = -1; dr <= 7; dr += 1) {
            for (let dc = -1; dc <= 7; dc += 1) {
                const row = row0 + dr;
                const col = col0 + dc;
                if (row < 0 || col < 0 || row >= size || col >= size) continue;
                const dark =
                    (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
                    (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
                    (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
                set(row, col, dark);
            }
        }
    };
    finder(0, 0);
    finder(0, size - 7);
    finder(size - 7, 0);

    for (let i = 8; i < size - 8; i += 1) {
        if (!fixed[6][i]) set(6, i, i % 2 === 0);
        if (!fixed[i][6]) set(i, 6, i % 2 === 0);
    }

    const centers = ALIGN[version] || [];
    const last = centers.length - 1;
    centers.forEach((row, i) => {
        centers.forEach((col, j) => {
            // Tiga sudut penanda tidak diberi pola penyelaras.
            if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
            for (let dr = -2; dr <= 2; dr += 1) {
                for (let dc = -2; dc <= 2; dc += 1) {
                    set(row + dr, col + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
                }
            }
        });
    });

    set(size - 8, 8, true); // modul gelap tetap

    const reserve = (row, col) => {
        if (!fixed[row][col]) set(row, col, false);
    };
    for (let i = 0; i < 9; i += 1) {
        reserve(8, i);
        reserve(i, 8);
    }
    for (let i = 0; i < 8; i += 1) {
        reserve(8, size - 1 - i);
        reserve(size - 1 - i, 8);
    }

    if (version >= 7) {
        const bits = versionBits(version);
        for (let i = 0; i < 18; i += 1) {
            const dark = ((bits >> i) & 1) === 1;
            const row = Math.floor(i / 3);
            const col = size - 11 + (i % 3);
            reserve(row, col);
            reserve(col, row);
            set(row, col, dark);
            set(col, row, dark);
        }
    }

    return { size, modules, fixed };
}

function placeData({ size, modules, fixed }, codewords) {
    const totalBits = codewords.length * 8;
    const bitAt = (index) => (index < totalBits ? ((codewords[index >> 3] >> (7 - (index & 7))) & 1) === 1 : false);

    let index = 0;
    for (let col = size - 1; col > 0; col -= 2) {
        const upward = ((size - 1 - col) / 2) % 2 === 0;
        for (let i = 0; i < size; i += 1) {
            const row = upward ? size - 1 - i : i;
            for (let k = 0; k < 2; k += 1) {
                const c = col - k;
                if (fixed[row][c]) continue;
                modules[row][c] = bitAt(index);
                index += 1;
            }
        }
    }
}

function applyMask({ modules, fixed }, mask) {
    const fn = MASKS[mask];
    for (let row = 0; row < modules.length; row += 1) {
        for (let col = 0; col < modules.length; col += 1) {
            if (!fixed[row][col] && fn(row, col)) modules[row][col] = !modules[row][col];
        }
    }
}

function writeFormat({ size, modules, fixed }, mask) {
    const bits = formatBits(mask);
    const bit = (i) => ((bits >> i) & 1) === 1;
    const set = (row, col, dark) => {
        modules[row][col] = dark;
        fixed[row][col] = true;
    };

    for (let i = 0; i <= 5; i += 1) set(i, 8, bit(i));
    set(7, 8, bit(6));
    set(8, 8, bit(7));
    set(8, 7, bit(8));
    for (let i = 9; i < 15; i += 1) set(8, 14 - i, bit(i));

    for (let i = 0; i < 8; i += 1) set(8, size - 1 - i, bit(i));
    for (let i = 8; i < 15; i += 1) set(size - 15 + i, 8, bit(i));
    set(size - 8, 8, true);
}

function penalty(modules) {
    const size = modules.length;
    let score = 0;

    // Aturan 1: deretan modul sewarna >= 5.
    for (let row = 0; row < size; row += 1) {
        let run = 1;
        for (let col = 1; col < size; col += 1) {
            if (modules[row][col] === modules[row][col - 1]) {
                run += 1;
                if (run === 5) score += 3;
                else if (run > 5) score += 1;
            } else run = 1;
        }
    }
    for (let col = 0; col < size; col += 1) {
        let run = 1;
        for (let row = 1; row < size; row += 1) {
            if (modules[row][col] === modules[row - 1][col]) {
                run += 1;
                if (run === 5) score += 3;
                else if (run > 5) score += 1;
            } else run = 1;
        }
    }

    // Aturan 2: blok 2×2 sewarna.
    for (let row = 0; row < size - 1; row += 1) {
        for (let col = 0; col < size - 1; col += 1) {
            const v = modules[row][col];
            if (v === modules[row][col + 1] && v === modules[row + 1][col] && v === modules[row + 1][col + 1]) {
                score += 3;
            }
        }
    }

    // Aturan 3: pola mirip penanda 1:1:3:1:1.
    const pattern = [true, false, true, true, true, false, true];
    const matches = (line, start) => {
        for (let i = 0; i < 7; i += 1) if (line[start + i] !== pattern[i]) return false;
        const before = start - 1 >= 0 ? line[start - 1] : null;
        const after = start + 7 < line.length ? line[start + 7] : null;
        return before !== true && after !== true;
    };
    const scanLine = (line) => {
        for (let i = 0; i + 7 <= line.length; i += 1) if (matches(line, i)) score += 40;
    };
    for (let row = 0; row < size; row += 1) scanLine(modules[row]);
    for (let col = 0; col < size; col += 1) scanLine(modules.map((row) => row[col]));

    // Aturan 4: keseimbangan modul gelap.
    let dark = 0;
    modules.forEach((row) => row.forEach((v) => {
        if (v) dark += 1;
    }));
    const percent = (dark * 100) / (size * size);
    score += Math.floor(Math.abs(percent - 50) / 5) * 10;
    return score;
}

/**
 * Matriks QR untuk sebuah teks (mode byte).
 * @returns {{ size: number, modules: boolean[][], version: number, mask: number }}
 */
export function qrMatrix(value) {
    const text = String(value ?? '');
    const bytes = Array.from(new TextEncoder().encode(text));
    const version = pickVersion(bytes.length);
    if (version === null) {
        throw new Error('QrCode: muatan melebihi kapasitas versi 20 level L (858 byte).');
    }

    const base = placeholderMatrix(version);
    placeData(base, interleave(toCodewords(bytes, version), version));

    let best = null;
    for (let mask = 0; mask < 8; mask += 1) {
        const candidate = {
            size: base.size,
            modules: base.modules.map((row) => row.slice()),
            fixed: base.fixed.map((row) => row.slice()),
        };
        applyMask(candidate, mask);
        writeFormat(candidate, mask);
        const score = penalty(candidate.modules);
        if (best === null || score < best.score) best = { score, mask, modules: candidate.modules };
    }

    return { size: base.size, modules: best.modules, version, mask: best.mask };
}

/** Modul gelap sebagai satu path SVG (1 unit = 1 modul). */
export function qrPath(matrix) {
    const { size, modules } = matrix;
    let d = '';
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            if (modules[row][col]) d += `M${col} ${row}h1v1h-1z`;
        }
    }
    return d;
}
