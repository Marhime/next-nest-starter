/**
 * Application Constants
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Jawg Maps Configuration
export const JAWG_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_JAWG_ACCESS_TOKEN || '';
export const JAWG_TILE_URL = `https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token=${JAWG_ACCESS_TOKEN}`;
export const JAWG_ATTRIBUTION =
  '<a href="https://www.jawg.io" target="_blank">&copy; Jawg Maps</a> | <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap</a> contributors';
