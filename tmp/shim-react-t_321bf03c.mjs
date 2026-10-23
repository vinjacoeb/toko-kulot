/**
 * Shim 'react' untuk harness interaksi kartu t_321bf03c (file uji lokal, bukan bagian aplikasi).
 *
 * Mengapa ada: halaman perlu dibaca sebagai pohon elemen + handler-nya dipanggil langsung
 * (tanpa jsdom, tanpa pustaka uji baru). Karena itu hook inti React diganti versi store
 * sederhana.
 *
 * Kunci hook = URUTAN pemanggilan dalam satu render pass (model React sebenarnya: urutan
 * hook wajib stabil). Karena itu harness hanya menjalankan SATU fungsi komponen per pass;
 * komponen anak tetap elemen React sehingga hook-nya tidak ikut jalan.
 *
 * Dipakai hanya lewat alias esbuild: --alias:react=./tmp/shim-react-t_321bf03c.mjs
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const R = require('react');

export const store = {
    hitung: 0,
    state: {},
    deps: {},
    ref: {},
    efek: {},
    tulisan: [],
    kotor: false,
    pass: 0,
};

/** Mulai render pass baru: counter hook direset, penanda kotor dibersihkan. */
export const mulaiPass = () => {
    store.hitung = 0;
    store.kotor = false;
    store.pass += 1;
};

/** Reset seluruh store — dipanggil harness di antara dua uji (kunci hook bersifat per-pass). */
export const bersihkanStore = () => {
    store.hitung = 0;
    store.state = {};
    store.deps = {};
    store.ref = {};
    store.efek = {};
    store.tulisan = [];
    store.kotor = false;
    store.pass = 0;
};

const berikut = (label) => {
    store.hitung += 1;

    return `${label}#${store.hitung}`;
};

export const useState = (awal) => {
    const kunci = berikut('state');

    if (!(kunci in store.state)) {
        store.state[kunci] = typeof awal === 'function' ? awal() : awal;
    }

    const set = (nilai) => {
        const sebelumnya = store.state[kunci];
        const berikut = typeof nilai === 'function' ? nilai(sebelumnya) : nilai;

        if (Object.is(sebelumnya, berikut)) return;

        store.state[kunci] = berikut;
        store.tulisan.push({ kunci, sebelumnya, berikut });
        store.kotor = true;
    };

    return [store.state[kunci], set];
};

export const useRef = (awal) => {
    const kunci = berikut('ref');

    if (!(kunci in store.ref)) store.ref[kunci] = { current: awal };

    return store.ref[kunci];
};

const depsSama = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    return a.every((nilai, i) => Object.is(nilai, b[i]));
};

export const useEffect = (efek, deps) => {
    const kunci = berikut('efek');
    const sebelumnya = store.efek[kunci];

    if (sebelumnya && depsSama(sebelumnya.deps, deps)) return;

    if (sebelumnya && typeof sebelumnya.bersihkan === 'function') sebelumnya.bersihkan();

    const bersihkan = efek();
    store.efek[kunci] = { deps, bersihkan: typeof bersihkan === 'function' ? bersihkan : null };
};

export const useMemo = (hitung, deps) => {
    const kunci = berikut('memo');

    if (kunci in store.deps && depsSama(store.deps[kunci], deps)) return store.ref[kunci].current;

    store.deps[kunci] = deps;
    store.ref[kunci] = { current: hitung() };

    return store.ref[kunci].current;
};

export const useCallback = (fn, deps) => useMemo(() => fn, deps);

export const useId = () => {
    const kunci = berikut('id');

    if (!(kunci in store.ref)) store.ref[kunci] = { current: `uji-${Object.keys(store.ref).length + 1}` };

    return store.ref[kunci].current;
};

export const useLayoutEffect = useEffect;
export const useInsertionEffect = useEffect;

export const startTransition = (fn) => fn();

export const Fragment = R.Fragment;
export const createElement = R.createElement;
export const cloneElement = R.cloneElement;
export const isValidElement = R.isValidElement;
export const Children = R.Children;
export const memo = R.memo;
export const forwardRef = R.forwardRef;
export const createContext = R.createContext;
export const useContext = R.useContext;
export const StrictMode = R.StrictMode;

export default R;
