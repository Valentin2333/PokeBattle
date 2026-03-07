export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const calcBaseStatTotal = (pokemon) =>
  pokemon?.stats?.reduce((sum, s) => sum + s.base_stat, 0) ?? 0;

export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const getSpriteUrl = (pokemon) =>
  pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
  pokemon?.sprites?.front_default ||
  null;
