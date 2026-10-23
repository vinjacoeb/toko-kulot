/**
 * Shim 'react/jsx-runtime' untuk harness kartu t_321bf03c (file uji lokal).
 * Dipakai esbuild saat --jsx=automatic: jsx/jsxs/Fragment diambil dari React asli
 * supaya harness tetap memakai element React yang sah.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const JR = require('react/jsx-runtime');

export const jsx = JR.jsx;
export const jsxs = JR.jsxs;
export const Fragment = JR.Fragment;
export default JR;
